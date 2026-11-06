export function BrandWaveform() {
  return (
    <span aria-hidden="true" className="brand-waveform">
      {[8, 16, 24, 12, 20].map((height, index) => (
        <span
          key={height}
          style={{ height, animationDelay: `${index * -0.18}s` }}
        />
      ))}
    </span>
  )
}
