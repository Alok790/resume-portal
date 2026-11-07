import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CirclePlay,
  Cloud,
  Download,
  FileText,
  GitBranch,
  Globe,
  Menu,
  Sparkles,
  Star,
  Target,
} from 'lucide-react'

const navItems = ['Home', 'Features', 'Templates', 'Pricing', 'Contact']

const trustMetrics = [
  { value: '10,000+', label: 'Resumes Created' },
  { value: '95%', label: 'Success Rate' },
  { value: 'Fast ATS', label: 'Templates' },
  { value: '500+', label: 'Recruiter Approved' }
]

const features = [
  {
    icon: Target,
    title: 'ATS Optimized Templates',
    description: 'Recruiter-friendly layouts engineered to pass screening systems and highlight your strongest skills.'
  },
  {
    icon: Sparkles,
    title: 'One-Click Resume Improvement',
    description: 'Strengthen your existing resume with guided content updates and clear formatting suggestions.'
  },
  {
    icon: Star,
    title: 'AI Resume Suggestions',
    description: 'Get tailored recommendations based on your role, experience, and the keywords employers are searching for.'
  },
  {
    icon: FileText,
    title: 'Multiple Modern Designs',
    description: 'Choose from premium templates designed for tech, product, consulting, and creative roles alike.'
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Export high-quality PDFs instantly with print-ready layouts that maintain perfect formatting across devices.'
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Keep every version of your resume secure in the cloud and update it anytime from any device.'
  }
]

const steps = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Add your experience, skills, and career goals to build a professional profile foundation.'
  },
  {
    number: '02',
    title: 'Improve Resume',
    description: 'Use smart suggestions to sharpen your content, highlight strengths, and tailor every section to the job you want.'
  },
  {
    number: '03',
    title: 'Apply For Jobs',
    description: 'Export your resume, apply confidently, and make a stronger impression with every submission.'
  }
]

const templates = [
  { name: 'Executive', accent: 'from-indigo-500 via-violet-500 to-cyan-400' },
  { name: 'Modern', accent: 'from-cyan-500 via-sky-500 to-indigo-500' },
  { name: 'Creative', accent: 'from-fuchsia-500 via-purple-500 to-indigo-500' },
  { name: 'Minimal', accent: 'from-emerald-500 via-teal-500 to-cyan-500' }
]

