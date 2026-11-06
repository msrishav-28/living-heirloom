'use client'
export function VoiceConsent({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="my-4 flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-[#ff5924]"
      />
      <span>
        I consent to voice recording and processing under India's Digital
        Personal Data Protection Act, 2023. My voice data is processed on-device
        and via Gnani AI for the purpose of creating a family heirloom. I am
        recording my own voice or have the speaker’s permission. Interview text
        is also processed by the configured reasoning provider.
      </span>
    </label>
  )
}
