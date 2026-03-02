// stores/clients.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { supabaseFetch } from '@/utils/supabaseFetch'
import type { Client, ClientForm } from '@/types'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchClients(forceRefresh = false) {
    if (loading.value && !forceRefresh) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabaseFetch(() =>
        Promise.resolve(
          supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })
        )
      )

      if (fetchError) throw fetchError
      if (data) clients.value = data as Client[]
    } catch (err: any) {
      console.error('Error fetching clients:', err)
      error.value = err.message || 'Failed to fetch clients'
    } finally {
      loading.value = false
    }
  }

  async function addClient(form: ClientForm): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error: fetchError } = await supabaseFetch(() =>
      Promise.resolve(
        supabase
          .from('clients')
          .insert({ ...form, user_id: user.id })
          .select()
          .single()
      )
    )

    if (fetchError) throw fetchError

    const client = data as Client
    clients.value.unshift(client)

    return client
  }

  async function updateClient(id: string, form: Partial<ClientForm>) {
    const { data, error: fetchError } = await supabaseFetch(() =>
      Promise.resolve(
        supabase
          .from('clients')
          .update(form)
          .eq('id', id)
          .select()
          .single()
      )
    )

    if (fetchError) throw fetchError

    const idx = clients.value.findIndex(c => c.id === id)
    if (idx !== -1) clients.value[idx] = data as Client
  }

  async function deleteClient(id: string) {
    const { error: fetchError } = await supabaseFetch(() =>
      Promise.resolve(
        supabase
          .from('clients')
          .delete()
          .eq('id', id)
      )
    )

    if (fetchError) throw fetchError

    clients.value = clients.value.filter(c => c.id !== id)
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
  }
})