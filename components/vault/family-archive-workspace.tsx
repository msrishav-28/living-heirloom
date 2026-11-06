'use client'

import React, { useState } from 'react'
import type {
  FamilyMember,
  HeirloomCapsule,
} from '@/lib/heirloom-vault-store'
import { BespokeSelect, WaxSealBadge } from '@/components/ui/bespoke-controls'

interface FamilyArchiveWorkspaceProps {
  members: FamilyMember[]
  capsules: HeirloomCapsule[]
  onAddMember: (
    member: Omit<FamilyMember, 'id' | 'clips' | 'gnaniModelId'>
  ) => FamilyMember
  onOpenVoiceLabForMember: (memberId: string) => void
  onOpenCapsuleComposerForMember: (memberId: string) => void
}

const ROLE_OPTIONS = [
  {
    value: 'speaker',
    label: 'Voice Preserver (Speaker)',
    sublabel: 'Grandparent, parent, or storyteller preserving their voice',
    badge: '3-Clip Clone',
  },
  {
    value: 'recipient',
    label: 'Future Milestone Recipient',
    sublabel: 'Child, grandchild, or loved one receiving time-locked capsules',
    badge: 'Recipient',
  },
  {
    value: 'both',
    label: 'Both Speaker & Recipient',
    sublabel: 'Family archivist who both records and receives capsules',
    badge: 'Full Access',
  },
]

const CREST_OPTIONS = [
  {
    value: 'oak',
    label: 'Botanical Oak Crest',
    sublabel: 'Symbol of deep roots & enduring shelter',
  },
  {
    value: 'olive',
    label: 'Sunlit Olive Branch',
    sublabel: 'Symbol of peace, warmth & kitchen-table grace',
  },
  {
    value: 'lotus',
    label: 'Temple Lotus Seal',
    sublabel: 'Symbol of ancestral lineage & multilingual wisdom',
  },
  {
    value: 'star',
    label: 'Morning Star Crest',
    sublabel: 'Symbol of future wedding & milestone blessings',
  },
  {
    value: 'compass',
    label: 'Compass Rose Seal',
    sublabel: 'Symbol of guidance across oceans & decades',
  },
]

