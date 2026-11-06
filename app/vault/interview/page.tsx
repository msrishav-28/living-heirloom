'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { HeirloomModeSchema } from '@/lib/product-contracts'
import { InterviewRoom } from '@/components/vault/interview-room'
function Content() {
  const params = useSearchParams()
  const mode = HeirloomModeSchema.safeParse(params.get('mode'))
  return (
    <InterviewRoom
      memberId={params.get('member') || 'my-voice'}
      mode={mode.success ? mode.data : 'childhood_roots'}
    />
  )
}
export default function InterviewPage() {
  return (
    <Suspense fallback={<p>Opening interview…</p>}>
      <Content />
    </Suspense>
  )
}
