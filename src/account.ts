import { createContext, useContext } from 'react'

/** Who is signed in (both undefined when accounts are off). */
export const AccountCtx = createContext<{ userId?: string; email?: string }>({})
export const useAccount = () => useContext(AccountCtx)
