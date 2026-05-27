export default function Footer() {
  return (
    <footer className="border-t border-gray-200 px-8 py-4 text-xs text-gray-500 bg-white">
      © {new Date().getFullYear()} Burning Glass Institute · Skills-First Workforce Initiative ·
      <a href="https://burningglassinstitute.org" className="ml-1 underline hover:text-bgi-navy">burningglassinstitute.org</a>
    </footer>
  )
}
