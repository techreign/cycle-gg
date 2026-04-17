import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
      {/* Ambient warm glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700, top: '-15%', right: '-10%',
            background: '#9f1239', opacity: 0.10, filter: 'blur(140px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 560, height: 560, bottom: '-10%', left: '5%',
            background: '#c2410c', opacity: 0.06, filter: 'blur(130px)',
          }}
        />
      </div>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Main content */}
      <main className="md:pl-[220px] pb-20 md:pb-0 min-h-screen relative z-10">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