const testimonials = [
  {
    name: 'Ava Thompson',
    role: 'Product Designer',
    quote: 'Within a week of updating my resume, I was getting more interview calls than ever. The ATS optimization is real.'
  },
  {
    name: 'Marcus Lee',
    role: 'Software Engineer',
    quote: 'It feels premium, easy to use, and the AI suggestions were incredibly relevant to the roles I was targeting.'
  },
  {
    name: 'Priya Shah',
    role: 'Marketing Manager',
    quote: 'I loved the modern templates and the export quality. It looks polished enough to feel like I had a professional designer.'
  }
]

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-20 h-96 w-96 rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-lg shadow-indigo-500/40">
              <span className="text-sm font-black tracking-[0.22em]">RP</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Resume Portal</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                className="transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#050816]/95 px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3 text-sm text-slate-200">
              {navItems.map((item) => (
                <a key={item} href={item === 'Home' ? '#' : `#${item.toLowerCase()}`} className="py-1">
                  {item}
                </a>
              ))}
              <div className="mt-2 flex gap-3 pt-2">
                <Link to="/login" className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center">Login</Link>
                <Link to="/register" className="flex-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-center font-medium">Sign Up</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-28">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-200 ring-1 ring-inset ring-indigo-400/20">
                <Sparkles size={12} />
                Built for modern career growth
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
                Make Your Resume Better In Minutes
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Improve your resume with smarter structure, stronger skills, and recruiter-ready formatting that helps you stand out in today’s competitive job market.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-[0_20px_60px_rgba(99,102,241,0.45)] transition-transform hover:-translate-y-0.5"
                >
                  Make My Resume Better
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#showcase"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  <CirclePlay size={18} />
                  See How It Works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Recruiter-approved layouts
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="absolute right-8 top-10 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 shadow-[0_20px_60px_rgba(6,182,212,0.25)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">ATS Score</div>
                <div className="mt-2 text-3xl font-black text-white">95%</div>
              </div>

              <div className="absolute -left-6 bottom-10 rounded-2xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 shadow-[0_20px_60px_rgba(139,92,246,0.25)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.16em] text-violet-200/80">Resumes</div>
                <div className="mt-2 text-2xl font-black text-white">10k+</div>
              </div>

              <div className="absolute -right-6 bottom-12 rounded-2xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 shadow-[0_20px_60px_rgba(99,102,241,0.25)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.16em] text-indigo-200/80">Partners</div>
                <div className="mt-2 text-xl font-black text-white">500+</div>
              </div>

              <div className="glass-panel relative overflow-hidden rounded-[30px] p-4 sm:p-5">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_40px_100px_rgba(15,23,42,0.9)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400/80" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                      ATS Ready
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-900/80 p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-indigo-500/40">
                        AJ
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">Alicia Johnson</h3>
                        <p className="text-sm text-slate-400">Senior Product Designer</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Summary</p>
                          <p className="text-sm leading-6 text-slate-300">
                            Product designer with 7+ years crafting intuitive digital experiences and scaling design systems.
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {['Figma', 'UX Research', 'Design Systems', 'Prototyping'].map((skill) => (
                              <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-200/80">Profile</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-200">
                          <div className="flex items-center justify-between">
                            <span>Experience</span>
                            <span className="font-semibold text-white">7 yrs</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Focus</span>
                            <span className="font-semibold text-white">AI UX</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Match</span>
                            <span className="font-semibold text-cyan-300">96%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-300">Trust</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                Trusted By Job Seekers Worldwide
              </h2>
            </motion.div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trustMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="glass-panel rounded-2xl p-5 text-center"
                >
                  <div className="text-2xl font-black text-white sm:text-3xl">{metric.value}</div>
                  <div className="mt-2 text-sm text-slate-300">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-300">Features</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
              Everything You Need To Get Hired
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="glass-panel rounded-3xl p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/10 text-indigo-200 ring-1 ring-inset ring-white/10">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="templates" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex items-end justify-between gap-4"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-300">Templates</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Crafted to impress recruiters.</h2>
            </div>
            <Link to="/register" className="hidden items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white md:inline-flex">
              Explore all templates <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 p-4"
              >
                <div className={`h-64 rounded-[22px] bg-gradient-to-br ${template.accent} p-[1px]`}>
                  <div className="flex h-full flex-col justify-between rounded-[21px] bg-[#0b1120]/95 p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-1/3 rounded-full bg-white/80" />
                      <div className="h-3 w-2/3 rounded-full bg-white/30" />
                      <div className="h-3 w-1/2 rounded-full bg-white/20" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-10 rounded-xl bg-white/5" />
                        <div className="h-10 rounded-xl bg-white/5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{template.name}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Premium</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-[#0a1020] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-300">How it works</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">A simple path from profile to opportunity.</h2>
            </motion.div>

            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="glass-panel rounded-[28px] p-6">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-indigo-500/30">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute right-[-18px] top-1/2 hidden h-0.5 w-12 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-cyan-500 lg:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-300">Testimonials</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Job seekers love the confidence it brings.</h2>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="glass-panel rounded-[28px] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-sm font-bold text-white">
                    {testimonial.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{testimonial.name}</h3>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-4 text-base leading-7 text-slate-300">“{testimonial.quote}”</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_48%)]" />
          <div className="relative mx-auto max-w-5xl rounded-[32px] border border-indigo-400/20 bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(10,14,26,0.9),rgba(6,182,212,0.12))] px-6 py-12 text-center shadow-[0_20px_80px_rgba(99,102,241,0.25)] sm:px-10 lg:px-12">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-200">Start now</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">Ready To Make Your Resume Stand Out?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
              Join professionals improving their resumes, matching stronger to opportunities, and getting recruiter-ready faster.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <a href="#templates" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/5">
                Explore Templates
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050816]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-sm font-black tracking-[0.18em] text-white">
                RP
              </div>
              <div>
                <div className="text-lg font-bold text-white">Resume Portal</div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
              Make better resumes with premium templates, AI guidance, and job-ready formatting designed for modern career growth.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#templates" className="hover:text-white">Templates</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Resources</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white">Career Tips</a></li>
              <li><a href="#" className="hover:text-white">Resume Guides</a></li>
              <li><a href="#" className="hover:text-white">Interview Prep</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>hello@resumeportal.com</li>
              <li>+1 (415) 820-8018</li>
              <li>145 Market Street, San Francisco, CA</li>
            </ul>
            <div className="mt-5 flex items-center gap-3 text-slate-300">
              <a href="https://github.com" aria-label="GitHub" className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-white/20 hover:text-white"><GitBranch size={16} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-white/20 hover:text-white"><Globe size={16} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-white/20 hover:text-white"><ArrowRight size={16} /></a>
              <a href="https://instagram.com" aria-label="Instagram" className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:border-white/20 hover:text-white"><Star size={16} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
            <p>© 2026 Resume Portal. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
