'use client'

import { useState, useEffect, useCallback } from 'react'
import type { EmotionalTone } from '@/lib/voice-synth'
import {
  encryptHeirloomInBrowser,
  type EncryptedHeirloomPacket,
} from '@/lib/local-crypto'

export interface VoiceClipSample {
  id: string
  number: string
  title: string
  prompt: string
  durationSec: number
  captured: boolean
  recordedAt: string
  snrDb: number
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  role: 'speaker' | 'recipient' | 'both'
  birthYear: string
  crestType: 'oak' | 'olive' | 'lotus' | 'star' | 'compass'
  accentBg: 'parchment' | 'blue' | 'sage'
  voiceCalibrated: boolean
  gnaniModelId: string
  harmonicFidelity: number
  fundamentalHz: string
  nativeLanguage: string
  supportedLanguages: number
  bioNote: string
  clips: VoiceClipSample[]
}

export interface BiographerQuestion {
  id: string
  number: number
  chapter: string
  prompt: string
  detectedProsody: string
  gnaniAdaptationNote: string
  spokenAnswer: string
  distilledLetter: string
  completed: boolean
  durationLabel: string
}

export interface HeirloomCapsule {
  id: string
  title: string
  speakerId: string
  speakerName: string
  speakerRelation: string
  recipientId: string
  recipientName: string
  milestoneLabel: string
  unlockDate: string
  createdAt: string
  languageCode: string
  languageName: string
  tone: EmotionalTone
  toneLabel: string
  message: string
  isSealed: boolean
  passphraseHint: string
  waveform: number[]
  encryption: EncryptedHeirloomPacket
}

export interface GnaniLanguageOption {
  code: string
  speechLang: string
  name: string
  nativeName: string
  region: string
  sampleBlessing: string
}

// Exactly 10 languages: 9 Indic + English. This is what Gnani AI supports.
export const GNANI_LANGUAGES: GnaniLanguageOption[] = [
  {
    code: 'EN',
    speechLang: 'en-IN',
    name: 'English',
    nativeName: 'English',
    region: 'India · Original Timbre',
    sampleBlessing:
      'Whenever life feels noisy or uncertain, close your eyes for a moment and remember that you are deeply loved, and you carry our family\'s quiet resilience inside you.',
  },
  {
    code: 'HI',
    speechLang: 'hi-IN',
    name: 'Hindi',
    nativeName: 'Hindi',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jab bhi jeevan mein shor ya uljhan mehsoos ho, ek pal ke liye aankhein band karo aur yaad rakho ki humara pyaar aur aashirwad hamesha tumhare saath hai.',
  },
  {
    code: 'TA',
    speechLang: 'ta-IN',
    name: 'Tamil',
    nativeName: 'Tamizh',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Vaazhkaiyil eppodhu thanimaiyo thayakkamo vandhaalum, oru nimidam kangalai moodi, unudaiya kudumbathin anbu eppodhum unakkul irukkiradhu endru ninaivil kol.',
  },
  {
    code: 'KN',
    speechLang: 'kn-IN',
    name: 'Kannada',
    nativeName: 'Kannada',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jeevanadalli yaavude gondala athavairabeku endu anisidaga, ondu kshana kannu muchhi nenapisikolli: namma kutumbada preethi mattu dhairya sadaa nimmondigide.',
  },
  {
    code: 'TE',
    speechLang: 'te-IN',
    name: 'Telugu',
    nativeName: 'Telugu',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jeevithamlo eppudaina alasata kaligithe, okka kshanam kallu moosukuni mana kutumba premanu, mana peddala aashirvadaniki gurthunchuko.',
  },
  {
    code: 'ML',
    speechLang: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'Malayalam',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jeevithathil eppozhenkilum budhimuttukal thonnumbol, oru nimisham kannukaladachu nammude kudumbathinte snehavum karuthalum ninnodoppamundennu orkkuka.',
  },
  {
    code: 'MR',
    speechLang: 'mr-IN',
    name: 'Marathi',
    nativeName: 'Marathi',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jevha kadhi aayushyat gondhal kinva thakva jaanvel, tevha ek kshan dole mita aani lakshat theva ki aamche prem aani aashirwad sadaiva tumchya paathishi aahet.',
  },
  {
    code: 'BN',
    speechLang: 'bn-IN',
    name: 'Bengali',
    nativeName: 'Bangla',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jibon jokhoni kolaholpurno ba onishchit mone hobe, ek muhurter jonyo chokh bondho kore mone rekho tumi gobhirbhabe bhalobashar manush.',
  },
  {
    code: 'GU',
    speechLang: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'Gujarati',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jyare pan jeevanma shorana ya anishchitatana anubhav thay, tyare ek pal aankhein mindo ane yaad karo ke tamne deeply vahal chhe, ane amara parivarna dhairya tamara andhar rahelu chhe.',
  },
  {
    code: 'PA',
    speechLang: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'Punjabi',
    region: 'India · Gnani Indic Neural TTS',
    sampleBlessing:
      'Jado vi zindagi vich shor ya anishchitata mehsoos hove, ik pal layi aankhan band karo te yaad rakho ki tuhanu deeply pyar kita janda hai, te saade parivaar di himmat tuhade andar vasdi hai.',
  },
]

