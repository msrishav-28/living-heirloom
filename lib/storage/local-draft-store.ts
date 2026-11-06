import { createStore, get, set, del } from 'idb-keyval'
import type {
  InterviewSession,
  GnaniSpeakerEmbedding,
  HeirloomCapsuleBundle,
} from '@/lib/product-contracts'
import {
  InterviewSessionSchema,
  GnaniSpeakerEmbeddingSchema,
  HeirloomCapsuleBundleSchema,
} from '@/lib/product-contracts'
let store: ReturnType<typeof createStore> | undefined
/** Local working drafts use the IndexedDB database named 'living-heirloom-drafts'. */
const db = () =>
  store ?? (store = createStore('living-heirloom-drafts', 'drafts'))
export const draftStore = {
  saveSession: (id: string, session: InterviewSession) =>
    set(`session:${id}`, session, db()),
  getSession: async (id: string) => {
    const value = await get<unknown>(`session:${id}`, db())
    return value === undefined ? undefined : InterviewSessionSchema.parse(value)
  },
  clearSession: (id: string) => del(`session:${id}`, db()),
  saveEmbedding: (id: string, embedding: GnaniSpeakerEmbedding) =>
    set(`embedding:${id}`, embedding, db()),
  getEmbedding: async (id: string) => {
    const value = await get<unknown>(`embedding:${id}`, db())
    return value === undefined
      ? undefined
      : GnaniSpeakerEmbeddingSchema.parse(value)
  },
  saveBundle: (bundle: HeirloomCapsuleBundle) =>
    set('latest-bundle', bundle, db()),
  getBundle: async () => {
    const value = await get<unknown>('latest-bundle', db())
    return value === undefined
      ? undefined
      : HeirloomCapsuleBundleSchema.parse(value)
  },
  saveAudio: (id: string, audio: Blob) => set(`audio:${id}`, audio, db()),
  getAudio: (id: string) => get<Blob>(`audio:${id}`, db()),
}
