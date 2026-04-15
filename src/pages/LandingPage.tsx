import { useNavigate } from 'react-router-dom'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { GradientCard } from '../components/ui/GradientCard'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-10 glass-card text-slate-300">
            <span>🩸</span>
            <span>Cycle-aware League analytics</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6">
            <span className="gradient-text">Your Cycle.</span>
            <br />
            <span className="text-white">Your Meta.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Track your period cycle alongside your League of Legends performance.
            Discover patterns. Optimize your grind.
          </p>

          <Button
            size="lg"
            onClick={() => void navigate('/dashboard')}
            className="text-base font-bold shadow-lg"
          >
            Start Tracking →
          </Button>

          <p className="text-sm text-slate-600 mt-6">
            Inspired by{' '}
            <a
              href="https://twitter.com/SaskioLoL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-pink-400 transition-colors underline underline-offset-2"
            >
              @SaskioLoL
            </a>
            's viral discovery
          </p>
        </div>
      </section>

      {/* ─── Discovery Section ────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            The Data <span className="gradient-text">Don't Lie</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Real numbers from a real tracking experiment. Are yours different?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard
            title="Win Rate Swing"
            value="+5.5%"
            subtitle="higher off period"
            trend="up"
          />
          <StatCard
            title="Aggression On Period"
            value="8.6/10"
            subtitle="based on damage + deaths"
            trend="up"
          />
          <StatCard
            title="Aggression Off Period"
            value="4.85/10"
            subtitle="calculated, fewer deaths"
            trend="down"
          />
        </div>

        <div className="glass-card p-6 md:p-8">
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            <span className="text-white font-semibold">SaskioLoL tracked 147 games</span> with
            his duo and found that her period directly affected her playstyle — aggression
            spikes, win rate dips. Is it the same for you?{' '}
            <span className="gradient-text font-semibold">
              Cycle.gg helps you find out.
            </span>
          </p>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-400">Built for the data-driven gamer.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              {
                emoji: '🩸',
                title: 'Cycle Tracking',
                desc: 'Log your period, see predicted phases on a beautiful calendar',
              },
              {
                emoji: '🎮',
                title: 'Game Analytics',
                desc: 'Track wins, KDA, damage, and champions per phase',
              },
              {
                emoji: '📊',
                title: 'MPPD Score',
                desc: 'Your personal Mean Period Performance Deviation',
              },
              {
                emoji: '😤',
                title: 'Bwipo Mode',
                desc: "When aggression goes over 8.6... you've entered Bwipo territory",
              },
            ] as const
          ).map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 hover:border-white/20 transition-all"
            >
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bwipo Section ────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <GradientCard className="bwipo-glow text-center">
          <div className="text-5xl mb-6">😤</div>

          <blockquote className="text-xl md:text-2xl text-slate-200 italic mb-3 leading-relaxed">
            "Women shouldn't play competitive during their period"
          </blockquote>
          <p className="text-sm text-slate-500 mb-10">— Some guy, probably.</p>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10">
            Prove them wrong. Or prove them right.{' '}
            <span className="text-white font-semibold">Either way, you'll have the data.</span>
          </p>

          <Button
            size="lg"
            onClick={() => void navigate('/dashboard')}
            className="font-bold"
          >
            Get Started
          </Button>
        </GradientCard>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-center border-t border-white/5">
        <p className="text-slate-600 text-sm">
          Cycle.gg v1.0 • Inspired by @SaskioLoL • Built with 💜
        </p>
      </footer>
    </div>
  )
}
