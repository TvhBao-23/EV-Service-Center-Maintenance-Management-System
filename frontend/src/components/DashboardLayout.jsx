import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const navigate = useNavigate()
  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [])
  const displayName = user?.fullName || user?.email || 'Khách hàng'
  const initials = (displayName || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()

  const handleProfileClick = () => {
    navigate('/personal-profile')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`${collapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        <header className="h-16 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden md:inline-flex p-2 rounded-md hover:bg-gray-100"
              title={collapsed ? 'Mở sidebar' : 'Đóng sidebar'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10"/></svg>
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-1 transition-colors"
              title="Xem thông tin cá nhân"
            >
              <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                {initials || 'KH'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-800">{displayName}</span>
            </button>
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout


