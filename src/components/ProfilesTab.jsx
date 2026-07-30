import { useMemo, useState, useEffect } from 'react'
import { HelpCircle, X, Info } from 'lucide-react'
import data from '../data/data.json'

// skills-first.org category order
const CATEGORY_ORDER = [
  'Core Role-Specific Skills',
  'Baseline Applied Skills',
  'Foundational & Leadership Skills',
  'Specialization',
]

const CATEGORY_COLORS = {
  'Core Role-Specific Skills': '#E0712A',       // orange
  'Baseline Applied Skills': '#42769B',          // mid blue
  'Foundational & Leadership Skills': '#024879', // navy
  'Specialization': '#C12035',                    // crimson
}

const CATEGORY_TINTS = {
  'Core Role-Specific Skills': '#FEF3EB',
  'Baseline Applied Skills': '#EEF3F7',
  'Foundational & Leadership Skills': '#E6EEF4',
  'Specialization': '#FBEAEC',
}

const LABEL_STYLES = {
  'Durable Skill':       { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  'High Value Skill':    { bg: 'bg-amber-100',   text: 'text-amber-800' },
  'High Growth Skill':   { bg: 'bg-sky-100',     text: 'text-sky-800' },
  'Declining Skill':     { bg: 'bg-gray-200',    text: 'text-gray-700' },
}

const METRIC_TIPS = {
  frequency: 'Share of postings for this occupation that mention this skill.',
  specificity: 'How distinctive this skill is to this occupation vs. others. Higher = more specific.',
  growth: '5-year projected demand growth (capped at +100% for readability).',
  wagePremium: 'Wage premium associated with possessing this skill.',
}

// Discussion prompts per role — one per new profile
const DISCUSSION_PROMPTS = {
  'Accountants & Auditors': 'External Auditing and Internal Auditing both sit in Core — merge into one "Auditing," or does the distinction matter?',
  'Bookkeepers and Auditing Clerks': 'Full Cycle Accounting sits in Core alongside its component skills (General Ledger, Bank Reconciliations, Month-End Closing). Redundant summary skill, or does it add signal on its own?',
  'Business Operations Specialists': 'Stakeholder Engagement (Core) and Influencing Skills (F&L) overlap heavily — merge, or keep distinct?',
  'Computer User Support Specialists': 'Customer Service (Baseline) and Customer Support (Core) both live on the profile — merge, or keep separate?',
  'Computer and Information Systems Managers': 'Business Strategies and Strategic Planning both sit in F&L — merge, or real distinction?',
  'Management Analysts': 'Business Operations, Business Systems Analysis, and Business Requirements all live in Core — are all three earning their spot?',
  'Market Research Analysts / Marketing Specialists': 'Digital Marketing sits in Specialization while SEO (a subset) is in Core — swap, so Digital Marketing is Core and SEO drops to Specialization?',
  'Office & Admin Supervisors': 'Administrative Functions, Office Management, and Front Office all in Core — do we need all three, or merge?',
  'Paralegals and Legal Assistants': 'Administrative Functions and Administrative Support both sit in Baseline — near-duplicates. Merge into one?',
  'Secretaries & Administrative Assistants': 'Typing sits in Baseline — genuine skill signal in 2026, or dated relic worth removing?',
}

function fmtPct(v, dec=1) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'N/A'
  return (v*100).toFixed(dec) + '%'
}

function MetricTip({ label, body, children }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-40 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-bgi-navy text-white text-[11px] rounded-lg p-2 shadow-lg pointer-events-none">
        <div className="font-bold mb-0.5">{label}</div>
        <div className="opacity-90">{body}</div>
      </div>
    </div>
  )
}

