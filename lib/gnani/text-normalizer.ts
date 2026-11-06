import { ToWords } from 'to-words'
import { SupportedLanguageSchema } from '@/lib/product-contracts'
const small = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const tens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]
function words(n: number): string {
  if (n < 20) return small[n]
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? '-' + small[n % 10] : '')
  for (const [value, label] of [
    [10000000, 'crore'],
    [100000, 'lakh'],
    [1000, 'thousand'],
    [100, 'hundred'],
  ] as const) {
    if (n >= value)
      return (
        words(Math.floor(n / value)) +
        ' ' +
        label +
        (n % value ? (n % value < 100 ? ' and ' : ' ') + words(n % value) : '')
      )
  }
  throw new Error('Number outside supported range')
}
export function normalizeTextForGnaniTTS(
  text: string,
  langCode: string,
): string {
  const language = SupportedLanguageSchema.parse(langCode)
  if (language !== 'en-IN') {
    const converter = new ToWords({ localeCode: language })
    const forms: Record<string, [string, string, string, string, string]> = {
      'hi-IN': ['और', 'डॉक्टर', 'प्रोफेसर', 'श्रीमती', 'श्री'],
      'ta-IN': ['மற்றும்', 'மருத்துவர்', 'பேராசிரியர்', 'திருமதி', 'திரு'],
      'kn-IN': ['ಮತ್ತು', 'ಡಾಕ್ಟರ್', 'ಪ್ರೊಫೆಸರ್', 'ಶ್ರೀಮತಿ', 'ಶ್ರೀ'],
      'te-IN': ['మరియు', 'డాక్టర్', 'ప్రొఫెసర్', 'శ్రీమతి', 'శ్రీ'],
      'ml-IN': ['കൂടാതെ', 'ഡോക്ടർ', 'പ്രൊഫസർ', 'ശ്രീമതി', 'ശ്രീ'],
      'mr-IN': ['आणि', 'डॉक्टर', 'प्राध्यापक', 'श्रीमती', 'श्री'],
      'bn-IN': ['এবং', 'ডাক্তার', 'অধ্যাপক', 'শ্রীমতী', 'শ্রী'],
      'gu-IN': ['અને', 'ડૉક્ટર', 'પ્રોફેસર', 'શ્રીમતી', 'શ્રી'],
      'pa-IN': ['ਅਤੇ', 'ਡਾਕਟਰ', 'ਪ੍ਰੋਫੈਸਰ', 'ਸ੍ਰੀਮਤੀ', 'ਸ੍ਰੀ'],
    }
    const [and, doctor, professor, mrs, mr] = forms[language]
    let result = text.replace(
      /[\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0be6-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f]/g,
      (digit) => {
        const code = digit.charCodeAt(0)
        const base = [
          0x966, 0x9e6, 0xa66, 0xae6, 0xbe6, 0xc66, 0xce6, 0xd66,
        ].find((base) => code >= base && code <= base + 9)!
        return String(code - base)
      },
    )
    result = result.replace(
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
      (_, day: string, month: string, year: string) => {
        const date = new Date(Date.UTC(+year, +month - 1, +day))
        if (date.getUTCDate() !== +day || date.getUTCMonth() !== +month - 1)
          throw new Error('Invalid spoken date')
        return (
          converter.toOrdinal(+day) +
          ' ' +
          date.toLocaleString(language, { month: 'long', timeZone: 'UTC' }) +
          ' ' +
          converter.convert(+year)
        )
      },
    )
    result = result.replace(/₹\s*([\d,]+(?:\.\d+)?)/g, (_, number: string) =>
      converter.convert(number.replaceAll(',', ''), { currency: true }),
    )
    result = result.replace(
      /\b(Dr|Prof|Smt|Shri)\./g,
      (_, title: string) =>
        ({ Dr: doctor, Prof: professor, Smt: mrs, Shri: mr })[title]!,
    )
    return result
      .replace(/ & /g, ' ' + and + ' ')
      .replace(/\b\d[\d,]*(?:\.\d+)?\b/g, (number) =>
        converter.convert(number.replaceAll(',', '')),
      )
  }
  const ordinals = [
    '',
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
    'eleventh',
    'twelfth',
    'thirteenth',
    'fourteenth',
    'fifteenth',
    'sixteenth',
    'seventeenth',
    'eighteenth',
    'nineteenth',
    'twentieth',
    'twenty-first',
    'twenty-second',
    'twenty-third',
    'twenty-fourth',
    'twenty-fifth',
    'twenty-sixth',
    'twenty-seventh',
    'twenty-eighth',
    'twenty-ninth',
    'thirtieth',
    'thirty-first',
  ]
  let out = text.replace(
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
    (full, d: string, m: string, y: string) => {
      const date = new Date(Date.UTC(+y, +m - 1, +d))
      if (date.getUTCDate() !== +d || date.getUTCMonth() !== +m - 1)
        throw new Error('Invalid spoken date')
      const year =
        +y >= 2000 && +y < 2100 ? 'twenty ' + words(+y % 100) : words(+y)
      return `${ordinals[+d]} ${date.toLocaleString('en-IN', { month: 'long', timeZone: 'UTC' })} ${year}`
    },
  )
  out = out.replace(/₹\s*([\d,]+)/g, (_, raw: string) => {
    const n = Number(raw.replaceAll(',', ''))
    return (
      'rupees ' +
      (n >= 1000 && n < 2000 && n % 100 === 0
        ? words(n / 100) + ' hundred'
        : words(n))
    )
  })
  out = out.replace(
    /\b(Dr|Prof|Smt|Shri)\./g,
    (_, title: string) =>
      ({ Dr: 'Doctor', Prof: 'Professor', Smt: 'Shreemati', Shri: 'Shri' })[
        title
      ]!,
  )
  return out.replace(/ & /g, ' and ').replace(/\b\d[\d,]*\b/g, (raw) => {
    const n = Number(raw.replaceAll(',', ''))
    if (!Number.isSafeInteger(n) || n > 999999999)
      throw new Error('Number too large for speech normalization')
    return words(n)
  })
}
