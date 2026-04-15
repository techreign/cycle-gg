import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PhaseChip } from '../components/ui/PhaseChip'
import { Button } from '../components/ui/Button'
import { PHASE_CONFIG } from '../constants/phases'
import { getPhaseForDate } from '../utils/cycleEngine'
import type { CyclePhase } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayYMD(): string {
  return toYMD(new Date())
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isDateInPeriod(
  dateStr: string,
  startDate: string,
  endDate: string | null
): boolean {
  if (dateStr < startDate) return false
  if (endDate !== null) return dateStr <= endDate
  // If no end date, treat as same day as start
  return dateStr === startDate
}

interface DayInfo {
  dateStr: string
  isToday: boolean
  isPeriod: boolean
  phase: CyclePhase
}

// ─── Inline Calendar ──────────────────────────────────────────────────────────

interface CalendarProps {
  year: number
  month: number
  dayInfoMap: Map<string, DayInfo>
  onDayClick: (dateStr: string) => void
}

function Calendar({ year, month, dayInfoMap, onDayClick }: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekdayOfMonth(year, month)

  // Build grid cells: leading empty + day cells
  const cells: (number | null)[] = [
    ...Array.from<null>({ length: firstWeekday }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function phaseColor(phase: CyclePhase): string | undefined {
    if (phase === 'unknown') return undefined
    return PHASE_CONFIG[phase].color
  }

  return (
    <div className="glass-card p-4 md:p-6">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs text-slate-500 font-medium py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const info = dayInfoMap.get(dateStr)
          const isToday = info?.isToday ?? false
          const isPeriod = info?.isPeriod ?? false
          const phase = info?.phase ?? 'unknown'
          const color = phaseColor(phase)

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={[
                'relative flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150',
                'h-9 w-full',
                isPeriod
                  ? 'text-white font-bold'
                  : color
                    ? 'text-slate-200 hover:opacity-90'
                    : 'text-slate-400 hover:bg-white/10',
                isToday ? 'ring-2 ring-pink-400 ring-offset-1 ring-offset-transparent' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                isPeriod
                  ? { backgroundColor: 'rgba(244, 63, 94, 0.55)' }
                  : color
                    ? { backgroundColor: color + '22' }
                    : undefined
              }
              aria-label={dateStr}
            >
              {day}
              {isToday && !isPeriod && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LogPeriodPage() {
  const { periods, addPeriod, removePeriod, currentPhase } = useApp()

  // Calendar navigation state
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  // Form state
  const [startDate, setStartDate] = useState(todayYMD())
  const [endDate, setEndDate] = useState('')
  const [formError, setFormError] = useState('')

  function prevMonth() {
    if (calMonth === 0) {
      setCalYear((y) => y - 1)
      setCalMonth(11)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalYear((y) => y + 1)
      setCalMonth(0)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  // Build a map of date strings → DayInfo for the displayed month
  const dayInfoMap = new Map<string, DayInfo>()
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const today = todayYMD()

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isPeriod = periods.some((p) => isDateInPeriod(dateStr, p.startDate, p.endDate))
    const phase = getPhaseForDate(dateStr, periods)

    dayInfoMap.set(dateStr, {
      dateStr,
      isToday: dateStr === today,
      isPeriod,
      phase,
    })
  }

  function handleDayClick(dateStr: string) {
    // If day is already in a period, set it as end date for the latest overlapping period
    const inPeriod = periods.find((p) => isDateInPeriod(dateStr, p.startDate, p.endDate))
    if (inPeriod) {
      setStartDate(inPeriod.startDate)
      setEndDate(dateStr)
      return
    }
    // Otherwise pre-fill start date form
    setStartDate(dateStr)
    setEndDate('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!startDate) {
      setFormError('Start date is required.')
      return
    }
    if (endDate && endDate < startDate) {
      setFormError('End date cannot be before start date.')
      return
    }

    addPeriod({ startDate, endDate: endDate || null })
    setStartDate(todayYMD())
    setEndDate('')
  }

  const sortedPeriods = [...periods].sort(
    (a, b) => b.startDate.localeCompare(a.startDate)
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Log Your Period</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your cycle to unlock phase insights</p>
        </div>
        {currentPhase !== 'unknown' && (
          <div className="ml-auto">
            <PhaseChip phase={currentPhase} size="md" />
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="mb-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h2 className="text-base font-bold text-white">
            {MONTH_NAMES[calMonth]} {calYear}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {(Object.entries(PHASE_CONFIG) as [Exclude<CyclePhase, 'unknown'>, (typeof PHASE_CONFIG)[Exclude<CyclePhase, 'unknown'>]][]).map(([phase, config]) => (
            <div key={phase} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: config.color + '44' }}
              />
              {config.emoji} {config.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-sm inline-block bg-rose-500/55" />
            🩸 Period
          </div>
        </div>

        <Calendar
          year={calYear}
          month={calMonth}
          dayInfoMap={dayInfoMap}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Log Period Form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-5">Log a Period</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                End Date{' '}
                <span className="text-slate-600 normal-case">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 focus:bg-white/8 transition-all"
              />
            </div>
          </div>

          {formError && (
            <p className="text-rose-400 text-sm">{formError}</p>
          )}

          <Button type="submit" size="md" className="w-full justify-center">
            Log Period
          </Button>
        </form>
      </div>

      {/* Past Periods */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Period History</h2>

        {sortedPeriods.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500 text-sm">
            No periods logged yet. Use the form above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPeriods.map((period) => {
              const phase = getPhaseForDate(period.startDate, periods)
              return (
                <div
                  key={period.id}
                  className="glass-card p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PhaseChip phase={phase} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">
                        {period.startDate}
                        {period.endDate && period.endDate !== period.startDate
                          ? ` → ${period.endDate}`
                          : ''}
                      </p>
                      {period.endDate && (
                        <p className="text-xs text-slate-500">
                          {Math.round(
                            (new Date(period.endDate).getTime() -
                              new Date(period.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{' '}
                          days
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removePeriod(period.id)}
                    className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    aria-label="Delete period"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