function CategoryBlock({ category, skills, selectedSkill, onSelectSkill }) {
  const color = CATEGORY_COLORS[category]
  const tint = CATEGORY_TINTS[category]
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-1.5">
        <div className="w-1 h-4 rounded" style={{backgroundColor: color}}></div>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{color}}>
          {category.replace(' Skills','')}
        </h3>
        <span className="text-[11px] text-gray-400">({skills.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map(s => {
          const isSelected = selectedSkill && selectedSkill.skill === s.skill
          return (
            <button
              key={s.skill}
              onClick={() => onSelectSkill(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border transition-all leading-tight"
              style={{
                backgroundColor: isSelected ? color : tint,
                color: isSelected ? 'white' : '#221E20',
                borderColor: color,
                borderWidth: isSelected ? '1.5px' : '1px',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              {s.skill}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DetailPanel({ skill, roleName }) {
  if (!skill) {
    return (
      <div className="h-full flex items-center justify-center text-center px-8 text-gray-400">
        <div>
          <Info className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Click any skill to see its definition, market metrics, and proficiency levels.</p>
        </div>
      </div>
    )
  }
  const cat = skill.category
  const color = CATEGORY_COLORS[cat] || '#024879'
  const labelStyle = LABEL_STYLES[skill.label] || LABEL_STYLES['Durable Skill']

  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      {/* Header */}
      <div className="pb-3 border-b-2" style={{borderColor: color}}>
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{color}}>
            {cat.replace(' Skills','')}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${labelStyle.bg} ${labelStyle.text} font-medium`}>
            {skill.label}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{skill.skill}</h2>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mt-3 mb-4">
        <MetricTip label="Frequency in Role" body={METRIC_TIPS.frequency}>
          <div className="text-center cursor-help">
            <div className="text-[9px] uppercase tracking-wide text-gray-500 font-medium flex items-center justify-center gap-0.5">
              Freq <Info className="h-2 w-2" />
            </div>
            <div className="text-sm font-bold font-mono text-gray-900">{fmtPct(skill.frequency)}</div>
          </div>
        </MetricTip>
        <MetricTip label="Skill Specificity" body={METRIC_TIPS.specificity}>
          <div className="text-center cursor-help">
            <div className="text-[9px] uppercase tracking-wide text-gray-500 font-medium flex items-center justify-center gap-0.5">
              Spec <Info className="h-2 w-2" />
            </div>
            <div className="text-sm font-bold font-mono text-gray-900">{fmtPct(skill.specificity)}</div>
          </div>
        </MetricTip>
        <MetricTip label="5-Year Demand Growth" body={METRIC_TIPS.growth}>
          <div className="text-center cursor-help">
            <div className="text-[9px] uppercase tracking-wide text-gray-500 font-medium flex items-center justify-center gap-0.5">
              Growth <Info className="h-2 w-2" />
            </div>
            <div className={`text-sm font-bold font-mono ${(skill.growth ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {skill.growth !== null && skill.growth >= 0 ? '+' : ''}{fmtPct(skill.growth, 0)}
            </div>
          </div>
        </MetricTip>
        <MetricTip label="Wage Premium" body={METRIC_TIPS.wagePremium}>
          <div className="text-center cursor-help">
            <div className="text-[9px] uppercase tracking-wide text-gray-500 font-medium flex items-center justify-center gap-0.5">
              Wage <Info className="h-2 w-2" />
            </div>
            <div className={`text-sm font-bold font-mono ${(skill.wagePremium ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {skill.wagePremium === null ? 'N/A' : (skill.wagePremium >= 0 ? '+' : '') + fmtPct(skill.wagePremium)}
            </div>
          </div>
        </MetricTip>
      </div>

      {/* Definition */}
      <div className="mb-3">
        <h4 className="text-[11px] font-bold text-bgi-navy uppercase tracking-wide mb-1">Definition</h4>
        <p className="text-xs text-gray-700 leading-relaxed">{skill.definition}</p>
      </div>

      {/* How used */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold text-bgi-navy uppercase tracking-wide mb-1">How this skill is used in this role</h4>
        <p className="text-xs text-gray-700 leading-relaxed">{skill.utilization}</p>
      </div>

      {/* Proficiency levels */}
      <div>
        <h4 className="text-[11px] font-bold text-bgi-navy uppercase tracking-wide mb-2">Proficiency levels</h4>
        <div className="space-y-2">
          <div className="pl-2.5 py-1" style={{borderLeft: '3px solid #81A3BC'}}>
            <div className="text-[10px] font-bold text-bgi-midblue mb-0.5">LEVEL 1 · FOUNDATIONAL</div>
            <p className="text-[11px] text-gray-700 leading-relaxed">{skill.level1}</p>
          </div>
          <div className="pl-2.5 py-1" style={{borderLeft: '3px solid #E0712A'}}>
            <div className="text-[10px] font-bold text-bgi-orange mb-0.5">LEVEL 2 · PROFICIENT</div>
            <p className="text-[11px] text-gray-700 leading-relaxed">{skill.level2}</p>
          </div>
          <div className="pl-2.5 py-1" style={{borderLeft: '3px solid #C12035'}}>
            <div className="text-[10px] font-bold text-bgi-crimson mb-0.5">LEVEL 3 · ADVANCED</div>
            <p className="text-[11px] text-gray-700 leading-relaxed">{skill.level3}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DiscussionModal({ prompt, roleName, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(2, 72, 121, 0.6)'}} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-6 p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3 mb-3">
          <div className="rounded-full bg-bgi-orange p-2 flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-bgi-orange font-bold">Discussion prompt</div>
            <div className="text-sm text-gray-500 mt-0.5">{roleName}</div>
          </div>
        </div>
        <p className="text-lg text-gray-900 leading-relaxed font-medium mt-4">{prompt}</p>
      </div>
    </div>
  )
}

export default function ProfilesTab() {
  const newOccs = data.newOccupations
  const [selected, setSelected] = useState(newOccs[0])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

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

  // Reset selection when switching roles
  useEffect(() => { setSelectedSkill(null); setShowPrompt(false) }, [selected])

  // Escape closes modal
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setShowPrompt(false) }
    if (showPrompt) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPrompt])

  const newIdx = newOccs.indexOf(selected) + 1

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative bg-white">
      {/* Header — role selector */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 flex-shrink-0">
        <span className="text-[10px] font-bold text-bgi-navy uppercase tracking-widest">
          New Occupation Profile {newIdx}/{newOccs.length}
        </span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 max-w-[600px] text-base font-bold text-bgi-navy bg-white border-2 border-bgi-navy rounded-lg px-3 py-1.5 cursor-pointer hover:bg-blue-50"
        >
          {newOccs.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="flex gap-1.5">
          <button
            onClick={() => { const i = newOccs.indexOf(selected); if (i > 0) setSelected(newOccs[i-1]) }}
            disabled={newOccs.indexOf(selected) === 0}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >← Prev</button>
          <button
            onClick={() => { const i = newOccs.indexOf(selected); if (i < newOccs.length-1) setSelected(newOccs[i+1]) }}
            disabled={newOccs.indexOf(selected) === newOccs.length-1}
            className="px-3 py-1.5 bg-bgi-navy text-white rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-40"
          >Next →</button>
        </div>
      </div>

      {/* Split area: skills left, detail right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — skill pills grouped */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="mb-1">
            <h1 className="text-2xl font-bold text-bgi-navy leading-tight">{selected}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{profile.totalSkills} skills · click any pill for details</p>
          </div>
          {CATEGORY_ORDER.map(cat => {
            const list = groupedSkills[cat] || []
            if (list.length === 0) return null
            return (
              <CategoryBlock
                key={cat}
                category={cat}
                skills={list}
                selectedSkill={selectedSkill}
                onSelectSkill={setSelectedSkill}
              />
            )
          })}
        </div>

        {/* Right panel — skill detail */}
        <div className="w-[440px] flex-shrink-0 border-l border-gray-200 bg-gray-50">
          <DetailPanel skill={selectedSkill} roleName={selected} />
        </div>
      </div>

      {/* Floating discussion-prompt button */}
      <button
        onClick={() => setShowPrompt(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-bgi-orange text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-30 group"
        title="Discussion prompt"
      >
        <HelpCircle className="h-7 w-7" />
        <span className="absolute right-full mr-3 whitespace-nowrap bg-bgi-navy text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Discussion prompt
        </span>
      </button>

      {/* Prompt modal */}
      {showPrompt && (
        <DiscussionModal
          prompt={DISCUSSION_PROMPTS[selected] || 'No prompt configured for this role.'}
          roleName={selected}
          onClose={() => setShowPrompt(false)}
        />
      )}
    </div>
  )
}
