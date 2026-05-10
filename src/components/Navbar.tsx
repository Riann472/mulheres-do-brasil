import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-rose-600' : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-rose-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-xs leading-none">M</span>
            </div>
            <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-xs leading-none">S</span>
            </div>
          </div>
          <span className="font-bold text-gray-800 text-sm leading-tight hidden xs:block sm:block">
            Mulheres do Brasil <span className="text-gray-400 font-normal">&</span> SENAI
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/dados" className={linkClass}>
            Dados
          </NavLink>
          <NavLink
            to="/dados"
            className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ver dados
          </NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/dados"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
            onClick={() => setOpen(false)}
          >
            Dados
          </NavLink>
        </div>
      )}
    </nav>
  )
}
