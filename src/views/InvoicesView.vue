<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvoicesStore } from '@/stores/invoice'
import type { InvoiceStatus } from '@/types'

const invoicesStore = useInvoicesStore()
onMounted(() => invoicesStore.fetchInvoices())

const activeFilter = ref<string>('all')

const filters = computed(() => [
    { label: 'All', value: 'all', count: invoicesStore.invoices.length },
    { label: 'Unpaid', value: 'unpaid', count: invoicesStore.invoices.filter(i => i.status === 'unpaid').length },
    { label: 'Paid', value: 'paid', count: invoicesStore.invoices.filter(i => i.status === 'paid').length },
    { label: 'Overdue', value: 'overdue', count: invoicesStore.invoices.filter(i => i.status === 'overdue').length },
    { label: 'Draft', value: 'draft', count: invoicesStore.invoices.filter(i => i.status === 'draft').length },
])

const emptyMessage = computed(() =>
    activeFilter.value === 'all'
        ? 'Create your first invoice.'
        : 'No invoices with this status.'
)


const filteredInvoices = computed(() =>
    activeFilter.value === 'all'
        ? invoicesStore.invoices
        : invoicesStore.invoices.filter(i => i.status === activeFilter.value)
)

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(invoice: { status: InvoiceStatus; due_date: string }) {
    return invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()
}

const statusMap: Record<InvoiceStatus, string> = {
    paid: 'badge-paid',
    unpaid: 'badge-unpaid',
    overdue: 'badge-overdue',
    draft: 'badge-draft',
}

function statusBadge(s: InvoiceStatus) { return statusMap[s] }

async function markPaid(id: string) {
    await invoicesStore.updateStatus(id, 'paid')
}

async function handleDelete(id: string) {
    if (!confirm('Delete this invoice?')) return
    await invoicesStore.deleteInvoice(id)
}
</script>


<template>
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">Invoices</h2>
                <p class="text-ink-500 text-sm mt-1">{{ filteredInvoices.length }} invoice{{ filteredInvoices.length !==
                    1 ? 's' : '' }}</p>
            </div>
            <RouterLink to="/invoices/new" class="btn-primary self-start sm:self-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Invoice
            </RouterLink>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2">
            <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
                class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                :class="activeFilter === f.value
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700'">
                {{ f.label }}
                <span class="ml-1.5 font-mono text-xs opacity-70">{{ f.count }}</span>
            </button>
        </div>

        <!-- Loading -->
        <div v-if="invoicesStore.loading" class="flex justify-center py-16">
            <div class="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredInvoices.length === 0" class="glass-card p-12 text-center">
            <div class="w-20 h-20 bg-ink-100 dark:bg-ink-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 class="font-display font-semibold text-xl text-ink-900 dark:text-ink-100 mb-2">No invoices found</h3>
            <p class="text-ink-500 mb-6">{{ emptyMessage }}</p>
            <RouterLink to="/invoices/new" class="btn-primary inline-flex">Create Invoice</RouterLink>
        </div>

        <!-- Invoice table -->
        <div v-else class="glass-card overflow-hidden">
            <!-- Desktop table -->
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-ink-200 dark:border-ink-800">
                            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Invoice</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Client</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Date</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Due</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Status</th>
                            <th
                                class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                Total</th>
                            <th class="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
                        <tr v-for="invoice in filteredInvoices" :key="invoice.id"
                            class="hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors cursor-pointer"
                            @click="$router.push(`/invoices/${invoice.id}`)">
                            <td class="px-5 py-3.5">
                                <span class="font-mono text-sm font-medium text-ink-900 dark:text-ink-100">{{
                                    invoice.invoice_number }}</span>
                            </td>
                            <td class="px-5 py-3.5">
                                <div>
                                    <p class="text-sm font-medium text-ink-900 dark:text-ink-100">{{
                                        invoice.client?.name }}</p>
                                    <p class="text-xs text-ink-500">{{ invoice.client?.company }}</p>
                                </div>
                            </td>
                            <td class="px-5 py-3.5 text-sm text-ink-600 dark:text-ink-400">{{
                                formatDate(invoice.issue_date) }}</td>
                            <td class="px-5 py-3.5 text-sm"
                                :class="isOverdue(invoice) ? 'text-rose-500 font-medium' : 'text-ink-600 dark:text-ink-400'">
                                {{ formatDate(invoice.due_date) }}
                            </td>
                            <td class="px-5 py-3.5">
                                <span :class="statusBadge(invoice.status)">{{ invoice.status }}</span>
                            </td>
                            <td class="px-5 py-3.5 text-right">
                                <span class="font-display font-bold text-sm text-ink-900 dark:text-ink-100">{{
                                    formatCurrency(invoice.total) }}</span>
                            </td>
                            <td class="px-5 py-3.5" @click.stop>
                                <div class="flex items-center justify-end gap-1">
                                    <button v-if="invoice.status === 'unpaid'" @click="markPaid(invoice.id)"
                                        class="btn-ghost p-1.5 text-emerald-600" title="Mark paid">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button @click="handleDelete(invoice.id)" class="btn-ghost p-1.5 text-rose-500"
                                        title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile cards -->
            <div class="md:hidden divide-y divide-ink-100 dark:divide-ink-800">
                <RouterLink v-for="invoice in filteredInvoices" :key="invoice.id" :to="`/invoices/${invoice.id}`"
                    class="flex items-center justify-between px-4 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-sm font-semibold text-ink-900 dark:text-ink-100">{{
                                invoice.invoice_number }}</span>
                            <span :class="statusBadge(invoice.status)">{{ invoice.status }}</span>
                        </div>
                        <p class="text-xs text-ink-500 mt-0.5">{{ invoice.client?.name }} · Due {{
                            formatDate(invoice.due_date) }}</p>
                    </div>
                    <span class="font-display font-bold text-ink-900 dark:text-ink-100">{{ formatCurrency(invoice.total)
                        }}</span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>
