import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import type { Client, ClientForm } from '@/types'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)

  async function fetchClients() {
    loading.value = true
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) clients.value = data as Client[]
    loading.value = false
  }

  async function addClient(form: ClientForm): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...form, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    const client = data as Client
    clients.value.unshift(client)
    return client
  }

  async function updateClient(id: string, form: Partial<ClientForm>) {
    const { data, error } = await supabase
      .from('clients')
      .update(form)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = clients.value.findIndex(c => c.id === id)
    if (idx !== -1) clients.value[idx] = data as Client
  }

  async function deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return { clients, loading, fetchClients, addClient, updateClient, deleteClient }
})