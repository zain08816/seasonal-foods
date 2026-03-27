import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import DatePicker from './DatePicker'
import { useTheme } from '../theme/ThemeProvider'

function LeafLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 4C12.5 4 6 8.5 6 16c0 3.3 1.7 4 4 4 7.5 0 10-6.5 10-14Z"
          stroke="#40916C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M6 20c2.2-5.2 6.2-8.6 14-12"
          stroke="#40916C"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline text-lg font-semibold text-[var(--text)]">
        Seasonal Harvest
      </span>
    </div>
  )
}

export default function Header(props: { dateISO: string; onDateChange: (next: string) => void }) {
  const { dateISO, onDateChange } = props
  const { theme, toggleTheme } = useTheme()

  const todayLabel = useMemo(() => {
    // Keep it simple; DatePicker already handles parsing.
    return dateISO
  }, [dateISO])

  return (
    <header className="w-full py-4">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <Link
          to="/"
          aria-label="Seasonal Harvest home"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        >
          <LeafLogo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Dark mode"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-[var(--border)] bg-[var(--surface-alt)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <span
              className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface)] shadow-sm transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-[3px]'
              }`}
            >
              {theme === 'dark' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text)]">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </span>
          </button>
          <div className="sr-only">Active date</div>
          <DatePicker
            valueISO={dateISO}
            onChange={onDateChange}
            ariaLabel={`Active date ${todayLabel}`}
          />
        </div>
      </div>
    </header>
  )
}
