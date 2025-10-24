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
      
      if (savedUser && authToken) {
        // Verify token with backend
        try {
          const profile = await customerAPI.getProfile()
          setUser({
            ...JSON.parse(savedUser),
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
      const response = await authAPI.login(email, password)
      
      if (response.token) {
        // Get user profile
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
        
        return { success: true, user: userData }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      if (response.token) {
        // Get user profile
        const profile = await customerAPI.getProfile()
        
        const newUser = {
          id: profile.user_id,
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          customerId: profile.customer_id,
          address: profile.address
        }
        
        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        return { success: true, user: newUser }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = async (userData) => {
    try {
      await customerAPI.updateProfile(userData)
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
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
