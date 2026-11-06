import {
  HeirloomCapsuleBundleSchema,
  HeirloomCapsuleFileSchema,
  type HeirloomCapsuleBundle,
  type HeirloomCapsuleFile,
} from '@/lib/product-contracts'
import {
  Buffer,
  mainnetClient,
  timelockEncrypt,
  timelockDecrypt,
} from 'tlock-js'
export class TimelockFutureError extends Error {
  constructor() {
    super('This capsule has not reached its unlock date.')
    this.name = 'TimelockFutureError'
  }
}
export class WrongPassphraseError extends Error {
  constructor() {
    super('The passphrase is incorrect or the capsule has been damaged.')
    this.name = 'WrongPassphraseError'
  }
}
const hash =
  '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971' as const
const hex = (data: Uint8Array) =>
  Array.from(data, (b) => b.toString(16).padStart(2, '0')).join('')
const bytes = (value: string) =>
  Uint8Array.from(value.match(/../g) || [], (s) => parseInt(s, 16))
async function key(passphrase: string, salt: Uint8Array, usage: KeyUsage[]) {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  )
}
export async function sealHeirloom(
  bundle: HeirloomCapsuleBundle,
  passphrase: string,
  unlockAtUtc: Date,
): Promise<HeirloomCapsuleFile> {
  if (passphrase.length < 12)
    throw new Error('Use a passphrase of at least 12 characters')
  if (!Number.isFinite(unlockAtUtc.getTime()))
    throw new Error('Choose a valid unlock date')
  const parsed = HeirloomCapsuleBundleSchema.parse(bundle),
    salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12))
  // Round one is emitted at genesis. Round up so the beacon never unlocks early.
  const round = Math.max(
    1,
    Math.ceil((unlockAtUtc.getTime() / 1000 - 1692803367) / 3) + 1,
  )
  const header = {
    version: 1 as const,
    algorithm: 'AES-256-GCM' as const,
    iterations: 210000 as const,
    unlockAtUtc: unlockAtUtc.toISOString(),
    round,
    chainHash: hash,
    ivHex: hex(iv),
    saltHex: hex(salt),
  }
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: new TextEncoder().encode(JSON.stringify(header)),
      },
      await key(passphrase, salt, ['encrypt']),
      new TextEncoder().encode(JSON.stringify(parsed)),
    ),
  )
  const timelock = await timelockEncrypt(
    round,
    Buffer.from(encrypted.subarray(0, -16)),
    mainnetClient(),
  )
  return HeirloomCapsuleFileSchema.parse({
    ...header,
    authTagHex: hex(encrypted.subarray(-16)),
    timelock,
  })
}
export async function openHeirloom(
  input: HeirloomCapsuleFile,
  passphrase: string,
): Promise<HeirloomCapsuleBundle> {
  const file = HeirloomCapsuleFileSchema.parse(input)
  if (Date.now() < Date.parse(file.unlockAtUtc)) throw new TimelockFutureError()
  const ciphertext = await timelockDecrypt(file.timelock, mainnetClient())
  const { authTagHex, timelock, ...header } = file
  const full = new Uint8Array(ciphertext.length + 16)
  full.set(ciphertext)
  full.set(bytes(authTagHex), ciphertext.length)
  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: bytes(file.ivHex),
        additionalData: new TextEncoder().encode(JSON.stringify(header)),
      },
      await key(passphrase, bytes(file.saltHex), ['decrypt']),
      full,
    )
  } catch {
    throw new WrongPassphraseError()
  }
  return HeirloomCapsuleBundleSchema.parse(
    JSON.parse(new TextDecoder().decode(plaintext)),
  )
}
