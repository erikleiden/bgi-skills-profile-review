import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import data from '../data/data.json'

// skills-first.org category order
const CATEGORY_ORDER = [
  'Core Role-Specific Skills',
  'Baseline Applied Skills',
  'Foundational & Leadership Skills',
  'Specialization',
]

const CATEGORY_COLORS = {
  'Core Role-Specific Skills': '#E0712A',
  'Baseline Applied Skills': '#42769B',
  'Foundational & Leadership Skills': '#024879',
  'Specialization': '#C12035',
}

const CATEGORY_TOOLTIPS = {
  'Core Role-Specific Skills': 'Skills that define what this role actually does — the day-to-day technical work that distinguishes this occupation from others.',
  'Baseline Applied Skills': 'Practical skills used across many roles but applied to specific work — Microsoft Excel, mathematics, customer service, data entry.',
  'Foundational & Leadership Skills': 'Cross-occupational skills like communication, planning, management, and decision-making. Transferable across most roles.',
  'Specialization': 'Deeper skills that signal a specialization within the role, often commanding a wage premium.',
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
  wagePremium: 'Wage premium associated with possessing this skill, holding occupation constant.',
}

function fmtPct(v, dec=1) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'N/A'
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

function Metric({ label, value, tip, positive }) {
  const colorClass = positive === undefined ? 'text-gray-900'
    : positive ? 'text-emerald-700' : 'text-rose-600'
  return (
    <div className="flex-1 min-w-[120px]">
      <MetricTip label={label} body={tip}>
        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray-500 font-medium cursor-help">
          {label} <Info className="h-3 w-3 text-gray-400" />
        </div>
      </MetricTip>
      <div className={`text-lg font-bold font-mono ${colorClass}`}>{value}</div>
    </div>
  )
}

