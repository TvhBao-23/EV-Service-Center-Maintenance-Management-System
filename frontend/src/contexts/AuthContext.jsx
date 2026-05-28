import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, customerAPI, staffAPI } from '../lib/api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ensure one canonical user per email in localStorage.users and align stored user
  const reconcileUserByEmail = (email) => {
    try {
      if (!email) return null
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const sameEmail = users.filter(u => u.email === email)
      if (sameEmail.length <= 1) return sameEmail[0] || null

      // Keep the earliest (first) record as canonical, merge fields from others when missing
      const canonical = { ...sameEmail[0] }
      for (let i = 1; i < sameEmail.length; i++) {
        const u = sameEmail[i]
        for (const k of ['fullName','phone','role','customerId','address','dateOfBirth','emergencyContact','emergencyPhone','password','id']) {
          if ((canonical[k] === undefined || canonical[k] === '' || canonical[k] === null) && u[k] !== undefined && u[k] !== '') {
            canonical[k] = u[k]
          }
        }
      }
      // Write back deduped array: put canonical first, remove others
      const deduped = [canonical, ...users.filter(u => u.email !== email)]
      localStorage.setItem('users', JSON.stringify(deduped))

      // Align stored user object if same email
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (storedUser && storedUser.email === email) {
        const aligned = { ...storedUser, ...canonical }
        localStorage.setItem('user', JSON.stringify(aligned))
        setUser(aligned)
      }
      return canonical
    } catch {
      return null
    }
  }

  useEffect(() => {
    // Load user from localStorage on mount and verify with backend
    loadUserFromStorage()
  }, [])

  const loadUserFromStorage = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')
      
      console.log('Loading user from storage:', savedUser, authToken)
      
      if (savedUser && authToken) {
        // For admin users, don't verify with backend
        const userData = JSON.parse(savedUser)
        // If using local auth token, trust local data to avoid wiping profile
        if (authToken === 'local-token') {
          console.log('Local token detected, using saved user without backend verification')
          // Reconcile duplicates for safety
          reconcileUserByEmail(userData.email)
          setUser(JSON.parse(localStorage.getItem('user') || savedUser))
          return
        }
        if (userData.email === 'admin@gmail.com') {
          console.log('Admin user found in storage, setting directly')
          setUser(userData)
          return
        }
        
        // Verify token with backend for other users
        try {
          const profile = await customerAPI.getProfile()
          setUser({
            ...userData,
            ...profile
          })
        } catch (error) {
          // If backend not reachable, keep local user instead of clearing
          console.warn('Backend profile verification failed, retaining local user')
          reconcileUserByEmail(userData.email)
          setUser(JSON.parse(localStorage.getItem('user') || savedUser))
          return
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', email, password)
      
      // Try backend API first (microservices architecture)
      try {
        const response = await authAPI.login(email, password)
      
        if (response.token) {
          // Get user info from /api/auth/me to determine role
          try {
            const userInfo = await authAPI.getMe()
            
            // Check if user is staff/technician/admin
            if (userInfo.role && ['admin', 'staff', 'technician'].includes(userInfo.role.toLowerCase())) {
              const userData = {
                id: userInfo.userId,
                fullName: userInfo.fullName,
                email: userInfo.email,
                phone: userInfo.phone || '',
                role: userInfo.role.toLowerCase(),
                isStaff: true,
                isActive: true
              }
              
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
              localStorage.setItem('authToken', response.token)
              
              return { success: true, user: userData }
            }
          } catch (meError) {
            console.log('Failed to get user info from /me, trying customer profile...', meError)
          }
          
          // For customer users, get customer profile
          try {
            const profile = await customerAPI.getProfile()
            
            const userData = {
              id: profile.user_id,
              fullName: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              customerId: profile.customer_id,
              address: profile.address
            }
            
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('authToken', response.token)
            
            return { success: true, user: userData }
          } catch (profileError) {
            // If profile fetch fails, still return success for login
            return { success: true, user: { email, role: 'customer' } }
          }
        }
      } catch (backendError) {
        // No fallback - API only
        console.error('Backend login failed:', backendError)
        throw backendError
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Đăng nhập thất bại' }
    }
  }

  const loginStaff = async (email, password) => {
    try {
      console.log('Staff login attempt:', email)
      
      const response = await staffAPI.login(email, password)
      
      if (response.token) {
        // Get user info from /me endpoint to get correct role
        try {
          const userInfo = await staffAPI.getProfile()
          
          const userData = {
            id: userInfo.userId,
            fullName: userInfo.fullName,
            email: userInfo.email,
            phone: userInfo.phone,
            role: userInfo.role.toLowerCase(), // admin, staff, technician
            isStaff: true,
            isActive: true
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('authToken', response.token)
          
          return { success: true, user: userData }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError)
          // Fallback: use email to determine basic info
          const userData = {
            id: email,
            fullName: email.split('@')[0],
            email: email,
            phone: '',
            role: 'staff',
            isStaff: true,
            isActive: true
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('authToken', response.token)
          
          return { success: true, user: userData }
        }
      }
      
      return { success: false, error: 'Staff login failed' }
    } catch (error) {
      console.error('Staff login error:', error)
      return { success: false, error: error.message || 'Đăng nhập nhân viên thất bại' }
    }
  }

  const register = async (userData) => {
    try {
      console.log('🔵 REGISTER START - Clearing old data...')
      
      // STEP 1: Clear ALL existing auth data to prevent using old token/user
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('users') // Clear old users array to prevent data leakage
      setUser(null)
      
      console.log('🔵 REGISTER - Calling register API...')
      
      // STEP 2: API only - no fallback
      const response = await authAPI.register(userData)
      
      console.log('🔵 REGISTER - Response received:', { 
        status: response.status,
        hasToken: !!response.token,
        email: userData.email 
      })
      
      if (response.status === 'success' || response.token) {
        console.log('🔵 REGISTER - Success! Logging in automatically...')
        return await login(userData.email, userData.password)
      }
      
      console.error('❌ REGISTER FAILED - No token or success status received')
      return { success: false, error: 'Đăng ký thất bại' }
    } catch (error) {
      console.error('❌ REGISTER ERROR:', error)
      return { success: false, error: error.message || 'Đăng ký thất bại' }
    }
  }

  const registerStaff = async (userData) => {
    try {
      console.log('🟢 STAFF REGISTER START - Clearing old data...')
      
      // STEP 1: Clear existing auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setUser(null)
      
      console.log('🟢 STAFF REGISTER - Calling API...', { email: userData.email, role: userData.role })
      
      // STEP 2: Call staff registration API
      const response = await fetch('http://localhost:8090/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      console.log('🟢 STAFF REGISTER - Response received:', { 
        status: data.status,
        hasToken: !!data.token,
        email: userData.email,
        role: userData.role
      })
      
      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }
      
      if (data.status === 'success' || (data.token && data.user)) {
        console.log('🟢 STAFF REGISTER - Success! Logging in automatically...')
        return await loginStaff(userData.email, userData.password)
      }
      
      console.error('❌ STAFF REGISTER FAILED - No token or success status received')
      return { success: false, error: 'Đăng ký thất bại' }
    } catch (error) {
      console.error('❌ STAFF REGISTER ERROR:', error)
      return { success: false, error: error.message || 'Đăng ký nhân viên thất bại' }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }

  const updateUser = async (userData) => {
    try {
      // Since backend APIs are not available, we'll use localStorage
      const oldEmail = user.email
      const newEmail = userData.email
      
      // Update user data in localStorage
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // If email changed, update the user database in localStorage
      if (oldEmail !== newEmail) {
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // Find and update the user
        const userIndex = users.findIndex(u => u.email === oldEmail)
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...userData }
          localStorage.setItem('users', JSON.stringify(users))
        }
        
        // Also update remembered email if it exists
        const rememberedEmail = localStorage.getItem('rememberedEmail')
        if (rememberedEmail === oldEmail) {
          localStorage.setItem('rememberedEmail', newEmail)
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    setUser,
    login,
    loginStaff,
    register,
    registerStaff,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