const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'krishnamurthy-venkataraman',
    name: 'Krishnamurthy Venkataraman',
    relation: 'Paternal Grandfather · Patriarch',
    role: 'speaker',
    birthYear: 'Born 1948 · Mylapore, Chennai',
    crestType: 'lotus',
    accentBg: 'sage',
    voiceCalibrated: true,
    gnaniModelId: 'gnani-indic-kv48-v3',
    harmonicFidelity: 99.6,
    fundamentalHz: '124 Hz Resonant Baritone',
    nativeLanguage: 'Tamil & Kannada',
    supportedLanguages: 10,
    bioNote:
      'Retired Sanskrit scholar and Carnatic vocalist from Mylapore. Preserved his voice with Gnani AI so grandchildren Priya and Arjun can hear ancestral blessings in Tamil, Kannada, Hindi, and English — across any milestone, any decade.',
    clips: [
      {
        id: 'kv-c1',
        number: '01',
        title: 'Courtyard Morning Cadence',
        prompt:
          '"The first rain on the red-clay courtyard always meant Paati was already pouring filter coffee in brass tumblers, and the whole verandah smelled of camphor and wet earth."',
        durationSec: 14,
        captured: true,
        recordedAt: 'Oct 14, 2026',
        snrDb: 43.9,
      },
      {
        id: 'kv-c2',
        number: '02',
        title: 'Multilingual Heritage Warmth',
        prompt:
          '"No matter which city you study in or which country you work in, the rhythm of our bhajans and our kindness travels inside your voice."',
        durationSec: 12,
        captured: true,
        recordedAt: 'Oct 14, 2026',
        snrDb: 42.7,
      },
      {
        id: 'kv-c3',
        number: '03',
        title: 'Timeless Benediction',
        prompt:
          '"Walk with humility, learn every language of the heart, and always keep our doorway open — to family, to strangers, to the unexpected guest."',
        durationSec: 13,
        captured: true,
        recordedAt: 'Oct 14, 2026',
        snrDb: 44.2,
      },
    ],
  },
  {
    id: 'savitri-krishnamurthy',
    name: 'Savitri Krishnamurthy',
    relation: 'Paternal Grandmother · Matriarch',
    role: 'speaker',
    birthYear: 'Born 1951 · Kumbakonam, Tamil Nadu',
    crestType: 'olive',
    accentBg: 'parchment',
    voiceCalibrated: true,
    gnaniModelId: 'gnani-indic-sk51-v3',
    harmonicFidelity: 99.3,
    fundamentalHz: '196 Hz Warm Contralto',
    nativeLanguage: 'Tamil',
    supportedLanguages: 10,
    bioNote:
      'Classical Bharatanatyam dancer and temple vocalist. Recorded three kitchen conversations so Priya hears Paati\'s voice on her graduation day — unhurried, warm, in Tamil and Hindi both.',
    clips: [
      {
        id: 'sk-c1',
        number: '01',
        title: 'Kolam & Morning Warmth',
        prompt:
          '"Every sunrise I drew a new kolam at the threshold — not just for beauty, but to tell the day: our home is ready, come blessings, come visitors, come grace."',
        durationSec: 13,
        captured: true,
        recordedAt: 'Oct 18, 2026',
        snrDb: 44.1,
      },
      {
        id: 'sk-c2',
        number: '02',
        title: 'Festival Laughter',
        prompt:
          '"You both ran into the pooja room with paint on your fingers from the rangoli, prouder of the mess than the pattern — and I let you, because that joy was the real offering."',
        durationSec: 12,
        captured: true,
        recordedAt: 'Oct 18, 2026',
        snrDb: 43.0,
      },
      {
        id: 'sk-c3',
        number: '03',
        title: 'Bedside Reassurance',
        prompt:
          '"You never have to earn my love, kanna. You already have all of it — on your brightest days and on your most ordinary Thursday afternoons."',
        durationSec: 13,
        captured: true,
        recordedAt: 'Oct 18, 2026',
        snrDb: 44.6,
      },
    ],
  },
  {
    id: 'rajan-mehta',
    name: 'Rajan Mehta',
    relation: 'Father · Archivist',
    role: 'both',
    birthYear: 'Born 1974 · Ahmedabad & Mumbai',
    crestType: 'compass',
    accentBg: 'blue',
    voiceCalibrated: true,
    gnaniModelId: 'gnani-indic-rm74-v3',
    harmonicFidelity: 99.1,
    fundamentalHz: '138 Hz Warm Tenor',
    nativeLanguage: 'Hindi & English',
    supportedLanguages: 10,
    bioNote:
      'Civil engineer and family archivist. Recording unhurried Sunday evening conversations for Priya\'s and Arjun\'s future milestones — in Hindi, Gujarati, and English.',
    clips: [
      {
        id: 'rm-c1',
        number: '01',
        title: 'Evening Chai Cadence',
        prompt:
          '"When the rains came in July, we\'d sit on the balcony with masala chai, and Amma would tell stories until the power cut — and somehow those dark evenings were the brightest ones."',
        durationSec: 13,
        captured: true,
        recordedAt: 'Oct 21, 2026',
        snrDb: 43.5,
      },
      {
        id: 'rm-c2',
        number: '02',
        title: 'Joyful Story Cadence',
        prompt:
          '"You both hid your report cards under the sofa cushion, then came out laughing — and I realised then that the grades mattered far less than that laughter."',
        durationSec: 12,
        captured: true,
        recordedAt: 'Oct 21, 2026',
        snrDb: 43.0,
      },
      {
        id: 'rm-c3',
        number: '03',
        title: 'Quiet Conviction',
        prompt:
          '"Be honest even when it costs you, keep your word even when no one is checking, and begin again without shame whenever you need to."',
        durationSec: 11,
        captured: true,
        recordedAt: 'Oct 21, 2026',
        snrDb: 44.3,
      },
    ],
  },
  {
    id: 'priya-mehta',
    name: 'Priya Mehta',
    relation: 'Daughter · Future Recipient',
    role: 'recipient',
    birthYear: 'Born 2002 · Architect in Training',
    crestType: 'star',
    accentBg: 'parchment',
    voiceCalibrated: false,
    gnaniModelId: 'pending-calibration',
    harmonicFidelity: 0,
    fundamentalHz: 'Recipient Profile',
    nativeLanguage: 'Hindi & English',
    supportedLanguages: 10,
    bioNote:
      'Primary recipient of Thatha\'s 2036 wedding morning capsule and Paati\'s graduation spoken letter. Architecture student at CEPT, Ahmedabad.',
    clips: [],
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    relation: 'Son · Milestone Recipient',
    role: 'recipient',
    birthYear: 'Born 2012 · Young Tabla Player',
    crestType: 'oak',
    accentBg: 'blue',
    voiceCalibrated: false,
    gnaniModelId: 'pending-calibration',
    harmonicFidelity: 0,
    fundamentalHz: 'Recipient Profile',
    nativeLanguage: 'Hindi & English',
    supportedLanguages: 10,
    bioNote:
      'Recipient of time-locked capsules scheduled for his 18th birthday (2030) and IIT entrance result day.',
    clips: [],
  },
]

