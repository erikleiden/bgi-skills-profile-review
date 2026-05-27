import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Info, BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import data from '../data/data.json'

const CATEGORY_ORDER = [
  'Foundational & Leadership Skills',
  'Baseline Applied Skills',
  'Core Role-Specific Skills',
  'Specialization',
]

const CATEGORY_COLORS = {
  'Foundational & Leadership Skills': '#024879',
  'Baseline Applied Skills': '#42769B',
  'Core Role-Specific Skills': '#E0712A',
  'Specialization': '#C12035',
}

const CATEGORY_TOOLTIPS = {
  'Foundational & Leadership Skills': 'Cross-occupational skills like communication, planning, management, and decision-making. Transferable across most roles.',
  'Baseline Applied Skills': 'Practical skills used across many roles but applied to specific work — Microsoft Excel, mathematics, customer service, lifting, data entry.',
  'Core Role-Specific Skills': 'Skills that define what this role actually does — the day-to-day technical work that distinguishes this occupation from others.',
  'Specialization': 'Optional deep skills that signal a specialization within the role, often commanding a wage premium.',
}

const LABEL_STYLES = {
  'Durable Skill':       { bg: 'bg-emerald-100', text: 'text-emerald-800', desc: 'Stable demand over the next 5 years.' },
  'High Value Skill':    { bg: 'bg-amber-100',   text: 'text-amber-800',   desc: 'Carries a meaningful wage premium relative to other skills in this role.' },
  'High Growth Skill':   { bg: 'bg-sky-100',     text: 'text-sky-800',     desc: 'Demand projected to grow notably over the next 5 years.' },
  'Declining Skill':     { bg: 'bg-gray-200',    text: 'text-gray-700',    desc: 'Demand projected to decline. May indicate displacement or shift in role definition.' },
}

const METRIC_TOOLTIPS = {
  frequency: 'Share of postings for this occupation that mention this skill.',
  specificity: 'How specific this skill is to this occupation (vs. used across many roles). Higher = more distinctive.',
  growth: '5-year projected demand growth, capped at +100% for readability.',
  growthRaw: 'Uncapped 5-year demand growth. Very large values usually reflect a small 2021 base, not a true surge.',
  wagePremium: 'Wage premium associated with possessing this skill, holding occupation constant.',
}

function fmtPct(v, dec=1) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  return (v*100).toFixed(dec) + '%'
}

function MetricTip({ label, body, children }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-bgi-navy text-white text-xs rounded-lg p-2 shadow-lg pointer-events-none">
        <div className="font-bold mb-0.5">{label}</div>
        <div className="opacity-90">{body}</div>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-bgi-navy"></div>
      </div>
    </div>
  )
}

