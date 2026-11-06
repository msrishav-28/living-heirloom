import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { BespokeSelect } from '../bespoke-controls'
let root: Root, host: HTMLDivElement
const changed = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
async function render(disabled = false) {
  await act(async () =>
    root.render(
      <BespokeSelect
        label="Language"
        value="en"
        options={[
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'Hindi' },
          { value: 'ta', label: 'Tamil' },
        ]}
        onChange={changed}
        disabled={disabled}
      />,
    ),
  )
  return host.querySelector('button')!
}
async function press(button: HTMLElement, key: string) {
  await act(async () =>
    button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })),
  )
}
test('keyboard chooses an option and restores focus', async () => {
  const button = await render()
  await press(button, 'ArrowDown')
  expect(button.getAttribute('aria-expanded')).toBe('true')
  await press(button, 'ArrowDown')
  await press(button, 'Enter')
  expect(changed).toHaveBeenCalledWith('hi')
  expect(button.getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(button)
})
test('Escape dismisses without changing the selected language', async () => {
  const button = await render()
  await press(button, 'Enter')
  await press(button, 'ArrowDown')
  await press(button, 'Escape')
  expect(changed).not.toHaveBeenCalled()
  expect(host.querySelector('[role=listbox]')).toBeNull()
})
test('disabled controls remain disabled and use no native select', async () => {
  const button = await render(true)
  expect(button.disabled).toBe(true)
  expect(host.querySelector('select')).toBeNull()
  expect(button.labels?.[0]?.textContent).toBe('Language')
})
test('Home and End reach the list boundaries', async () => {
  const button = await render()
  await press(button, 'ArrowDown')
  await press(button, 'End')
  await press(button, 'Enter')
  expect(changed).toHaveBeenLastCalledWith('ta')
})
