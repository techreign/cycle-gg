import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { LandingPage } from './pages/LandingPage'

// Lazy-loaded routes — everything behind the app shell splits off into its
// own chunk so the initial landing-page load stays small.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LogGamePage = lazy(() => import('./pages/LogGamePage').then(m => ({ default: m.LogGamePage })))
const LogPeriodPage = lazy(() => import('./pages/LogPeriodPage').then(m => ({ default: m.LogPeriodPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const SetupPage = lazy(() => import('./pages/SetupPage').then(m => ({ default: m.SetupPage })))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{
          border: '2px solid rgba(251,113,133,0.2)',
          borderTopColor: '#fb7185',
        }}
      />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AppShell />}>
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/setup"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <SetupPage />
                  </Suspense>
                }
              />
              <Route
                path="/log-game"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <LogGamePage />
                  </Suspense>
                }
              />
              <Route
                path="/log-period"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <LogPeriodPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
