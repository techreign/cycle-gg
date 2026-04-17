import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { PhaseChip } from '../components/ui/PhaseChip'
import { Button } from '../components/ui/Button'
import { PHASE_CONFIG } from '../constants/phases'
import { getPhaseForDate } from '../utils/cycleEngine'
import { isPredictedPeriod } from '../utils/cycleGenerator'
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
  isPredictedPeriod: boolean
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
          const isPredicted = info?.isPredictedPeriod ?? false
          const phase = info?.phase ?? 'unknown'
          const color = phaseColor(phase)

          let bg: string | undefined
          let textColor: string = '#f8e4e7'
          let border: string | undefined
          let aria = dateStr

          if (isPeriod && !isPredicted) {
            bg = 'rgba(220, 38, 38, 0.6)'
            textColor = '#fff'
          } else if (isPredicted) {
            bg = 'rgba(220, 38, 38, 0.12)'
            border = '1.5px dashed rgba(251, 113, 133, 0.7)'
            textColor = '#fb7185'
            aria = `${dateStr} (predicted period)`
          } else if (color) {
            bg = color + '22'
          } else {
            textColor = '#cda3a9'
          }

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className="relative flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 h-10 w-full hover:opacity-90"
              style={{
                backgroundColor: bg,
                color: textColor,
                border,
                ...(isToday ? { boxShadow: '0 0 0 2px #fb7185' } : {}),
                ...(isPeriod && !isPredicted ? { fontWeight: 700 } : {}),
              }}
              aria-label={aria}
            >
              {day}
              {isToday && !isPeriod && !isPredicted && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: '#fb7185' }} />
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
  const { periods, cycleConfig, updateCycleConfig, currentPhase } = useApp()

  // Calendar navigation state
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  // Form state
  const [startDate, setStartDate] = useState(todayYMD())
  const [endDate, setEndDate] = useState('')
  const [formError, setFormError] = useState('')
  const [savedToast, setSavedToast] = useState(false)

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
    const overlap = periods.find((p) => isDateInPeriod(dateStr, p.startDate, p.endDate))
    const isPeriod = overlap !== undefined
    const isPredictedPeriodCell = overlap !== undefined && isPredictedPeriod(overlap)
    const phase = getPhaseForDate(dateStr, periods)

    dayInfoMap.set(dateStr, {
      dateStr,
      isToday: dateStr === today,
      isPeriod,
      isPredictedPeriod: isPredictedPeriodCell,
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

    // Re-anchor the cycle to this newly logged period. Duration is inferred
    // from the optional end date, otherwise we keep the current (or default).
    const inferredDuration = endDate
      ? Math.max(3, Math.min(7, Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
        ) + 1))
      : cycleConfig?.periodDuration ?? 5

    updateCycleConfig({
      lastPeriodStart: startDate,
      cycleLength: cycleConfig?.cycleLength ?? 28,
      periodDuration: inferredDuration,
    })

    setStartDate(todayYMD())
    setEndDate('')
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  const sortedPeriods = [...periods]
    .filter(p => !isPredictedPeriod(p))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 fade-up">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Log Your Period</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Track your cycle to unlock phase insights.</p>
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
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {(Object.entries(PHASE_CONFIG) as [Exclude<CyclePhase, 'unknown'>, (typeof PHASE_CONFIG)[Exclude<CyclePhase, 'unknown'>]][]).map(([phase, config]) => (
            <div key={phase} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: config.color + '44' }}
              />
              {config.emoji} {config.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'rgba(220,38,38,0.6)' }} />
            🩸 Period
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ border: '1.5px dashed rgba(251,113,133,0.7)' }} />
            Predicted
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
        <h2 className="section-heading">Log a Period</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="field"
              />
            </div>

            <div>
              <label className="field-label">
                End Date <span className="normal-case" style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="field"
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm" style={{ color: '#fb7185' }}>{formError}</p>
          )}

          {savedToast && (
            <p className="text-sm" style={{ color: '#34d399' }}>
              Cycle updated — phase calendar re-anchored to {startDate || 'your logged date'}.
            </p>
          )}

          <Button type="submit" size="md" className="w-full justify-center">
            Log Period
          </Button>
        </form>
      </div>

      {/* Past Periods */}
      <div>
        <h2 className="section-heading">Period History</h2>

        {sortedPeriods.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {period.startDate}
                        {period.endDate && period.endDate !== period.startDate
                          ? ` → ${period.endDate}`
                          : ''}
                      </p>
                      {period.endDate && (
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
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

                  <span
                    className="shrink-0 text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--color-text-faint)' }}
                    title="Periods are computed from your cycle config — edit in Setup."
                  >
                    generated
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
