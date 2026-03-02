// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import type { User } from '@/types'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const sessionExpired = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: userId })
          .select()
          .single()

        if (newProfile) user.value = newProfile as User
      } else {
        console.error(error)
      }
    } else if (data) {
      user.value = data as User
    }
  }

  async function init() {
    if (initialized.value) return

    loading.value = true
    sessionExpired.value = false

    const { data, error } = await supabase.auth.getSession()

    if (!error && data.session?.user) {
      await fetchProfile(data.session.user.id)
    }

    loading.value = false
    initialized.value = true

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      switch (event) {
        case 'SIGNED_IN':
        case 'USER_UPDATED':
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          break

        case 'TOKEN_REFRESHED':
          sessionExpired.value = false
          break

        case 'SIGNED_OUT':
          user.value = null
          sessionExpired.value = true

          if (router.currentRoute.value.name !== 'Login') {
            router.push({ name: 'Login' })
          }
          break
      }
    })
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) throw error
    return data
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      await fetchProfile(data.user.id)
    }

    sessionExpired.value = false
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    sessionExpired.value = false
    router.push({ name: 'Login' })
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user.value) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)

    if (error) throw error

    user.value = { ...user.value, ...updates }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    sessionExpired,
    init,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
})