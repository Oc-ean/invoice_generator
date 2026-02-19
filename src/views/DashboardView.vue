<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInvoicesStore } from '@/stores/invoice'
import type { InvoiceStatus } from '@/types'

const auth = useAuthStore()
const invoicesStore = useInvoicesStore()

onMounted(() => invoicesStore.fetchInvoices())

const firstName = computed(() => (auth.user?.name || 'there').split(' ')[0])
const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
})

const stats = computed(() => invoicesStore.stats)
const recentInvoices = computed(() => invoicesStore.invoices.slice(0, 5))
const currentMonth = new Date().getMonth()

const monthlyBars = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const amounts = Array(12).fill(0)
    invoicesStore.invoices.filter(i => i.status === 'paid').forEach(i => {
        const m = new Date(i.created_at).getMonth()
        amounts[m] += i.total
    })
    const max = Math.max(...amounts, 1)
    return months.map((month, i) => ({
        month,
        shortMonth: month.slice(0, 1),
        heightPct: Math.max(4, (amounts[i] / max) * 100),
    }))
})

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
}

function statusBadge(status: InvoiceStatus) {
    const map: Record<InvoiceStatus, string> = {
        paid: 'badge-paid',
        unpaid: 'badge-unpaid',
        overdue: 'badge-overdue',
        draft: 'badge-draft',
    }
    return map[status]
}
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">
                    Good {{ greeting }}, {{ firstName }} 👋
                </h2>
                <p class="text-ink-500 text-sm mt-1">Here's what's happening with your invoices.</p>
            </div>
            <RouterLink to="/invoices/new" class="btn-primary self-start sm:self-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Invoice
            </RouterLink>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
            <div class="stat-card col-span-2 sm:col-span-1">
                <span class="text-xs font-semibold uppercase tracking-wider text-ink-400">Total Invoices</span>
                <span class="font-display font-bold text-3xl text-ink-900 dark:text-ink-50">{{ stats.total }}</span>
                <span class="text-xs text-ink-400">All time</span>
            </div>
            <div class="stat-card">
                <span
                    class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Paid</span>
                <span class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">{{
                    formatCurrency(stats.paid) }}</span>
                <span class="text-xs text-ink-400">Collected</span>
            </div>
            <div class="stat-card">
                <span
                    class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Unpaid</span>
                <span class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">{{
                    formatCurrency(stats.unpaid) }}</span>
                <span class="text-xs text-ink-400">Outstanding</span>
            </div>
            <div class="stat-card">
                <span
                    class="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Overdue</span>
                <span class="font-display font-bold text-3xl text-ink-900 dark:text-ink-50">{{ stats.overdue }}</span>
                <span class="text-xs text-ink-400">Need attention</span>
            </div>
        </div>

        <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-display font-semibold text-ink-900 dark:text-ink-100">Monthly Revenue</h3>
                <span class="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">{{
                    formatCurrency(stats.revenueThisMonth) }} this month</span>
            </div>
            <div class="h-24 flex items-end gap-1.5">
                <div v-for="(bar, i) in monthlyBars" :key="i"
                    class="flex-1 rounded-t-lg transition-all duration-500 relative group"
                    :style="{ height: bar.heightPct + '%', backgroundColor: i === currentMonth ? 'rgb(196 77 237)' : '' }"
                    :class="i === currentMonth ? 'shadow-glow-sm' : 'bg-ink-200 dark:bg-ink-700'">
                    <div
                        class="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono bg-ink-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                        {{ bar.month }}
                    </div>
                </div>
            </div>
            <div class="flex justify-between mt-2">
                <span v-for="(bar, i) in monthlyBars" :key="i" class="flex-1 text-center text-xs text-ink-400 truncate">
                    {{ bar.shortMonth }}
                </span>
            </div>
        </div>

        <div class="glass-card overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-800">
                <h3 class="font-display font-semibold text-ink-900 dark:text-ink-100">Recent Invoices</h3>
                <RouterLink to="/invoices"
                    class="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">View all →
                </RouterLink>
            </div>

            <div v-if="invoicesStore.loading" class="p-8 flex justify-center">
                <div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>

            <div v-else-if="recentInvoices.length === 0" class="p-10 text-center">
                <div
                    class="w-16 h-16 bg-ink-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p class="text-ink-500 font-medium">No invoices yet</p>
                <p class="text-ink-400 text-sm mt-1">Create your first invoice to get started.</p>
                <RouterLink to="/invoices/new" class="btn-primary inline-flex mt-4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Invoice
                </RouterLink>
            </div>

            <div v-else class="divide-y divide-ink-100 dark:divide-ink-800">
                <RouterLink v-for="invoice in recentInvoices" :key="invoice.id" :to="`/invoices/${invoice.id}`"
                    class="flex items-center justify-between px-5 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                            <svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-sm text-ink-900 dark:text-ink-100 font-mono">{{
                                invoice.invoice_number }}</p>
                            <p class="text-xs text-ink-500">{{ invoice.client?.name }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span :class="statusBadge(invoice.status)">{{ invoice.status }}</span>
                        <span class="font-display font-bold text-ink-900 dark:text-ink-100 text-sm">{{
                            formatCurrency(invoice.total) }}</span>
                    </div>
                </RouterLink>
            </div>
        </div>

    </div>
</template>
