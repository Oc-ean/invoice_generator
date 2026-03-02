<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoice'
import { useClientsStore } from '@/stores/clients'
import type { InvoiceItem } from '@/types'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()
const clients = useClientsStore()

onMounted(async () => {
    await Promise.all([clients.fetchClients(), invoicesStore.fetchInvoices()])
    form.value.invoice_number = invoicesStore.generateInvoiceNumber()
    if (route.query.client) {
        form.value.client_id = route.query.client as string
    }
})

const today = new Date().toISOString().slice(0, 10)
const dueDate = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .slice(0, 10)


const newItem = (): InvoiceItem => ({
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    price: 0,
    total: 0,
})

const form = ref({
    client_id: '',
    invoice_number: 'INV-0001',
    issue_date: today,
    due_date: dueDate,
    items: [newItem()],
    tax_rate: 10,
    notes: 'Payment due within 30 days. Thank you for your business!',
})

const subtotal = computed(() => form.value.items.reduce((s, i) => s + i.total, 0))
const tax = computed(() => subtotal.value * (form.value.tax_rate / 100))
const total = computed(() => subtotal.value + tax.value)

function updateItemTotal(index: number) {
    const item = form.value.items[index]
    if (!item) return

    item.total = Math.max(0, item.quantity * item.price)
}

function addItem() {
    form.value.items.push(newItem())
}

function removeItem(index: number) {
    if (form.value.items.length > 1) form.value.items.splice(index, 1)
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const saving = ref(false)
const error = ref('')

async function handleCreate() {
    if (!form.value.client_id) { error.value = 'Please select a client'; return }
    if (form.value.items.some(i => !i.description)) { error.value = 'All items need a description'; return }
    if (total.value <= 0) { error.value = 'Invoice total must be greater than 0'; return }

    saving.value = true
    error.value = ''
    try {
        const invoice = await invoicesStore.createInvoice(form.value)
        router.push(`/invoices/${invoice.id}`)
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Failed to create invoice'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <button @click="$router.back()" class="btn-ghost p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <!-- <h2 class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">New Invoice</h2> -->
                <p class="text-ink-500 text-sm">Fill in the details below</p>
            </div>
        </div>

        <div class="grid xl:grid-cols-3 gap-6">
            <!-- Form (left 2/3) -->
            <div class="xl:col-span-2 space-y-5">
                <!-- Invoice meta -->
                <div class="glass-card p-5 space-y-4">
                    <h3
                        class="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm uppercase tracking-wider">
                        Invoice Details</h3>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label class="label">Invoice Number</label>
                            <input v-model="form.invoice_number" class="input font-mono" placeholder="INV-0001"
                                required />
                        </div>
                        <div>
                            <label class="label">Client *</label>
                            <select v-model="form.client_id" class="input" required>
                                <option value="" disabled>Select a client</option>
                                <option v-for="c in clients.clients" :key="c.id" :value="c.id">{{ c.name }} {{ c.company
                                    ? `(${c.company})` : '' }}</option>
                            </select>
                            <RouterLink to="/clients"
                                class="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-block">+
                                Add new client</RouterLink>
                        </div>
                        <div>
                            <label class="label">Issue Date</label>
                            <input v-model="form.issue_date" type="date" class="input" required />
                        </div>
                        <div>
                            <label class="label">Due Date</label>
                            <input v-model="form.due_date" type="date" class="input" required />
                        </div>
                    </div>
                </div>

                <!-- Line items -->
                <div class="glass-card p-5 space-y-4">
                    <h3
                        class="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm uppercase tracking-wider">
                        Line Items</h3>

                    <!-- Items table header -->
                    <div
                        class="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-ink-400 px-1">
                        <div class="col-span-5">Description</div>
                        <div class="col-span-2 text-center">Qty</div>
                        <div class="col-span-2 text-right">Price</div>
                        <div class="col-span-2 text-right">Total</div>
                        <div class="col-span-1" />
                    </div>

                    <!-- Items -->
                    <div class="space-y-3">
                        <div v-for="(item, index) in form.items" :key="item.id"
                            class="grid sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700">
                            <div class="sm:col-span-5">
                                <label class="label sm:hidden">Description</label>
                                <input v-model="item.description" class="input bg-white dark:bg-ink-900"
                                    placeholder="Service or product description" />
                            </div>
                            <div class="sm:col-span-2">
                                <label class="label sm:hidden">Quantity</label>
                                <input v-model.number="item.quantity" type="number" min="1"
                                    class="input bg-white dark:bg-ink-900 text-center"
                                    @input="updateItemTotal(index)" />
                            </div>
                            <div class="sm:col-span-2">
                                <label class="label sm:hidden">Unit Price</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">$</span>
                                    <input v-model.number="item.price" type="number" min="0" step="0.01"
                                        class="input bg-white dark:bg-ink-900 pl-7 text-right"
                                        @input="updateItemTotal(index)" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 text-right">
                                <label class="label sm:hidden">Total</label>
                                <span class="font-mono font-bold text-ink-900 dark:text-ink-100 text-sm">{{
                                    formatCurrency(item.total) }}</span>
                            </div>
                            <div class="sm:col-span-1 flex justify-end">
                                <button @click="removeItem(index)"
                                    class="btn-ghost p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                    :disabled="form.items.length === 1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button @click="addItem" class="btn-secondary text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Line Item
                    </button>
                </div>

                <!-- Notes -->
                <div class="glass-card p-5">
                    <label class="label">Notes / Payment Terms</label>
                    <textarea v-model="form.notes" class="input resize-none" rows="3"
                        placeholder="Payment due within 30 days. Thank you for your business!" />
                </div>
            </div>

            <!-- Summary sidebar -->
            <div class="xl:col-span-1">
                <div class="glass-card p-5 space-y-4 sticky top-24">
                    <h3
                        class="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm uppercase tracking-wider">
                        Summary</h3>

                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-ink-500">Subtotal</span>
                            <span class="font-mono font-medium text-ink-900 dark:text-ink-100">{{
                                formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <span class="text-ink-500">Tax (%)</span>
                            <input v-model.number="form.tax_rate" type="number" min="0" max="100" step="0.5"
                                class="input w-20 text-right py-1.5 text-sm" />
                        </div>
                        <div class="flex justify-between">
                            <span class="text-ink-500">Tax amount</span>
                            <span class="font-mono text-ink-900 dark:text-ink-100">{{ formatCurrency(tax) }}</span>
                        </div>
                        <div class="flex justify-between pt-3 border-t border-ink-200 dark:border-ink-700">
                            <span class="font-display font-bold text-ink-900 dark:text-ink-100">Total</span>
                            <span class="font-display font-bold text-2xl text-brand-600 dark:text-brand-400">{{
                                formatCurrency(total) }}</span>
                        </div>
                    </div>

                    <div v-if="error"
                        class="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-800">
                        {{ error }}
                    </div>

                    <button @click="handleCreate" class="btn-primary w-full justify-center py-3" :disabled="saving">
                        <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ saving ? 'Creating...' : 'Create Invoice' }}
                    </button>

                    <div class="text-center">
                        <p class="text-xs text-ink-400">Invoice will be saved as <strong
                                class="text-amber-600 dark:text-amber-400">Unpaid</strong></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
