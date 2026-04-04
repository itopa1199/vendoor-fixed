import { Link } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'

interface TopbarProps {
  title:        string
  onMenuClick?: () => void
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const notifCount = useAdminStore(s => s.notifCount)

  return (
    <header className="h-[var(--hh,52px)] bg-white border-b border-[#E2E0DA] flex items-center px-4 gap-3 sticky top-0 z-10 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden w-8 h-8 rounded-[8px] bg-[#ECEAE4] border border-[#E2E0DA] flex items-center justify-center text-[16px]"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <div className="flex-1 text-[15px] font-bold truncate">{title}</div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-[#ECEAE4] border border-[#E2E0DA] rounded-[8px] px-3 py-1.5 w-44">
          <span className="text-[#A8A79F] text-[12px]">🔍</span>
          <input
            className="flex-1 border-none outline-none bg-transparent text-[12px] min-w-0"
            placeholder="Quick search…"
          />
        </div>

        {/* Notifications */}
        <Link
          to="/admin/notifications"
          className="w-8 h-8 rounded-[8px] bg-[#ECEAE4] border border-[#E2E0DA] flex items-center justify-center text-[14px] relative hover:bg-[#E2E0DA] transition-colors"
        >
          🔔
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] rounded-full border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link
          to="/admin/settings"
          className="w-8 h-8 rounded-[8px] bg-[#ECEAE4] border border-[#E2E0DA] flex items-center justify-center text-[14px] hover:bg-[#E2E0DA] transition-colors"
        >
          ⚙️
        </Link>
      </div>
    </header>
  )
}
