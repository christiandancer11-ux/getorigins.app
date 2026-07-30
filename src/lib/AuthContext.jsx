import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      setIsLoadingAuth(true)
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        setAuthError({ type: 'auth_error', message: error.message })
        setSession(null)
        setUser(null)
        setIsAuthenticated(false)
      } else {
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        setIsAuthenticated(!!data.session?.user)
      }

      setIsLoadingAuth(false)
      setAuthChecked(true)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
      setUser(newSession?.user ?? null)
      setIsAuthenticated(!!newSession?.user)
      setIsLoadingAuth(false)
      setAuthChecked(true)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true)
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      setAuthError({ type: 'auth_error', message: error.message })
      setSession(null)
      setUser(null)
      setIsAuthenticated(false)
    } else {
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setIsAuthenticated(!!data.session?.user)
    }
    setIsLoadingAuth(false)
    setAuthChecked(true)
  }, [])

  const navigateToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const signUp = async ({ email, password, options = {} }) => {
    setAuthError(null)
    return supabase.auth.signUp({ email, password, options })
  }

  const signIn = async ({ email, password }) => {
    setAuthError(null)
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        authError,
        isLoadingPublicSettings: false,
        signUp,
        signIn,
        signOut,
        checkUserAuth,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
