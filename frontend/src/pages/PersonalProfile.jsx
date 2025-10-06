import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getCurrentUserId, loadList } from '../lib/store'

function PersonalProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userId = getCurrentUserId()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update user data in localStorage
    const updatedUser = { ...user, ...formData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    setIsLoading(false)
    setIsEditing(false)
    setMessage('Cập nhật thông tin thành công!')
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || ''
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h2>
            <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân của bạn</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
            aria-label="Đăng xuất"
          >
            Đăng xuất
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập địa chỉ email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Liên hệ khẩn cấp</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Tên người liên hệ khẩn cấp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại khẩn cấp</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Số điện thoại liên hệ khẩn cấp"
              />
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Đổi mật khẩu
              </button>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố</h4>
                <p className="text-sm text-gray-600">Thêm lớp bảo mật cho tài khoản</p>
              </div>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Bật 2FA
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PersonalProfile
