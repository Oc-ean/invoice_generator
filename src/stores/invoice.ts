import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import type { Invoice, InvoiceForm, InvoiceStatus } from '@/types'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)

  const stats = computed(() => {
    const total = invoices.value.length
    const paid = invoices.value.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    const unpaid = invoices.value.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.total, 0)
    const overdue = invoices.value.filter(i => i.status === 'overdue').length
    const now = new Date()
    const revenueThisMonth = invoices.value
      .filter(i => i.status === 'paid' && new Date(i.created_at).getMonth() === now.getMonth())
      .reduce((s, i) => s + i.total, 0)

    return { total, paid, unpaid, overdue, revenueThisMonth }
  })

  async function fetchInvoices() {
    loading.value = true
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })
    if (!error && data) invoices.value = data as Invoice[]
    loading.value = false
  }

  async function fetchInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', id)
      .single()
    if (error) return null
    return data as Invoice
  }

  async function createInvoice(form: InvoiceForm): Promise<Invoice> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const subtotal = form.items.reduce((s, item) => s + item.total, 0)
    const tax = subtotal * (form.tax_rate / 100)
    const total = subtotal + tax

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: form.client_id,
        invoice_number: form.invoice_number,
        issue_date: form.issue_date,
        due_date: form.due_date,
        items: form.items,
        subtotal,
        tax_rate: form.tax_rate,
        tax,
        total,
        notes: form.notes,
        status: 'unpaid',
      })
      .select('*, client:clients(*)')
      .single()
    if (error) throw error
    const invoice = data as Invoice
    invoices.value.unshift(invoice)
    return invoice
  }

async function updateStatus(id: string, status: InvoiceStatus) {
  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)

  if (error) throw error

  const invoice = invoices.value.find(i => i.id === id)

  if (invoice) {
    invoice.status = status
  }
}

  async function deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
    invoices.value = invoices.value.filter(i => i.id !== id)
  }

  function generateInvoiceNumber(): string {
    const count = invoices.value.length + 1
    return `INV-${String(count).padStart(4, '0')}`
  }

  return {
    invoices, loading, stats,
    fetchInvoices, fetchInvoice, createInvoice, updateStatus, deleteInvoice, generateInvoiceNumber
  }
})