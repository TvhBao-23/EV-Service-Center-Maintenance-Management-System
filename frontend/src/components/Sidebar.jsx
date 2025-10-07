import { NavLink } from 'react-router-dom'

function Sidebar({ collapsed = false, mobileOpen = false, onClose }) {
  let role = 'customer'
  try { role = JSON.parse(localStorage.getItem('user')||'{}')?.role || 'customer' } catch {}
  const baseItems = [
    { to: '/vehicles', label: 'Xe của tôi', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l7-7 7 7M5 11v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
    )},
    { to: '/tracking', label: 'Theo dõi', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3a1 1 0 112 0v8a1 1 0 01-2 0zm-7 3a1 1 0 100-2 1 1 0 000 2zm14 0a1 1 0 100-2 1 1 0 000 2zM5 12h14"/></svg>
    )},
    { to: '/booking', label: 'Đặt lịch', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    )},
    { to: '/profile', label: 'Hồ sơ & chi phí', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8 8 0 1118.879 4.196 8 8 0 015.12 17.804z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
    { to: '/payment', label: 'Thanh toán', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
    )},
  ]
  const techItems = [
    { to: '/technician', label: 'Kỹ thuật viên', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
    )},
  ]
  const staffItems = [
    { to: '/staff', label: 'Nhân viên', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4 0-7 2-7 4v3h14v-3c0-2-3-4-7-4z"/></svg>
    )},
  ]
  const adminItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    )},
  ]
  const navItems = (role === 'admin') ? adminItems : 
                   (role === 'technican' || role === 'technician') ? techItems : 
                   (role === 'staff') ? staffItems : baseItems

  const containerBase = `bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40 transition-all duration-200`
  const desktopClass = collapsed ? 'w-16' : 'w-64'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex md:flex-col ${containerBase} ${desktopClass}`}>
        <div className={`h-16 px-4 flex items-center border-b ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-green-100">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            {!collapsed && <span className="font-semibold">EV Service Center</span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-gray-500">{item.icon}</span>
                  {!collapsed && item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`p-3 border-t text-xs text-gray-500 ${collapsed ? 'text-center' : ''}`}>© 2025</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className={`absolute inset-y-0 left-0 w-64 ${containerBase} flex flex-col`}> 
            <div className="h-16 px-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-green-100">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span className="font-semibold">EV Service Center</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={onClose}
                    >
                      <span className="text-gray-500">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar


