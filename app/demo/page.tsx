import DemoVault from '@/components/demo/demo-vault'
export default function DemoPage() {
  return (
    <>
      <aside className="demo-notice">
        Design demonstration · Fictional profiles, simulated voices and example
        locks. <a href="/vault">Open your real vault →</a>
      </aside>
      <DemoVault />
    </>
  )
}
