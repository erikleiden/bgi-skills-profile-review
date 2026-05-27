import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, PlusCircle, MinusCircle, RotateCcw, Wrench, Info, Settings } from 'lucide-react'
import data from '../data/data.json'

const CATEGORY_COLORS = {
  'Foundational & Leadership Skills': '#024879',
  'Baseline Applied Skills': '#42769B',
  'Core Role-Specific Skills': '#E0712A',
  'Specialization': '#C12035',
}

const LABEL_STYLES = {
  'Durable Skill':       { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  'High Value Skill':    { bg: 'bg-amber-100',   text: 'text-amber-800' },
  'High Growth Skill':   { bg: 'bg-sky-100',     text: 'text-sky-800' },
  'Declining Skill':     { bg: 'bg-gray-200',    text: 'text-gray-700' },
}

const ACTION_ICONS = {
  removed: { Icon: MinusCircle, color: '#C12035', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Removed' },
  restored: { Icon: RotateCcw, color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Restored' },
  consolidated: { Icon: Wrench, color: '#E0712A', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Consolidated' },
}

function fmtPct(v, dec=0) {
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

function SkillCard({ skill, kind }) {
  const labelStyle = LABEL_STYLES[skill.label] || LABEL_STYLES['Durable Skill']
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 leading-tight">{skill.skill}</div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{color: CATEGORY_COLORS[skill.category] || '#6b7280'}}>
              {skill.category?.replace(' Skills','')}
            </span>
            {skill.label && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${labelStyle.bg} ${labelStyle.text} font-medium`}>
                {skill.label}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
        <div>
          <div className="text-gray-400 text-[10px]">Freq</div>
          <div className="font-mono font-semibold text-gray-700">{fmtPct(skill.frequency, 1)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-[10px]">Spec</div>
          <div className="font-mono font-semibold text-gray-700">{fmtPct(skill.specificity, 1)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-[10px]">Growth</div>
          <div className={`font-mono font-semibold ${(skill.growth ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {skill.growth !== null && skill.growth >= 0 ? '+' : ''}{fmtPct(skill.growth, 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-[10px]">Wage</div>
          <div className={`font-mono font-semibold ${(skill.wagePremium ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {skill.wagePremium !== null && skill.wagePremium >= 0 ? '+' : ''}{fmtPct(skill.wagePremium, 1)}
          </div>
        </div>
      </div>
    </div>
  )
}

function CurationCard({ item }) {
  const cfg = ACTION_ICONS[item.action] || ACTION_ICONS.removed
  const { Icon } = cfg
  return (
    <div className={`border ${cfg.border} ${cfg.bg} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{color: cfg.color}} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{item.skill}</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold" style={{color: cfg.color, backgroundColor: 'white'}}>
              {cfg.label}
            </span>
          </div>
          <div className="text-xs text-gray-700 mt-1">{item.reason}</div>
        </div>
      </div>
    </div>
  )
}

export default function ChangelogTab() {
  const occs = data.existingOccupations
  const [selected, setSelected] = useState(occs[0])
  const [view, setView] = useState('detail') // 'detail' or 'overview'
  const [showGlobal, setShowGlobal] = useState(false)

  const diff = data.existingDiffs[selected]
  const counts = data.counts

  const totals = useMemo(() => {
    let added = 0, dropped = 0, curated = 0
    occs.forEach(o => {
      const d = data.existingDiffs[o]
      added += d.addedCount
      dropped += d.droppedCount
      curated += d.curation.length
    })
    return { added, dropped, curated }
  }, [occs])

  const occIdx = occs.indexOf(selected) + 1

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">
      {/* Summary header */}
      <div className="bg-gradient-to-br from-bgi-navy to-bgi-midblue text-white rounded-lg p-5 mb-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Existing-role skill changes</h2>
            <p className="text-sm opacity-90 mt-1">For each of the 30 existing occupations: skills added in the current vintage, skills dropped from the reference, and any hand-curation applied.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 rounded p-3 text-center">
              <div className="text-xs uppercase tracking-wide opacity-80">Added</div>
              <div className="text-2xl font-bold">+{totals.added}</div>
            </div>
            <div className="bg-white/10 rounded p-3 text-center">
              <div className="text-xs uppercase tracking-wide opacity-80">Dropped</div>
              <div className="text-2xl font-bold">−{totals.dropped}</div>
            </div>
            <div className="bg-white/10 rounded p-3 text-center">
              <div className="text-xs uppercase tracking-wide opacity-80">Curation actions</div>
              <div className="text-2xl font-bold">{totals.curated}</div>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setView('detail')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'detail' ? 'bg-bgi-navy text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Per-occupation detail
        </button>
        <button
          onClick={() => setView('overview')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'overview' ? 'bg-bgi-navy text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          All-30 overview table
        </button>
        <button
          onClick={() => setShowGlobal(!showGlobal)}
          className="ml-auto px-3 py-1.5 rounded text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-1.5"
        >
          <Settings className="h-3.5 w-3.5" />
          {showGlobal ? 'Hide' : 'Show'} global curation actions
        </button>
      </div>

      {/* Global actions panel */}
      {showGlobal && (
        <div className="mb-5 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-bgi-navy mb-2">Global curation actions (applied to all relevant roles)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {data.globalActions.map((g, i) => (
              <div key={i} className="border-l-2 border-bgi-orange pl-3 py-1">
                <div className="text-sm font-semibold text-gray-900">{g.title}</div>
                <div className="text-xs text-gray-600 mt-0.5">{g.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'detail' && (
        <>
          {/* Occupation selector */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-bold text-bgi-navy uppercase tracking-wider mb-1.5">
                Existing Occupation ({occIdx} of {occs.length})
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full lg:w-[480px] text-lg font-bold text-bgi-navy bg-white border-2 border-bgi-navy rounded-lg px-4 py-2.5 cursor-pointer hover:bg-blue-50"
              >
                {occs.map(o => {
                  const c = counts[o]
                  return <option key={o} value={o}>{o} ({c.total} skills)</option>
                })}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { const i = occs.indexOf(selected); if (i > 0) setSelected(occs[i-1]) }}
                disabled={occs.indexOf(selected) === 0}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                onClick={() => { const i = occs.indexOf(selected); if (i < occs.length-1) setSelected(occs[i+1]) }}
                disabled={occs.indexOf(selected) === occs.length-1}
                className="px-4 py-2.5 bg-bgi-navy text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Per-occupation stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total skills</div>
              <div className="text-2xl font-bold text-bgi-navy mt-0.5">{counts[selected].total}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Overlap</div>
              <div className="text-2xl font-bold text-emerald-700 mt-0.5">{counts[selected].overlap}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-sky-700 uppercase tracking-wide font-medium">Added</div>
              <div className="text-2xl font-bold text-sky-700 mt-0.5">+{diff.addedCount}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-rose-700 uppercase tracking-wide font-medium">Dropped</div>
              <div className="text-2xl font-bold text-rose-700 mt-0.5">−{diff.droppedCount}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-bgi-orange uppercase tracking-wide font-medium">Curation actions</div>
              <div className="text-2xl font-bold text-bgi-orange mt-0.5">{diff.curation.length}</div>
            </div>
          </div>

          {/* Curation actions */}
          {diff.curation.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-bold text-bgi-orange mb-2 flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Hand-curation applied to this role ({diff.curation.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {diff.curation.map((c, i) => <CurationCard key={i} item={c} />)}
              </div>
            </section>
          )}

          {/* Two-column: Added | Dropped */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section>
              <h3 className="text-base font-bold text-sky-700 mb-2 flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Added in current vintage ({diff.addedCount})
              </h3>
              {diff.pipelineAdded.length === 0 ? (
                <p className="text-sm text-gray-400 italic">None.</p>
              ) : (
                <div className="space-y-2">
                  {diff.pipelineAdded.map((s, i) => <SkillCard key={i} skill={s} kind="added" />)}
                </div>
              )}
            </section>
            <section>
              <h3 className="text-base font-bold text-rose-700 mb-2 flex items-center gap-2">
                <MinusCircle className="h-4 w-4" /> Dropped from reference vintage ({diff.droppedCount})
              </h3>
              {diff.pipelineDropped.length === 0 ? (
                <p className="text-sm text-gray-400 italic">None.</p>
              ) : (
                <div className="space-y-2">
                  {diff.pipelineDropped.map((s, i) => <SkillCard key={i} skill={s} kind="dropped" />)}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {view === 'overview' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Occupation</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right text-emerald-700">Overlap</th>
                <th className="px-3 py-2.5 text-right text-sky-700">Added</th>
                <th className="px-3 py-2.5 text-right text-rose-600">Dropped</th>
                <th className="px-3 py-2.5 text-right text-bgi-orange">Curated</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {occs.map(occ => {
                const c = counts[occ]
                const d = data.existingDiffs[occ]
                return (
                  <tr key={occ} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(occ); setView('detail') }}>
                    <td className="px-4 py-2 font-medium text-gray-900">{occ}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold">{c.total}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-700">{c.overlap}</td>
                    <td className="px-3 py-2 text-right font-mono text-sky-700">+{c.added}</td>
                    <td className="px-3 py-2 text-right font-mono text-rose-600">−{c.dropped}</td>
                    <td className="px-3 py-2 text-right font-mono text-bgi-orange">{d.curation.length || '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-400">
                      <ChevronRight className="h-4 w-4 inline" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
