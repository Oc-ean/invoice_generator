export interface User {
  id: string
  email: string
  name: string
  company?: string
  logo?: string
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  company?: string
  address?: string
  phone?: string
  created_at: string
}

export interface ClientForm {
  name: string
  email: string
  company: string
  address: string
  phone: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export type InvoiceStatus = 'draft' | 'unpaid' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  client?: Client
  invoice_number: string
  issue_date: string
  due_date: string
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax: number
  total: number
  status: InvoiceStatus
  notes?: string
  created_at: string
}

export interface InvoiceForm {
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  items: InvoiceItem[]
  tax_rate: number
  notes: string
}

export interface DashboardStats {
  totalInvoices: number
  totalPaid: number
  totalUnpaid: number
  totalOverdue: number
  revenueThisMonth: number
}