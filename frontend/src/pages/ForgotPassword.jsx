import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api.js'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Enter email, 2: Enter OTP, 3: New password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [generatedOTP, setGeneratedOTP] = useState('') // For demo purposes

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setMessage('Email không hợp lệ!')
        setMessageType('error')
        setIsLoading(false)
        return
      }

      // Call backend API to send OTP
      const response = await authAPI.sendOTP(email)
      
      if (response.success) {
        // Store OTP for demo (backend returns it for testing)
        if (response.otp) {
          setGeneratedOTP(response.otp)
        }
        
        setStep(2)
        setMessage(`Mã OTP đã được gửi đến ${email}${response.otp ? '. Mã OTP: ' + response.otp : ''}`)
        setMessageType('success')
      } else {
        setMessage(response.error || 'Không thể gửi mã OTP')
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.message || 'Email không tồn tại trong hệ thống. Vui lòng đăng ký hoặc dùng email đã tạo tài khoản.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      // Call backend API to verify OTP
      const response = await authAPI.verifyOTP(email, otp)
      
      if (response.success) {
        setStep(3)
        setMessage('Xác thực thành công! Vui lòng nhập mật khẩu mới.')
        setMessageType('success')
      } else {
        setMessage(response.error || 'Mã OTP không chính xác!')
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.message || 'Mã OTP không chính xác!')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      // Validate password
      if (newPassword.length < 6) {
        setMessage('Mật khẩu phải có ít nhất 6 ký tự!')
        setMessageType('error')
        setIsLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setMessage('Mật khẩu xác nhận không khớp!')
        setMessageType('error')
        setIsLoading(false)
        return
      }

      // Call backend API to reset password
      const response = await authAPI.resetPassword(email, otp, newPassword)
      
      if (response.success) {
        setMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.')
        setMessageType('success')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessage(response.error || 'Không thể đặt lại mật khẩu')
        setMessageType('error')
      }
    } catch (error) {
      setMessage(error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {step === 1 && 'Quên mật khẩu?'}
            {step === 2 && 'Xác thực OTP'}
            {step === 3 && 'Đặt lại mật khẩu'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && 'Nhập email của bạn để nhận mã OTP'}
            {step === 2 && 'Nhập mã OTP đã được gửi đến email của bạn'}
            {step === 3 && 'Nhập mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center px-4">
          <div className="flex-1">
            <div className={`h-1 rounded ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <p className={`text-xs mt-2 ${step >= 1 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Email</p>
          </div>
          <div className="w-8"></div>
          <div className="flex-1">
            <div className={`h-1 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <p className={`text-xs mt-2 ${step >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>OTP</p>
          </div>
          <div className="w-8"></div>
          <div className="flex-1">
            <div className={`h-1 rounded ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <p className={`text-xs mt-2 ${step >= 3 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Mật khẩu</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </div>
                ) : (
                  'Gửi mã OTP'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Nhập mã 6 số đã được gửi đến {email}</p>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
