import { create } from 'zustand'
import api from '../lib/api'

type User = { id: number; email: string; name?: string }

type AuthState = {
  token?: string
  user?: User
  login: (email: string, password: string) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token') ?? undefined,
  user: undefined,
  async login(email, password) {
    const body = new URLSearchParams({ username: email, password })
    const { data } = await api.post('/auth/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token })
    await get().fetchMe()
  },
  async fetchMe() {
    const { data } = await api.get<User>('/users/me')
    set({ user: data })
  },
  logout() {
    localStorage.removeItem('token')
    set({ token: undefined, user: undefined })
  },
}))