function SkillRow({ skill, expanded, onToggle }) {
  const style = LABEL_STYLES[skill.label] || LABEL_STYLES['Durable Skill']
  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className="flex-shrink-0 w-5">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{skill.skill}</span>
            <MetricTip label={skill.label} body={style.desc}>
              <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}>{skill.label}</span>
            </MetricTip>
            {skill.subcategory && (
              <span className="text-xs text-gray-500">· {skill.subcategory}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm flex-shrink-0">
          <MetricTip label="Frequency in Role" body={METRIC_TOOLTIPS.frequency}>
            <div className="text-right">
              <div className="text-xs text-gray-500">Freq</div>
              <div className="font-mono font-semibold text-gray-800">{fmtPct(skill.frequency, 1)}</div>
            </div>
          </MetricTip>
          <MetricTip label="Skill Specificity" body={METRIC_TOOLTIPS.specificity}>
            <div className="text-right">
              <div className="text-xs text-gray-500">Spec</div>
              <div className="font-mono font-semibold text-gray-800">{fmtPct(skill.specificity, 1)}</div>
            </div>
          </MetricTip>
          <MetricTip label="5-Year Demand Growth" body={METRIC_TOOLTIPS.growth}>
            <div className="text-right">
              <div className="text-xs text-gray-500">Growth</div>
              <div className={`font-mono font-semibold ${(skill.growth ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {skill.growth !== null && skill.growth >= 0 ? '+' : ''}{fmtPct(skill.growth, 0)}
              </div>
            </div>
          </MetricTip>
          <MetricTip label="Wage Premium" body={METRIC_TOOLTIPS.wagePremium}>
            <div className="text-right">
              <div className="text-xs text-gray-500">Wage</div>
              <div className={`font-mono font-semibold ${(skill.wagePremium ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {skill.wagePremium !== null && skill.wagePremium >= 0 ? '+' : ''}{fmtPct(skill.wagePremium, 1)}
              </div>
            </div>
          </MetricTip>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3 text-sm">
          <div>
            <div className="text-xs font-semibold text-bgi-navy uppercase tracking-wide mb-1">Definition</div>
            <p className="text-gray-700">{skill.definition}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-bgi-navy uppercase tracking-wide mb-1">How this skill is used in this role</div>
            <p className="text-gray-700">{skill.utilization}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
            <div className="bg-white border border-gray-200 rounded p-2.5">
              <div className="text-xs font-bold text-bgi-midblue mb-1">Level 1 (Foundational)</div>
              <p className="text-xs text-gray-700">{skill.level1}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-2.5">
              <div className="text-xs font-bold text-bgi-orange mb-1">Level 2 (Proficient)</div>
              <p className="text-xs text-gray-700">{skill.level2}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded p-2.5">
              <div className="text-xs font-bold text-bgi-crimson mb-1">Level 3 (Advanced)</div>
              <p className="text-xs text-gray-700">{skill.level3}</p>
            </div>
          </div>
          {skill.growthRaw !== null && Math.abs(skill.growthRaw - (skill.growth ?? 0)) > 0.001 && (
            <div className="text-xs text-gray-500 italic pt-1">
              Raw uncapped 5-year demand growth: <span className="font-mono">{(skill.growthRaw*100).toFixed(1)}%</span> (capped to {fmtPct(skill.growth, 0)} in displayed metric)
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilesTab() {
  const newOccs = data.newOccupations
  const [selected, setSelected] = useState(newOccs[4]) // Default to CISM (the alphabetically 5th = Computer and Information Systems Managers)
  const [expanded, setExpanded] = useState(new Set())
  const [filterCat, setFilterCat] = useState('all')
  const [filterLabel, setFilterLabel] = useState('all')

  const profile = data.profiles[selected]
  const skills = profile.skills

  // Skills grouped by category
  const groupedSkills = useMemo(() => {
    const g = {}
    CATEGORY_ORDER.forEach(c => { g[c] = [] })
    skills.forEach(s => {
      if (!g[s.category]) g[s.category] = []
      g[s.category].push(s)
    })
    // Sort within each group by frequency desc
    Object.keys(g).forEach(k => g[k].sort((a,b) => (b.frequency ?? 0) - (a.frequency ?? 0)))
    return g
  }, [skills])

  const categoryCounts = useMemo(() => {
    return CATEGORY_ORDER.map(c => ({
      name: c.replace(' Skills',''),
      fullName: c,
      count: groupedSkills[c]?.length || 0,
      color: CATEGORY_COLORS[c]
    }))
  }, [groupedSkills])

  const labelCounts = useMemo(() => {
    const counts = {}
    skills.forEach(s => { counts[s.label] = (counts[s.label] || 0) + 1 })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [skills])

  const filteredCategories = useMemo(() => {
    return CATEGORY_ORDER.filter(c => filterCat === 'all' || filterCat === c)
  }, [filterCat])

  const toggleAll = (open) => {
    if (open) setExpanded(new Set(skills.map(s => `${selected}::${s.skill}`)))
    else setExpanded(new Set())
  }

  const visibleSkills = (cat) => {
    const arr = groupedSkills[cat] || []
    if (filterLabel === 'all') return arr
    return arr.filter(s => s.label === filterLabel)
  }

  const newIdx = newOccs.indexOf(selected) + 1

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">
      {/* Occupation selector */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-bgi-navy uppercase tracking-wider mb-1.5">
            New Occupation Profile ({newIdx} of {newOccs.length})
          </label>
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setExpanded(new Set()) }}
            className="w-full lg:w-[480px] text-lg font-bold text-bgi-navy bg-white border-2 border-bgi-navy rounded-lg px-4 py-2.5 cursor-pointer hover:bg-blue-50"
          >
            {newOccs.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const idx = newOccs.indexOf(selected)
              if (idx > 0) { setSelected(newOccs[idx-1]); setExpanded(new Set()) }
            }}
            disabled={newOccs.indexOf(selected) === 0}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              const idx = newOccs.indexOf(selected)
              if (idx < newOccs.length-1) { setSelected(newOccs[idx+1]); setExpanded(new Set()) }
            }}
            disabled={newOccs.indexOf(selected) === newOccs.length-1}
            className="px-4 py-2.5 bg-bgi-navy text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
            <BarChart3 className="h-3.5 w-3.5" /> Total skills
          </div>
          <div className="text-3xl font-bold text-bgi-navy mt-1">{profile.totalSkills}</div>
        </div>
        {categoryCounts.map(c => (
          <div key={c.name} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide font-medium" style={{color: c.color}}>
              {c.name}
            </div>
            <div className="text-3xl font-bold mt-1" style={{color: c.color}}>{c.count}</div>
          </div>
        ))}
      </div>

      {/* Chart: skills by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800 text-sm">Skill distribution by category</h3>
            <MetricTip label="What this shows" body="How the skills break out across the four BGI taxonomy categories.">
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </MetricTip>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={categoryCounts} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v) => [v, 'Skills']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {categoryCounts.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800 text-sm">Label distribution</h3>
            <MetricTip label="Skill labels" body="Durable, High Value (wage), High Growth (demand), or Declining — applied to each skill based on its 5-year demand and wage-premium profile.">
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </MetricTip>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={labelCounts} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v) => [v, 'Skills']} />
              <Bar dataKey="count" radius={[4,4,0,0]} fill="#024879" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and bulk toggles */}
      <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-200">
        <div>
          <label className="text-xs text-gray-500 mr-1.5">Category:</label>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mr-1.5">Label:</label>
          <select
            value={filterLabel}
            onChange={e => setFilterLabel(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            {Object.keys(LABEL_STYLES).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => toggleAll(true)} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Expand all</button>
          <button onClick={() => toggleAll(false)} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Collapse all</button>
        </div>
      </div>

      {/* Skills, grouped by category */}
      <div className="space-y-6">
        {filteredCategories.map(cat => {
          const list = visibleSkills(cat)
          if (!list || list.length === 0) return null
          return (
            <section key={cat}>
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="font-bold text-base" style={{color: CATEGORY_COLORS[cat]}}>{cat}</h2>
                <MetricTip label={cat} body={CATEGORY_TOOLTIPS[cat]}>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </MetricTip>
                <span className="text-xs text-gray-400">{list.length} skill{list.length === 1 ? '' : 's'}</span>
              </div>
              <div className="space-y-2">
                {list.map(s => {
                  const id = `${selected}::${s.skill}`
                  return (
                    <SkillRow
                      key={id}
                      skill={s}
                      expanded={expanded.has(id)}
                      onToggle={() => {
                        const n = new Set(expanded)
                        if (n.has(id)) n.delete(id); else n.add(id)
                        setExpanded(n)
                      }}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
