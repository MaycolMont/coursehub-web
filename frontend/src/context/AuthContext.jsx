import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi, usuariosApi } from '../api/endpoints'
import { clearTokens, loadTokens, setTokens } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rangos, setRangos] = useState([])

  useEffect(() => {
    const tokens = loadTokens()
    if (!tokens.access) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearTokens()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    usuariosApi
      .rangos()
      .then(setRangos)
      .catch(() => {})
  }, [])

  const login = useCallback(async (correo, password) => {
    const data = await authApi.login(correo, password)
    setTokens(data.access, data.refresh)
    setUser(data.usuario)
    return data.usuario
  }, [])

  const register = useCallback(async (correo, pseudonimo, password) => {
    const data = await authApi.register({ correo, pseudonimo, password })
    setTokens(data.access, data.refresh)
    setUser(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    clearTokens()
    setUser(null)
  }, [])

  const esAdmin = !!user && user.rol === 'administrador'
  const esEstudiante = !!user && user.rol === 'estudiante'

  return (
    <AuthContext.Provider
      value={{ user, loading, rangos, login, register, logout, esAdmin, esEstudiante }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
