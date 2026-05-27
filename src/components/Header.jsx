import bgiLogo from '../assets/BGILogo.png'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-5">
        <a href="https://burningglassinstitute.org" target="_blank" rel="noreferrer">
          <img src={bgiLogo} alt="Burning Glass Institute" className="h-10" />
        </a>
        <div className="border-l border-gray-300 pl-5">
          <h1 className="text-xl font-bold text-bgi-navy leading-tight">Skills-First Profile Review</h1>
          <p className="text-xs text-gray-500">10 new occupation profiles + curation changelog · v2 dated 2026.05.21</p>
        </div>
      </div>
    </header>
  )
}
