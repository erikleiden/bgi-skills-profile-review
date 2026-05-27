import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ProfilesTab from './components/ProfilesTab'
import ChangelogTab from './components/ChangelogTab'

export default function App() {
  const [tab, setTab] = useState('profiles')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <nav className="bg-white border-b border-gray-200 px-8 sticky top-[73px] z-10">
        <div className="flex gap-1 max-w-[1500px] mx-auto">
          <button
            onClick={() => setTab('profiles')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
              tab === 'profiles'
                ? 'border-bgi-orange text-bgi-navy'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            New occupation profiles
          </button>
          <button
            onClick={() => setTab('changelog')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
              tab === 'changelog'
                ? 'border-bgi-orange text-bgi-navy'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Curation changelog
          </button>
        </div>
      </nav>
      <main className="flex-1">
        {tab === 'profiles' && <ProfilesTab />}
        {tab === 'changelog' && <ChangelogTab />}
      </main>
      <Footer />
    </div>
  )
}