const INITIAL_BIOGRAPHER_QUESTIONS: BiographerQuestion[] = [
  {
    id: 'q1',
    number: 1,
    chapter: 'The First Room of Safety',
    prompt:
      '"Take a slow breath. Think back to the first house or room where you felt completely safe as a child. What sound or scent takes you back there instantly?"',
    detectedProsody: 'Warm Nostalgia · 0.87x Relaxed Cadence',
    gnaniAdaptationNote:
      'Gnani AI sensed a soft exhale before speaking; maintaining unhurried acoustic pacing.',
    spokenAnswer:
      'It was my grandmother\'s kitchen in Kumbakonam. It smelled of camphor, fresh filter coffee, and the wet mud outside after rain. Every morning she would hum a Thyagaraja krithi while grinding the idli batter, and that sound — the stone grinder and her humming — is the safest sound I know.',
    distilledLetter:
      'Whenever the world feels too loud, build yourself a quiet corner like Paati\'s Kumbakonam kitchen — where warmth, patience, and familiar voices wait for you at dawn.',
    completed: true,
    durationLabel: '01:52',
  },
  {
    id: 'q2',
    number: 2,
    chapter: 'Recognising True Partnership',
    prompt:
      '"When you think about the person who became your life partner, what was the small, unremarkable afternoon when you suddenly knew: this is my person?"',
    detectedProsody: 'Smiling Overtone Lift · +12% Pitch Warmth',
    gnaniAdaptationNote:
      'Laughter grain detected mid-sentence. Prompting for the quiet emotional takeaway.',
    spokenAnswer:
      'Our auto broke down in a Bangalore downpour with two bags of Diwali mithai. Instead of worrying about the sweets, Meena opened the box right there on the footpath and started handing laddoos to the autowala and the nearby chaiwala. I knew then.',
    distilledLetter:
      'Choose the partner who turns a Bangalore downpour into an impromptu mithai distribution on a wet footpath — and still makes you feel like the luckiest person on the street.',
    completed: true,
    durationLabel: '02:18',
  },
  {
    id: 'q3',
    number: 3,
    chapter: 'The Sunday Morning Ritual',
    prompt:
      '"I heard a smile in your voice when you mentioned Sunday mornings. What was the one small ritual at home you hope your grandchildren still keep?"',
    detectedProsody: 'Nostalgic Warmth · Soft Laugh Detected',
    gnaniAdaptationNote:
      'Vocal cadence slowed by 15% on "Sunday morning." Deepening into sensory family tradition.',
    spokenAnswer:
      'Every Sunday Appa would make the first small dosa — always the crumpled, uneven test dosa — and give it to whoever was nearest, saying the imperfect ones are the most honest. We called it the "honest dosa." My children still ask for the honest dosa first.',
    distilledLetter:
      'Never forget your great-grandfather\'s Sunday morning rule: the first, imperfect, honest dosa goes to the person closest to you. Perfection is for guests; warmth is for family.',
    completed: true,
    durationLabel: '01:59',
  },
  {
    id: 'q4',
    number: 4,
    chapter: 'Navigating the Hardest Season',
    prompt:
      '"Take all the time you need — there is no rush. When that season felt heaviest, what quiet truth kept you anchored?"',
    detectedProsody: 'Emotional Tremor · 2.9s Hesitation Recognised',
    gnaniAdaptationNote:
      'Vulnerability recognised by Gnani AI prosody engine. Softened interviewer tone, removed time pressure.',
    spokenAnswer:
      'When we lost our savings in 2001 after the Gujarat earthquake relief work went wrong, I was terrified. Meena sold her gold bangles without telling me and said only: "We still have each other\'s hands." That was the whole answer.',
    distilledLetter:
      'If you ever face a season where the weight feels unbearable, remember that we stood there too. We lost things. We sold bangles. And we survived by holding on to each other. The storm always passes.',
    completed: true,
    durationLabel: '02:47',
  },
  {
    id: 'q5',
    number: 5,
    chapter: 'Forgiving Yourself Gently',
    prompt:
      '"We all carry mistakes that taught us humility. What is one lesson you learned the hard way that you hope spares your children unnecessary grief?"',
    detectedProsody: 'Steady Chest Resonance · Reflective',
    gnaniAdaptationNote:
      'Grounded baritone resonance; inviting practical life counsel.',
    spokenAnswer:
      'I worked too many late evenings in my thirties convincing myself that the extra project was for the family. Priya once told her school teacher that "Appa works late because he loves his computer." That broke something open in me. They did not want another certificate on the wall — they wanted me at the dinner table at seven.',
    distilledLetter:
      'Never trade an ordinary Tuesday dinner table for applause from strangers. Your presence — unhurried, without a phone — is the inheritance that never loses value.',
    completed: false,
    durationLabel: '02:11',
  },
  {
    id: 'q6',
    number: 6,
    chapter: 'The Unwritten Family Story',
    prompt:
      '"What is one story about your parents or grandparents that was never written down — one that would vanish from the world if you did not speak it today?"',
    detectedProsody: 'Archival Storytelling Cadence',
    gnaniAdaptationNote:
      'Preserving proper nouns and ancestral lineage markers via Gnani AI ASR.',
    spokenAnswer:
      'When my grandfather left for Rangoon in 1942, he sewed a small Tirupati locket into the lining of his coat so he would carry a piece of the temple with him. He never got it back — the coat was lost in a flood — but he said the locket had already done its work: it got him home.',
    distilledLetter:
      'You come from people who crossed borders with nothing but courage and a Tirupati locket stitched into a coat lining. Carry that quiet faith lightly.',
    completed: false,
    durationLabel: '02:24',
  },
  {
    id: 'q7',
    number: 7,
    chapter: 'Blessing Twenty Years Ahead',
    prompt:
      '"Imagine Priya or Arjun is listening to this in a quiet room twenty years from today. What do you want your voice to leave with them?"',
    detectedProsody: 'Full Vocal Resonance · Timeless Benediction',
    gnaniAdaptationNote:
      'Final session chapter. Ready for one-click distillation and AES-256 time-lock sealing.',
    spokenAnswer:
      'You never have to earn my pride, kanna. You already have all of it — on your grandest accomplishments and on the most ordinary Wednesday afternoon when nothing remarkable happened at all.',
    distilledLetter:
      'You never have to earn my pride, kanna. You already have all of it — on your grandest accomplishments and on the most ordinary Wednesday afternoon when nothing remarkable happened at all.',
    completed: true,
    durationLabel: '01:55',
  },
]