function SkillItem({ skill, expanded, onToggle }) {
  const style = LABEL_STYLES[skill.label] || LABEL_STYLES['Durable Skill']
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button onClick={onToggle} className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-gray-50 transition-colors">
        {expanded ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
        <span className="font-semibold text-gray-900 flex-1">{skill.skill}</span>
        <MetricTip label={skill.label} body={style.desc}>
          <span className={`text-xs px-2.5 py-1 rounded-full ${style.bg} ${style.text} font-medium`}>{skill.label}</span>
        </MetricTip>
      </button>
      {expanded && (
        <div className="pb-5 px-8 space-y-4">
          {/* Metrics row */}
          <div className="flex flex-wrap gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <Metric label="Frequency in Role" value={fmtPct(skill.frequency)} tip={METRIC_TOOLTIPS.frequency} />
            <Metric label="Skill Specificity" value={fmtPct(skill.specificity)} tip={METRIC_TOOLTIPS.specificity} />
            <Metric label="5-Year Demand Growth"
              value={(skill.growth !== null && skill.growth >= 0 ? '+' : '') + fmtPct(skill.growth, 0)}
              tip={METRIC_TOOLTIPS.growth} positive={(skill.growth ?? 0) >= 0} />
            <Metric label="Wage Premium"
              value={skill.wagePremium === null ? 'N/A' : (skill.wagePremium >= 0 ? '+' : '') + fmtPct(skill.wagePremium)}
              tip={METRIC_TOOLTIPS.wagePremium} positive={skill.wagePremium === null ? undefined : skill.wagePremium >= 0} />
          </div>

          {/* Definition */}
          <div>
            <h4 className="text-sm font-bold text-bgi-navy mb-1">Definition</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{skill.definition}</p>
          </div>

          {/* How used */}
          <div>
            <h4 className="text-sm font-bold text-bgi-navy mb-1">How this skill is used in this role</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{skill.utilization}</p>
          </div>

          {/* Proficiency levels */}
          <div>
            <h4 className="text-sm font-bold text-bgi-navy mb-2">Proficiency levels</h4>
            <div className="space-y-2">
              <div className="border-l-3 border-bgi-ltblue pl-3 py-1" style={{borderLeftWidth: '3px'}}>
                <div className="text-xs font-bold text-bgi-midblue mb-0.5">Level 1 — Foundational</div>
                <p className="text-sm text-gray-700 leading-relaxed">{skill.level1}</p>
              </div>
              <div className="border-l-3 border-bgi-orange pl-3 py-1" style={{borderLeftWidth: '3px'}}>
                <div className="text-xs font-bold text-bgi-orange mb-0.5">Level 2 — Proficient</div>
                <p className="text-sm text-gray-700 leading-relaxed">{skill.level2}</p>
              </div>
              <div className="border-l-3 border-bgi-crimson pl-3 py-1" style={{borderLeftWidth: '3px'}}>
                <div className="text-xs font-bold text-bgi-crimson mb-0.5">Level 3 — Advanced</div>
                <p className="text-sm text-gray-700 leading-relaxed">{skill.level3}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProfilesTab() {
  const newOccs = data.newOccupations
  const [selected, setSelected] = useState(newOccs[0])
  const [expanded, setExpanded] = useState(new Set())

  const profile = data.profiles[selected]
  const skills = profile.skills

  const groupedSkills = useMemo(() => {
    const g = {}
    CATEGORY_ORDER.forEach(c => { g[c] = [] })
    skills.forEach(s => {
      if (!g[s.category]) g[s.category] = []
      g[s.category].push(s)
    })
    Object.keys(g).forEach(k => g[k].sort((a,b) => (b.frequency ?? 0) - (a.frequency ?? 0)))
    return g
  }, [skills])

  const toggle = (id) => {
    const n = new Set(expanded)
    if (n.has(id)) n.delete(id); else n.add(id)
    setExpanded(n)
  }
  const toggleAll = (open) => {
    if (open) setExpanded(new Set(skills.map(s => `${selected}::${s.skill}`)))
    else setExpanded(new Set())
  }

  const newIdx = newOccs.indexOf(selected) + 1

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-6">
      {/* Occupation selector */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-bgi-navy uppercase tracking-wider mb-1.5">
            New Occupation Profile ({newIdx} of {newOccs.length})
          </label>
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setExpanded(new Set()) }}
            className="w-full lg:w-[520px] text-lg font-bold text-bgi-navy bg-white border-2 border-bgi-navy rounded-lg px-4 py-2.5 cursor-pointer hover:bg-blue-50"
          >
            {newOccs.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { const i = newOccs.indexOf(selected); if (i > 0) { setSelected(newOccs[i-1]); setExpanded(new Set()) } }}
            disabled={newOccs.indexOf(selected) === 0}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >← Previous</button>
          <button
            onClick={() => { const i = newOccs.indexOf(selected); if (i < newOccs.length-1) { setSelected(newOccs[i+1]); setExpanded(new Set()) } }}
            disabled={newOccs.indexOf(selected) === newOccs.length-1}
            className="px-4 py-2.5 bg-bgi-navy text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-40"
          >Next →</button>
        </div>
      </div>

      {/* Role header */}
      <div className="border-b-2 border-bgi-navy pb-4 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-bgi-crimson bg-bgi-peach px-2 py-0.5 rounded">New occupation profile</span>
        </div>
        <h1 className="text-3xl font-bold text-bgi-navy">{selected}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {profile.totalSkills} skills across {CATEGORY_ORDER.filter(c => (groupedSkills[c]||[]).length > 0).length} categories.
          Click any skill for its definition, how it's used in this role, and the three proficiency levels.
        </p>
      </div>

      {/* Expand/collapse controls */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => toggleAll(true)} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Expand all</button>
        <button onClick={() => toggleAll(false)} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Collapse all</button>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {CATEGORY_ORDER.map(cat => {
          const list = groupedSkills[cat] || []
          if (list.length === 0) return null
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 rounded" style={{backgroundColor: CATEGORY_COLORS[cat]}}></div>
                <h2 className="text-lg font-bold" style={{color: CATEGORY_COLORS[cat]}}>{cat}</h2>
                <MetricTip label={cat} body={CATEGORY_TOOLTIPS[cat]}>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </MetricTip>
                <span className="text-sm text-gray-400">({list.length})</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3">
                {list.map(s => {
                  const id = `${selected}::${s.skill}`
                  return <SkillItem key={id} skill={s} expanded={expanded.has(id)} onToggle={() => toggle(id)} />
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
