import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Main content */}
      <main className="md:pl-[200px] pb-20 md:pb-0 min-h-screen">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