const INITIAL_CAPSULES: HeirloomCapsule[] = [
  {
    id: 'cap-priya-wedding-2036',
    title: 'For the Morning You Put On Your Wedding Saree',
    speakerId: 'krishnamurthy-venkataraman',
    speakerName: 'Krishnamurthy Venkataraman',
    speakerRelation: 'Paternal Grandfather',
    recipientId: 'priya-mehta',
    recipientName: 'Priya Mehta',
    milestoneLabel: 'Priya\'s Wedding Morning',
    unlockDate: 'January 15, 2036',
    createdAt: 'Sealed Oct 14, 2026',
    languageCode: 'ta-IN',
    languageName: 'Tamizh (Tamil)',
    tone: 'reflective',
    toneLabel: 'Warm & Reflective',
    message:
      'Priya, if you are listening to this on your wedding morning, remember what Thatha told you on the Mylapore verandah when you were six: choose the person who makes a quiet room feel warm. Marriage is built in the small mornings — making filter coffee together, forgiving quickly, and laughing when the auto breaks down in the rain.',
    isSealed: true,
    passphraseHint: 'Mylapore verandah year (2008)',
    waveform: [
      24, 38, 52, 68, 44, 76, 88, 62, 48, 82, 94, 71, 56, 39, 64, 86, 92, 67,
      54, 78, 84, 59, 42, 73, 90, 68, 50, 36, 60, 74, 48, 32,
    ],
    encryption: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256 (100,000 iterations)',
      ivHex: '8f3c91a04d2e7b11509ac3e8',
      saltHex: 'd4910fb3728ac15904e8b217f53c809e',
      ciphertextHex:
        '7b49a2f0e81c36d590b4f218c7e63a914d8052f7b1e39c640a2d8f5173e9b40c6a12f8d3e5079b241c8a6f30d9e57b1248c3a0f6e9d251b7',
      authTagPreview: 'c8e21f409a3b7c8d1e5f20498b6a1d3c',
      byteLength: 294,
      timestampIso: '2026-10-14T16:12:00.000Z',
    },
  },
  {
    id: 'cap-arjun-18th-2030',
    title: 'Stepping Into Your Own Life at Eighteen',
    speakerId: 'rajan-mehta',
    speakerName: 'Rajan Mehta',
    speakerRelation: 'Father',
    recipientId: 'arjun-mehta',
    recipientName: 'Arjun Mehta',
    milestoneLabel: 'Arjun\'s 18th Birthday',
    unlockDate: 'March 12, 2030',
    createdAt: 'Sealed Oct 19, 2026',
    languageCode: 'hi-IN',
    languageName: 'Hindi',
    tone: 'wisdom',
    toneLabel: 'Steady Wisdom',
    message:
      'Arjun, today you turn eighteen. Writing this always made me too emotional to finish, so I spoke it while your mother made chai. Measure your success by the kindness you show when no one is watching, and never be afraid to begin again after a setback — that courage is already in your blood.',
    isSealed: false,
    passphraseHint: 'Unlocked for family preview',
    waveform: [
      28, 50, 72, 64, 48, 84, 96, 78, 56, 44, 70, 88, 92, 68, 52, 76, 82, 60,
      46, 80, 90, 74, 58, 42, 66, 78, 62, 48, 38, 54, 40, 26,
    ],
    encryption: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256 (100,000 iterations)',
      ivHex: '3a7e19c48b02f561d94e82a7',
      saltHex: '91c4e8205a7b3d16f08294c7e1a5b308',
      ciphertextHex:
        '4e82b1c90f3a76d418e5b29c60a7f3d184e29b05c7a13f68d2e490b715c8a3f26d9e04b175c2a8f630d9e41b7c52a0f8e3d691b472c0a5f8',
      authTagPreview: 'a3f26d9e04b175c2a8f630d9e41b7c52',
      byteLength: 268,
      timestampIso: '2026-10-19T10:30:00.000Z',
    },
  },
  {
    id: 'cap-priya-graduation-2040',
    title: 'Paati\'s Blessing for Your Graduation Day (Tamil & Hindi)',
    speakerId: 'savitri-krishnamurthy',
    speakerName: 'Savitri Krishnamurthy',
    speakerRelation: 'Paternal Grandmother',
    recipientId: 'priya-mehta',
    recipientName: 'Priya Mehta',
    milestoneLabel: 'Priya\'s Architecture Graduation',
    unlockDate: 'May 20, 2027',
    createdAt: 'Sealed Oct 22, 2026',
    languageCode: 'ta-IN',
    languageName: 'Tamizh (Tamil)',
    tone: 'lullaby',
    toneLabel: 'Gentle Lullaby',
    message:
      'Vaazhkaiyil eppodhu thanimaiyo thayakkamo vandhaalum, oru nimidam kangalai moodi, unudaiya kudumbathin anbu eppodhum unakkul irukkiradhu endru ninaivil kol. Nee ellaaraiyum vittu tiram theduvaaiye — aarambham pidikka bayapadaadhe, kanna.',
    isSealed: true,
    passphraseHint: 'Kumbakonam kolam dawn',
    waveform: [
      30, 45, 62, 54, 78, 85, 60, 42, 68, 90, 76, 52, 48, 72, 88, 64, 50, 74,
      82, 58, 40, 66, 84, 70, 46, 38, 62, 76, 54, 40, 30, 22,
    ],
    encryption: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256 (100,000 iterations)',
      ivHex: 'c5029e8174b3a6d20f91e48c',
      saltHex: '5f0819c3e27a4d61b8309f5e2c71a48d',
      ciphertextHex:
        '9c14e7a20b5d83f619e4a0c72b8d5f1360a9e2c47b1d80f53e9a62c14d7f08b35e2a91c64d8f03b72e5a19c84d0f63b27e9a15c48d0f26b3',
      authTagPreview: '5e2a91c64d8f03b72e5a19c84d0f63b2',
      byteLength: 312,
      timestampIso: '2026-10-22T15:45:00.000Z',
    },
  },
  {
    id: 'cap-arjun-iit-2031',
    title: 'For the Day Your IIT Results Arrive (Cross-Lingual Hindi & Gujarati)',
    speakerId: 'rajan-mehta',
    speakerName: 'Rajan Mehta',
    speakerRelation: 'Father (Cross-Lingual Clone)',
    recipientId: 'arjun-mehta',
    recipientName: 'Arjun Mehta',
    milestoneLabel: 'JEE Advanced Result Day',
    unlockDate: 'June 10, 2031',
    createdAt: 'Sealed Oct 25, 2026',
    languageCode: 'gu-IN',
    languageName: 'Gujarati',
    tone: 'reflective',
    toneLabel: 'Warm & Reflective',
    message:
      'Arjun, whatever the result says today, I need you to hear this first: you are not your score. You are the boy who stayed up learning tabla at midnight because music mattered, who carried chai to the watchman on cold nights, who never let a friend sit alone at lunch. That person — that one — will build something worth building, with or without an IIT gate.',
    isSealed: false,
    passphraseHint: 'Unlocked for family preview',
    waveform: [
      26, 42, 58, 74, 50, 82, 90, 66, 52, 78, 86, 60, 44, 70, 84, 62, 48, 72,
      80, 56, 42, 68, 88, 72, 54, 40, 64, 76, 52, 38, 28, 20,
    ],
    encryption: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256 (100,000 iterations)',
      ivHex: '6d19a4f802c7e351b890d2a4',
      saltHex: 'a2705e91c48b3f16d0924e7a8c15b30f',
      ciphertextHex:
        '2f71c8e40a9b35d618f4c2e90b7a3d5184f2c0e69a1b73d508f4c2e19a6b30d74f82c1e50a9b36d218f4c0e79a5b31d64f82c0e91a7b35d2',
      authTagPreview: 'e69a1b73d508f4c2e19a6b30d74f82c1',
      byteLength: 244,
      timestampIso: '2026-10-25T18:05:00.000Z',
    },
  },
]

