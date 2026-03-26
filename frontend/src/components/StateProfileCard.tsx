import type { RegionOut } from '../types'

export default function StateProfileCard(props: { region: RegionOut }) {
  const { region } = props
  const profile = region.state_profile

  if (!profile) return null

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="text-xl font-semibold text-[#1A1A2E]">{profile.nickname}</div>
      <div className="mt-1 text-sm text-[#6B7280]">
        Capital: <span className="font-medium text-[#1A1A2E]">{profile.capital}</span>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Top crops</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.top_crops.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full bg-[#D8F3DC] px-2.5 py-0.5 text-xs font-medium text-[#2D6A4F]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Agricultural highlights</div>
        <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{profile.agricultural_highlights}</p>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Did you know?</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#6B7280] space-y-1">
          {profile.fun_facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Learn more</div>
        <div className="mt-2 flex flex-col gap-1.5">
          {profile.resource_links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#40916C] hover:underline"
            >
              {l.label}
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.97-2.03a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1-1.06 1.06L13 5.31V12a.75.75 0 0 1-1.5 0V5.31l-2.72 2.72a.75.75 0 0 1-1.06-1.06l3.5-3.5Z" clipRule="evenodd" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