export function FamilyArchiveWorkspace({
  members,
  capsules,
  onAddMember,
  onOpenVoiceLabForMember,
  onOpenCapsuleComposerForMember,
}: FamilyArchiveWorkspaceProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || 'arthur-pendelton'
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelation, setNewRelation] = useState('')
  const [newBirthYear, setNewBirthYear] = useState('')
  const [newNativeLang, setNewNativeLang] = useState('English & Hindi')
  const [newRole, setNewRole] = useState<'speaker' | 'recipient' | 'both'>(
    'speaker'
  )
  const [newCrest, setNewCrest] = useState<
    'oak' | 'olive' | 'lotus' | 'star' | 'compass'
  >('olive')
  const [newBioNote, setNewBioNote] = useState('')

  const activeMember =
    members.find((m) => m.id === selectedMemberId) || members[0]

  const memberCapsules = capsules.filter(
    (c) =>
      c.speakerId === activeMember?.id || c.recipientId === activeMember?.id
  )

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const created = onAddMember({
      name: newName.trim(),
      relation: newRelation.trim() || 'Beloved Family Member',
      role: newRole,
      birthYear: newBirthYear.trim() || 'Family Lineage',
      crestType: newCrest,
      accentBg:
        newCrest === 'oak' || newCrest === 'star'
          ? 'parchment'
          : newCrest === 'olive' || newCrest === 'compass'
            ? 'blue'
            : 'sage',
      voiceCalibrated: false,
      harmonicFidelity: 0,
      fundamentalHz:
        newRole !== 'recipient' ? '145 Hz Warm Timbre' : 'Recipient Profile',
      nativeLanguage: newNativeLang.trim() || 'English',
      supportedLanguages: 10,
      bioNote:
        newBioNote.trim() ||
        'Added to the Living Heirloom family archive for cross-generational voice and milestone preservation.',
    })

    setSelectedMemberId(created.id)
    setShowAddForm(false)
    setNewName('')
    setNewRelation('')
    setNewBirthYear('')
    setNewBioNote('')
  }

  return (
    <div className="space-y-8">
      {/* Top Workspace Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="font-nunito-eyebrow">
            WORKSPACE 01 · FAMILY ARCHIVE & RECIPIENT PROFILES
          </span>
          <h2 className="font-louize-card mt-1.5 text-[28px] text-[var(--ink-black)] sm:text-[34px]">
            Every voice you preserve and every child who will inherit it.
          </h2>
          <p className="font-avenir-body mt-1.5 max-w-[680px] text-[16px] text-[var(--ink-body-slate)]">
            Select any family member below to inspect their Gnani AI vocal
            timbre model, calibration clips, and linked time-locked capsules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="btn-ember-pill shrink-0"
        >
          <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
          <span>
            {showAddForm ? 'Close New Profile Form' : 'Add Family Member'}
          </span>
        </button>
      </div>

      {/* Bespoke New Family Profile Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateMember}
          className="pastel-card-parchment p-6 sm:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-nunito-eyebrow">
              NEW FAMILY ARCHIVE PROFILE
            </span>
            <span className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
              Encrypted in Family Vault · Gnani AI Ready
            </span>
          </div>

          <h3 className="font-louize-card mt-2 text-[28px] text-[var(--ink-slate-navy)]">
            Enroll a storyteller or future recipient.
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="member-name"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Full Name
              </label>
              <input
                id="member-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Evelyn Pendelton or Aarav Sharma"
                className="font-inter-ui w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="member-relation"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Family Relationship
              </label>
              <input
                id="member-relation"
                type="text"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="e.g., Grandmother · Storyteller"
                className="font-inter-ui w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="member-birth"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Birth Year & Hometown
              </label>
              <input
                id="member-birth"
                type="text"
                value={newBirthYear}
                onChange={(e) => setNewBirthYear(e.target.value)}
                placeholder="e.g., Born 1949 · Mysuru & Boston"
                className="font-inter-ui w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>

            <BespokeSelect
              id="member-role-select"
              label="Archive Role"
              value={newRole}
              options={ROLE_OPTIONS}
              onChange={(v) =>
                setNewRole(v as 'speaker' | 'recipient' | 'both')
              }
            />

            <BespokeSelect
              id="member-crest-select"
              label="Heirloom Wax-Seal Crest"
              value={newCrest}
              options={CREST_OPTIONS}
              onChange={(v) =>
                setNewCrest(
                  v as 'oak' | 'olive' | 'lotus' | 'star' | 'compass'
                )
              }
            />

            <div>
              <label
                htmlFor="member-langs"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Spoken / Heritage Languages
              </label>
              <input
                id="member-langs"
                type="text"
                value={newNativeLang}
                onChange={(e) => setNewNativeLang(e.target.value)}
                placeholder="e.g., English, Hindi, Tamil"
                className="font-inter-ui w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="member-bio"
              className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
            >
              Personal Note or Story Context
            </label>
            <textarea
              id="member-bio"
              rows={2}
              value={newBioNote}
              onChange={(e) => setNewBioNote(e.target.value)}
              placeholder="Write a brief note about the stories, recipes, or future milestones associated with this person..."
              className="font-avenir-body w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4 text-[16px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-ember-pill bg-[var(--card)]">
              <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
              <span>Save Profile to Family Archive</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-slate-pill bg-[var(--card)]"
            >
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Main 12-Column Split: Left 5 Cols Member Cards, Right 7 Cols Detailed Profile Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: Family Member Roster */}
        <div className="space-y-3.5 lg:col-span-5">
          {members.map((member) => {
            const isSelected = member.id === activeMember?.id
            const cardToneClass =
              member.accentBg === 'parchment'
                ? 'pastel-card-parchment'
                : member.accentBg === 'blue'
                  ? 'pastel-card-blue'
                  : 'pastel-card-sage'

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`${cardToneClass} flex w-full items-start gap-4 p-5 text-left transition-all sm:p-6 ${
                  isSelected
                    ? 'ring-2 ring-[#ff5924]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <WaxSealBadge
                  crest={member.crestType}
                  sealed={member.voiceCalibrated}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-louize-card text-[24px] text-[var(--ink-black)]">
                      {member.name}
                    </h3>
                    <span
                      className={`rounded-[36px] px-2.5 py-0.5 font-nunito text-[11px] font-semibold tracking-[0.07em] uppercase ${
                        member.voiceCalibrated
                          ? 'border border-[#ff5924] bg-[var(--card)] text-[var(--accent-ember)]'
                          : 'border border-[#748297] bg-[var(--card)] text-[var(--ink-slate-navy)]'
                      }`}
                    >
                      {member.voiceCalibrated
                        ? `${member.harmonicFidelity}% Timbre Cloned`
                        : 'Milestone Recipient'}
                    </span>
                  </div>

                  <p className="font-inter-ui mt-0.5 text-[14px] text-[var(--ink-slate-navy)]">
                    {member.relation} · {member.birthYear}
                  </p>
                  <p className="font-avenir-body mt-2 line-clamp-2 text-[15px] text-[var(--ink-body-slate)]">
                    {member.bioNote}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right 7 Cols: Active Family Member Dossier */}
        {activeMember && (
          <div className="pastel-card-parchment flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <WaxSealBadge
                    crest={activeMember.crestType}
                    size="lg"
                    sealed={activeMember.voiceCalibrated}
                  />
                  <div>
                    <span className="font-nunito-eyebrow">
                      {activeMember.relation.toUpperCase()}
                    </span>
                    <h3 className="font-louize-card mt-1 text-[34px] text-[var(--ink-black)] sm:text-[40px]">
                      {activeMember.name}
                    </h3>
                    <p className="font-inter-ui text-[14px] text-[var(--muted-foreground)]">
                      {activeMember.birthYear} · Heritage:{' '}
                      {activeMember.nativeLanguage}
                    </p>
                  </div>
                </div>

                <div className="rounded-[12px] bg-[var(--card)] px-4 py-2.5 text-right">
                  <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                    Gnani AI Acoustic ID
                  </p>
                  <p className="font-mono text-[13px] text-[var(--ink-slate-navy)]">
                    {activeMember.gnaniModelId}
                  </p>
                </div>
              </div>

              <p className="font-avenir-body mt-6 text-[18px] text-[var(--ink-slate-navy)]">
                {activeMember.bioNote}
              </p>

              {/* Acoustic & Multilingual Telemetry Grid */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-[12px] bg-[var(--card)] p-4">
                  <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                    Harmonic Fidelity
                  </p>
                  <p className="font-louize-card mt-1 text-[28px] text-[var(--accent-ember)]">
                    {activeMember.voiceCalibrated
                      ? `${activeMember.harmonicFidelity}%`
                      : 'Pending'}
                  </p>
                  <p className="font-inter-ui text-[13px] text-[var(--ink-body-slate)]">
                    {activeMember.fundamentalHz}
                  </p>
                </div>

                <div className="rounded-[12px] bg-[var(--card)] p-4">
                  <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                    Gnani Multilingual Reach
                  </p>
                  <p className="font-louize-card mt-1 text-[28px] text-[var(--ink-slate-navy)]">
                    {activeMember.supportedLanguages} Languages
                  </p>
                  <p className="font-inter-ui text-[13px] text-[var(--ink-body-slate)]">
                    Indic & Global Cross-Lingual
                  </p>
                </div>

                <div className="rounded-[12px] bg-[var(--card)] p-4">
                  <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                    Linked Capsules
                  </p>
                  <p className="font-louize-card mt-1 text-[28px] text-[var(--ink-slate-navy)]">
                    {memberCapsules.length} Heirlooms
                  </p>
                  <p className="font-inter-ui text-[13px] text-[var(--ink-body-slate)]">
                    AES-256-GCM Time-Locked
                  </p>
                </div>
              </div>

              {/* 3-Clip Calibration Status or Linked Capsules */}
              {activeMember.clips.length > 0 && (
                <div className="mt-7">
                  <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                    Preserved 3-Clip Calibration Samples
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {activeMember.clips.map((clip) => (
                      <div
                        key={clip.id}
                        className="flex flex-col justify-between gap-2 rounded-[12px] bg-[var(--card)] p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-inter-ui text-[14px] font-medium text-[var(--ink-black)]">
                            Clip {clip.number}: {clip.title} ({clip.durationSec}
                            s · SNR {clip.snrDb} dB)
                          </p>
                          <p className="font-avenir-body mt-0.5 text-[14px] text-[var(--ink-body-slate)]">
                            {clip.prompt}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-[36px] border border-[#ff5924]/40 bg-[var(--canvas-blush)] px-3 py-1 font-nunito text-[11px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                          {clip.captured ? `Captured · ${clip.recordedAt}` : 'Ready'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Capsules List */}
              {memberCapsules.length > 0 && (
                <div className="mt-7">
                  <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                    Linked Time-Locked Capsules ({memberCapsules.length})
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {memberCapsules.map((cap) => (
                      <div
                        key={cap.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[var(--card)] p-4"
                      >
                        <div>
                          <p className="font-louize-card text-[20px] text-[var(--ink-black)]">
                            {cap.title}
                          </p>
                          <p className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
                            {cap.speakerName} → {cap.recipientName} ·{' '}
                            {cap.unlockDate} ({cap.languageName})
                          </p>
                        </div>
                        <span className="rounded-[36px] border border-[#1573dd] px-3 py-0.5 font-inter-ui text-[12px] text-[var(--accent-cobalt)]">
                          {cap.isSealed ? 'AES-256 Sealed' : 'Unsealed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenVoiceLabForMember(activeMember.id)}
                className="btn-ember-pill bg-[var(--card)]"
              >
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>Open in Gnani AI Voice Lab</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCapsuleComposerForMember(activeMember.id)}
                className="btn-slate-pill bg-[var(--card)]"
              >
                <span>Seal New Capsule for {activeMember.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
