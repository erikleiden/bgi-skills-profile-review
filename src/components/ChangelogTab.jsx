import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Tag, Layers, Trash2, AlertTriangle, Wrench, RotateCcw } from 'lucide-react'
import data from '../data/data.json'

const CATEGORY_ICONS = {
  'Stockers and Order Fillers refinement': RotateCcw,
  'Source-file additions (2026-05-13 pipeline)': FileText,
  'Taxonomy & ontology fixes': Tag,
  'Skill consolidation (de-duplication)': Layers,
  'Per-occupation curation': Wrench,
  'Outlier handling': AlertTriangle,
}

const CATEGORY_COLORS = {
  'Stockers and Order Fillers refinement': '#C12035',
  'Source-file additions (2026-05-13 pipeline)': '#024879',
  'Taxonomy & ontology fixes': '#42769B',
  'Skill consolidation (de-duplication)': '#E0712A',
  'Per-occupation curation': '#024879',
  'Outlier handling': '#C12035',
}

export default function ChangelogTab() {
  const [openSections, setOpenSections] = useState(new Set(data.changelog.map(c => c.category)))

  const toggle = (cat) => {
    const n = new Set(openSections)
    if (n.has(cat)) n.delete(cat); else n.add(cat)
    setOpenSections(n)
  }

  const expandAll = () => setOpenSections(new Set(data.changelog.map(c => c.category)))
  const collapseAll = () => setOpenSections(new Set())

  const totalItems = data.changelog.reduce((s,c) => s + c.items.length, 0)

  // Stats
  const counts = data.counts
  const existing = Object.entries(counts).filter(([,c]) => c.roleStatus === 'existing')
  const newRoles = Object.entries(counts).filter(([,c]) => c.roleStatus === 'new')

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">
      {/* Summary header */}
      <div className="bg-gradient-to-br from-bgi-navy to-bgi-midblue text-white rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Curation changelog</h2>
        <p className="text-sm opacity-90 mb-4">All decisions applied to the source file between the 2026-05-06 vintage and today's review version.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs uppercase tracking-wide opacity-80">Categories of change</div>
            <div className="text-2xl font-bold mt-0.5">{data.changelog.length}</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs uppercase tracking-wide opacity-80">Discrete decisions</div>
            <div className="text-2xl font-bold mt-0.5">{totalItems}</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs uppercase tracking-wide opacity-80">Occupations covered</div>
            <div className="text-2xl font-bold mt-0.5">{data.meta.totalOccupations}</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="text-xs uppercase tracking-wide opacity-80">Skill rows in final file</div>
            <div className="text-2xl font-bold mt-0.5">{data.meta.totalSkills}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600">
          {newRoles.length} new occupation profiles · {existing.length} existing occupations adjusted
        </p>
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Expand all</button>
          <button onClick={collapseAll} className="text-xs px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Collapse all</button>
        </div>
      </div>

      {/* Changelog sections */}
      <div className="space-y-3">
        {data.changelog.map((section, idx) => {
          const isOpen = openSections.has(section.category)
          const Icon = CATEGORY_ICONS[section.category] || FileText
          const color = CATEGORY_COLORS[section.category] || '#024879'
          return (
            <div key={section.category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(section.category)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <div className="rounded-md p-2" style={{backgroundColor: color + '15'}}>
                  <Icon className="h-5 w-5" style={{color}} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{section.category}</h3>
                  <p className="text-xs text-gray-500">{section.items.length} item{section.items.length === 1 ? '' : 's'}</p>
                </div>
                {isOpen ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Per-occupation final counts */}
      <div className="mt-8">
        <h3 className="font-bold text-bgi-navy mb-3 text-lg">Per-occupation final skill counts</h3>
        <p className="text-sm text-gray-600 mb-3">
          For existing occupations: <span className="font-semibold text-emerald-700">overlap</span> = unchanged · <span className="font-semibold text-sky-700">added</span> = new in current vintage · <span className="font-semibold text-rose-600">dropped</span> = in reference only.
        </p>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Occupation</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right text-emerald-700">Overlap</th>
                <th className="px-3 py-2.5 text-right text-sky-700">Added</th>
                <th className="px-3 py-2.5 text-right text-rose-600">Dropped</th>
                <th className="px-3 py-2.5 text-right text-bgi-orange">New role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(counts).map(([occ, c]) => (
                <tr key={occ} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{occ}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.roleStatus === 'new' ? 'bg-bgi-peach text-bgi-crimson' : 'bg-gray-100 text-gray-600'}`}>
                      {c.roleStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{c.total}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-700">{c.overlap || '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-sky-700">{c.added || '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-rose-600">{c.dropped || '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-bgi-orange">{c.newRoleSkill || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
