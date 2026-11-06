import { describe, test, expect } from 'vitest'
import { normalizeTextForGnaniTTS } from '../text-normalizer'
describe('spoken text', () => {
  test.each([
    ['', ''],
    ['A warm memory', 'A warm memory'],
    ['2024', 'two thousand and twenty-four'],
    ['₹1,500', 'rupees fifteen hundred'],
    ['Tea & coffee', 'Tea and coffee'],
    ['Dr. Prof. Smt. Shri.', 'Doctor Professor Shreemati Shri'],
    ['14/10/2026', 'fourteenth October twenty twenty-six'],
  ])('%s', (input, output) =>
    expect(normalizeTextForGnaniTTS(input, 'en-IN')).toBe(output),
  )
  test('preserves native text', () =>
    expect(normalizeTextForGnaniTTS('नमस्ते', 'hi-IN')).toBe('नमस्ते'))
  test.each([
    ['hi-IN', 'दो हज़ार चौबीस'],
    ['ta-IN', 'இரண்டு ஆயிரம் இருபத்தி நான்கு'],
    ['kn-IN', 'ಎರಡು ಸಾವಿರದ ಇಪ್ಪತ್ತನಾಲ್ಕು'],
    ['te-IN', 'రెండు వేల ఇరవై నాలుగు'],
    ['ml-IN', 'രണ്ടായിരത്തി ഇരുപത്തി നാല്'],
    ['mr-IN', 'दोन हजार चोवीस'],
    ['bn-IN', 'দুই হাজার চব্বিশ'],
    ['gu-IN', 'બે હજાર ચોવીસ'],
    ['pa-IN', 'ਦੋ ਹਜ਼ਾਰ ਚੌਵੀ'],
  ])('normalizes numbers in %s', (lang, expected) =>
    expect(normalizeTextForGnaniTTS('2024', lang)).toBe(expected),
  )
  test('normalizes native digits and currency', () => {
    expect(normalizeTextForGnaniTTS('२०२४', 'hi-IN')).toBe('दो हज़ार चौबीस')
    expect(normalizeTextForGnaniTTS('₹1,500', 'hi-IN')).toBe(
      'एक हज़ार पांच सौ रुपये',
    )
  })
  test('normalizes native titles and conjunction', () =>
    expect(normalizeTextForGnaniTTS('Dr. & Prof.', 'hi-IN')).toBe(
      'डॉक्टर और प्रोफेसर',
    ))
  test('rejects invalid dates', () =>
    expect(() => normalizeTextForGnaniTTS('31/02/2026', 'en-IN')).toThrow(
      'Invalid',
    ))
})
