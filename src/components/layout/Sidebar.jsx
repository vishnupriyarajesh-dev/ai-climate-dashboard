// src/components/layout/Sidebar.jsx
import { useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudLightning,
  LayoutDashboard,
  Map,
  Plane,
  Zap,
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'forecast', label: 'Forecast', icon: CalendarDays },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'climate', label: 'Climate', icon: BarChart3 },
  { id: 'storm', label: 'Storms', icon: CloudLightning },
  { id: 'travel', label: 'Travel', icon: Plane },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <aside
        className={`hidden md:flex relative flex-col bg-white/90 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 ease-in-out h-screen z-30 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200/60 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>

          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">AtmoSense</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Climate Intelligence</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl relative transition-all duration-200 group ${
                  collapsed ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-gradient-to-r from-aurora-teal to-aurora-violet text-white shadow-lg shadow-aurora-teal/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </button>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-4 border-t border-slate-200/60">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-aurora-emerald animate-pulse" />
              <span className="text-[11px] text-slate-500">Live data · updated now</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-aurora-teal hover:border-aurora-teal/40 transition-all z-10 shadow-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/70 px-2 py-2">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all ${
                  active
                    ? 'bg-gradient-to-r from-aurora-teal to-aurora-violet text-white shadow-lg shadow-aurora-teal/20'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={17} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}