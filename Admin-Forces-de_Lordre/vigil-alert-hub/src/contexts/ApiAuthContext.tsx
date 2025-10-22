import { createContext, useContext } from 'react'

// Deprecated: use AuthContext instead
export const ApiAuthContext = createContext<any | null>(null)
export const ApiAuthProvider = ({ children }: { children: React.ReactNode }) => children
export const useApiAuth = () => {
  const ctx = useContext(ApiAuthContext)
  return ctx
}

