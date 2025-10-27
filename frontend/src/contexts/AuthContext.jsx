import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, customerAPI } from '../lib/api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
          // Token invalid, clear storage
          localStorage.removeItem('user')
          localStorage.removeItem('authToken')
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
      
      // Check localStorage database first
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = users.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        console.log('User found in localStorage database')
        const userData = {
          id: foundUser.id,
          fullName: foundUser.fullName,
          email: foundUser.email,
          phone: foundUser.phone,
          role: foundUser.role || 'customer',
          customerId: foundUser.customerId,
          address: foundUser.address,
          dateOfBirth: foundUser.dateOfBirth,
          emergencyContact: foundUser.emergencyContact,
          emergencyPhone: foundUser.emergencyPhone
        }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('authToken', 'local-token')
        return { success: true, user: userData }
      }
      
      // Fast-path for admin account to avoid backend dependency issues
      if (email === 'admin@gmail.com' && password === 'admin') {
        console.log('Admin login detected, bypassing backend')
        const adminUser = {
          id: 'admin-1',
          fullName: 'Administrator',
          email: 'admin@gmail.com',
          phone: '',
          role: 'admin',
          customerId: null,
          address: ''
        }
        setUser(adminUser)
        localStorage.setItem('user', JSON.stringify(adminUser))
        localStorage.setItem('authToken', 'admin-token')
        console.log('Admin user set:', adminUser)
        return { success: true, user: adminUser }
      }

      // Try backend API as fallback
      const response = await authAPI.login(email, password)
      
      if (response.token) {
        // For admin users logging via backend, still allow without fetching customer profile
        if (email === 'admin@gmail.com') {
          const userData = {
            id: 'admin-1',
            fullName: 'Administrator',
            email: email,
            phone: '',
            role: 'admin',
            customerId: null,
            address: ''
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('authToken', response.token)
          
          return { success: true, user: userData }
        }
        
        // For other users, get user profile
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
          return { success: true, user: { email, role: 'admin' } }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      // Check if user already exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = users.find(u => u.email === userData.email)
      
      if (existingUser) {
        return { success: false, error: 'Email đã được sử dụng' }
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role || 'customer',
        customerId: `customer-${Date.now()}`,
        address: '',
        dateOfBirth: '',
        emergencyContact: '',
        emergencyPhone: ''
      }
      
      // Add to localStorage database
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // Set user in context
      const userForContext = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        customerId: newUser.customerId,
        address: newUser.address,
        dateOfBirth: newUser.dateOfBirth,
        emergencyContact: newUser.emergencyContact,
        emergencyPhone: newUser.emergencyPhone
      }
      
      setUser(userForContext)
      localStorage.setItem('user', JSON.stringify(userForContext))
      localStorage.setItem('authToken', 'local-token')
      
      return { success: true, user: userForContext }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
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
    register,
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
