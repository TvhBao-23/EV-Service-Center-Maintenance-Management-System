import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Unified Navigation Bar for Admin, Staff, and Technician roles
 * Provides quick access to switch between different role dashboards
 */
function RoleBasedNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  const displayName = user?.fullName || user?.email || 'User'
  const initials = (displayName || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
  const userRole = user?.role || 'customer'

  // Define navigation links based on user role
  // Users can access multiple role dashboards if they have permissions
  const roleLinks = [
    { path: '/staff', label: 'Nhân viên', icon: '👔', roles: ['staff', 'admin'] },
    { path: '/technician', label: 'Kỹ thuật viên', icon: '🔧', roles: ['technician', 'admin'] },
    { path: '/admin', label: 'Quản trị', icon: '👨‍💼', roles: ['admin'] }
  ]

  // Filter links based on user role
  const availableLinks = roleLinks.filter(link =>
    link.roles.includes(userRole) || userRole === 'admin' // Admin can access all
  )
  const showRoleSwitcher = availableLinks.length > 1 && !location.pathname.startsWith('/admin')

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
    setRoleDropdownOpen(false)
  }

  const handleRoleClick = () => {
    setRoleDropdownOpen(!roleDropdownOpen)
    setProfileDropdownOpen(false)
  }

  const handlePersonalInfo = () => {
    navigate('/personal-profile')
    setProfileDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileDropdownOpen(false)
  }

  const handleNavigate = (path) => {
    navigate(path)
    setRoleDropdownOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setProfileDropdownOpen(false)
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get current role display
  const getCurrentRole = () => {
    const currentPath = location.pathname
    if (currentPath.startsWith('/admin')) return { label: 'Admin', icon: '👨‍💼', color: 'purple' }
    if (currentPath.startsWith('/staff')) return { label: 'Nhân viên', icon: '👔', color: 'blue' }
    if (currentPath.startsWith('/technician')) return { label: 'Kỹ thuật viên', icon: '🔧', color: 'orange' }
    return { label: userRole, icon: '👤', color: 'gray' }
  }

  const currentRole = getCurrentRole()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-40 shadow-sm">
      {/* Left: Logo + App Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-gray-900">EV Service Center</h1>
          <p className="text-xs text-gray-500">Quản lý bảo dưỡng xe điện</p>
        </div>
      </div>

      {/* Center: Role Switcher - hidden on admin dashboard */}
      {showRoleSwitcher && (
        <div className="hidden md:flex items-center gap-2">
          {availableLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path)
            return (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={`Chuyển sang ${link.label}`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="hidden lg:inline">{link.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Right: User Profile + Role Badge */}
      <div className="flex items-center gap-3">
        {/* Current Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm">
          <span className="text-base">{currentRole.icon}</span>
          <span className="font-medium text-gray-700">{currentRole.label}</span>
        </div>

        {/* Mobile: Role Switcher Dropdown */}
        {showRoleSwitcher && (
          <div className="md:hidden dropdown-container relative">
            <button
              onClick={handleRoleClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Chuyển vai trò"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase">Chuyển vai trò</p>
                </div>
                {availableLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                      location.pathname.startsWith(link.path) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown-container relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            title="Tài khoản"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-[120px] truncate">
              {displayName}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <button
                onClick={handlePersonalInfo}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Thông tin cá nhân</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default RoleBasedNav