const STORAGE_KEY = 'living-heirloom-gnani-vault-v1'

export function useHeirloomVault() {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS)
  const [questions, setQuestions] = useState<BiographerQuestion[]>(
    INITIAL_BIOGRAPHER_QUESTIONS
  )
  const [capsules, setCapsules] = useState<HeirloomCapsule[]>(INITIAL_CAPSULES)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.members) && parsed.members.length > 0) {
          setMembers(parsed.members)
        }
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setQuestions(parsed.questions)
        }
        if (Array.isArray(parsed.capsules) && parsed.capsules.length > 0) {
          setCapsules(parsed.capsules)
        }
      }
    } catch {
      // Keep default seeded archive if storage unavailable
    } finally {
      setHydrated(true)
    }
  }, [])

  const persist = useCallback(
    (
      nextMembers: FamilyMember[],
      nextQuestions: BiographerQuestion[],
      nextCapsules: HeirloomCapsule[]
    ) => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            members: nextMembers,
            questions: nextQuestions,
            capsules: nextCapsules,
          })
        )
      } catch {
        // Ignore quota errors
      }
    },
    []
  )

  const addFamilyMember = useCallback(
    (newMember: Omit<FamilyMember, 'id' | 'clips' | 'gnaniModelId'>) => {
      const id = `${newMember.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`
      const created: FamilyMember = {
        ...newMember,
        id,
        gnaniModelId: newMember.voiceCalibrated
          ? `gnani-timbre-${id.slice(0, 6)}`
          : 'pending-calibration',
        clips: [
          {
            id: `${id}-c1`,
            number: '01',
            title: 'Natural Cadence & Warmth',
            prompt:
              '"The evening light always came through the verandah right around six, and everything slowed down — the sounds, the heat, even the birds."',
            durationSec: 12,
            captured: newMember.voiceCalibrated,
            recordedAt: 'Today',
            snrDb: 43.1,
          },
          {
            id: `${id}-c2`,
            number: '02',
            title: 'Laughter & Breath Grain',
            prompt:
              '"We laughed so hard at the dining table that the chai went cold, and nobody cared because the story was worth every cold sip."',
            durationSec: 14,
            captured: newMember.voiceCalibrated,
            recordedAt: 'Today',
            snrDb: 42.4,
          },
          {
            id: `${id}-c3`,
            number: '03',
            title: 'Quiet Conviction & Blessing',
            prompt:
              '"Be honest even when it costs you, keep your word even when no one is watching, and begin again without shame whenever you need to."',
            durationSec: 11,
            captured: newMember.voiceCalibrated,
            recordedAt: 'Today',
            snrDb: 43.8,
          },
        ],
      }

      setMembers((prev) => {
        const next = [created, ...prev]
        persist(next, questions, capsules)
        return next
      })
      return created
    },
    [capsules, persist, questions]
  )

  const markClipRecorded = useCallback(
    (memberId: string, clipIndex: number) => {
      setMembers((prev) => {
        const next = prev.map((m) => {
          if (m.id !== memberId) return m
          const updatedClips = m.clips.map((c, idx) =>
            idx === clipIndex
              ? { ...c, captured: true, recordedAt: 'Just now', snrDb: 44.2 }
              : c
          )
          const allDone =
            updatedClips.length > 0 && updatedClips.every((c) => c.captured)
          return {
            ...m,
            clips: updatedClips,
            voiceCalibrated: allDone || m.voiceCalibrated,
            harmonicFidelity: allDone ? 99.5 : m.harmonicFidelity || 96.4,
            gnaniModelId:
              m.gnaniModelId === 'pending-calibration'
                ? `gnani-timbre-${m.id.slice(0, 6)}-v3`
                : m.gnaniModelId,
          }
        })
        persist(next, questions, capsules)
        return next
      })
    },
    [capsules, persist, questions]
  )

  const updateQuestionAnswer = useCallback(
    (questionId: string, spokenAnswer: string, distilledLetter: string) => {
      setQuestions((prev) => {
        const next = prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                spokenAnswer,
                distilledLetter,
                completed: true,
              }
            : q
        )
        persist(members, next, capsules)
        return next
      })
    },
    [capsules, members, persist]
  )

  const createAndSealCapsule = useCallback(
    async (input: {
      title: string
      speakerId: string
      recipientId: string
      milestoneLabel: string
      unlockDate: string
      languageCode: string
      languageName: string
      tone: EmotionalTone
      toneLabel: string
      message: string
      passphrase?: string
    }) => {
      const speaker =
        members.find((m) => m.id === input.speakerId) || members[0]
      const recipient =
        members.find((m) => m.id === input.recipientId) ||
        members[members.length - 1]

      const encryption = await encryptHeirloomInBrowser(
        JSON.stringify({
          title: input.title,
          speaker: speaker.name,
          recipient: recipient.name,
          unlockDate: input.unlockDate,
          message: input.message,
        }),
        input.passphrase || 'living-heirloom-family-key'
      )

      const newCapsule: HeirloomCapsule = {
        id: `cap-${Date.now()}`,
        title: input.title,
        speakerId: speaker.id,
        speakerName: speaker.name,
        speakerRelation: speaker.relation.split('·')[0].trim(),
        recipientId: recipient.id,
        recipientName: recipient.name,
        milestoneLabel: input.milestoneLabel,
        unlockDate: input.unlockDate,
        createdAt: 'Sealed Just Now',
        languageCode: input.languageCode,
        languageName: input.languageName,
        tone: input.tone,
        toneLabel: input.toneLabel,
        message: input.message,
        isSealed: true,
        passphraseHint: input.passphrase
          ? `Key hint: ${input.passphrase.slice(0, 4)}•••`
          : 'Family Vault Key',
        waveform: [
          28, 46, 64, 72, 54, 84, 92, 68, 50, 78, 90, 74, 58, 42, 68, 86, 94,
          70, 56, 80, 88, 62, 46, 74, 86, 64, 48, 38, 62, 72, 50, 34,
        ],
        encryption,
      }

      setCapsules((prev) => {
        const next = [newCapsule, ...prev]
        persist(members, questions, next)
        return next
      })

      return newCapsule
    },
    [members, persist, questions]
  )

  const toggleCapsuleSealState = useCallback(
    (capsuleId: string, forceState?: boolean) => {
      setCapsules((prev) => {
        const next = prev.map((c) =>
          c.id === capsuleId
            ? {
                ...c,
                isSealed:
                  forceState !== undefined ? forceState : !c.isSealed,
              }
            : c
        )
        persist(members, questions, next)
        return next
      })
    },
    [members, persist, questions]
  )

  return {
    hydrated,
    members,
    questions,
    capsules,
    addFamilyMember,
    markClipRecorded,
    updateQuestionAnswer,
    createAndSealCapsule,
    toggleCapsuleSealState,
  }
}
