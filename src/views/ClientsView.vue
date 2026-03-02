<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClientsStore } from '@/stores/clients'
import { useInvoicesStore } from '@/stores/invoice'
import type { Client, ClientForm } from '@/types'

const clientsStore = useClientsStore()
const invoicesStore = useInvoicesStore()

onMounted(() => {
    clientsStore.fetchClients()
    invoicesStore.fetchInvoices()
})

function clientInvoiceCount(clientId: string): number {
    return invoicesStore.invoices.filter(inv => inv.client_id === clientId).length
}

const showModal = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')

const emptyForm = (): ClientForm => ({ name: '', email: '', company: '', address: '', phone: '' })
const form = ref<ClientForm>(emptyForm())

function openModal(client?: Client) {
    editingId.value = client?.id ?? null
    form.value = client
        ? { name: client.name, email: client.email, company: client.company || '', address: client.address || '', phone: client.phone || '' }
        : emptyForm()
    formError.value = ''
    showModal.value = true
}

async function handleSubmit() {
    saving.value = true
    formError.value = ''
    try {
        if (editingId.value) {
            await clientsStore.updateClient(editingId.value, form.value)
        } else {
            await clientsStore.addClient(form.value)
        }
        showModal.value = false
    } catch (e: unknown) {
        formError.value = e instanceof Error ? e.message : 'Failed to save'
    } finally {
        saving.value = false
    }
}

async function confirmDelete(id: string) {
    if (!confirm('Delete this client? This won\'t delete their invoices.')) return
    await clientsStore.deleteClient(id)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>


<template>
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">Clients</h2>
                <p class="text-ink-500 text-sm mt-1">{{ clientsStore.clients.length }} client{{
                    clientsStore.clients.length !== 1 ? 's' : '' }}</p>
            </div>
            <button @click="openModal()" class="btn-primary self-start sm:self-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Client
            </button>
        </div>

        <div v-if="clientsStore.loading" class="flex justify-center py-16">
            <div class="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="clientsStore.clients.length === 0" class="glass-card p-12 text-center">
            <div class="w-20 h-20 bg-ink-100 dark:bg-ink-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h3 class="font-display font-semibold text-xl text-ink-900 dark:text-ink-100 mb-2">No clients yet</h3>
            <p class="text-ink-500 mb-6">Add your first client to start creating invoices.</p>
            <button @click="openModal()" class="btn-primary">Add your first client</button>
        </div>

        <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
            <div v-for="client in clientsStore.clients" :key="client.id"
                class="glass-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                            {{ client.name[0]!.toUpperCase() }}
                        </div>
                        <div>
                            <h3 class="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm">{{ client.name
                            }}</h3>
                            <p class="text-xs text-ink-500">{{ client.company }}</p>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button @click="openModal(client)" class="btn-ghost p-1.5" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button @click="confirmDelete(client.id)"
                            class="btn-ghost p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="space-y-1.5 text-sm">
                    <div class="flex items-center gap-2 text-ink-600 dark:text-ink-400">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span class="truncate">{{ client.email }}</span>
                    </div>
                    <div v-if="client.phone" class="flex items-center gap-2 text-ink-600 dark:text-ink-400">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{{ client.phone }}</span>
                    </div>
                    <div v-if="client.address" class="flex items-start gap-2 text-ink-600 dark:text-ink-400">
                        <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="text-xs leading-relaxed">{{ client.address }}</span>
                    </div>
                </div>

                <div class="pt-2 border-t border-ink-100 dark:border-ink-800">
                    <template v-if="clientInvoiceCount(client.id) > 0">
                        <RouterLink to="/invoices"
                            class="flex items-center gap-1.5 btn-ghost text-xs text-ink-500 dark:text-ink-400 px-0 hover:text-brand-600 dark:hover:text-brand-400">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {{ clientInvoiceCount(client.id) }} invoice{{ clientInvoiceCount(client.id) !== 1 ? 's' : ''
                            }} →
                        </RouterLink>
                    </template>
                    <template v-else>
                        <RouterLink :to="`/invoices/new?client=${client.id}`"
                            class="btn-ghost text-xs text-brand-600 dark:text-brand-400 px-0">
                            + Create invoice →
                        </RouterLink>
                    </template>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="showModal = false" />
                    <div class="relative w-full max-w-md glass-card p-6 shadow-glass animate-slide-up">
                        <h3 class="font-display font-bold text-xl text-ink-900 dark:text-ink-100 mb-5">
                            {{ editingId ? 'Edit Client' : 'Add Client' }}
                        </h3>

                        <form @submit.prevent="handleSubmit" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-2">
                                    <label class="label">Full Name *</label>
                                    <input v-model="form.name" class="input" placeholder="Jane Smith" required />
                                </div>
                                <div class="col-span-2">
                                    <label class="label">Email *</label>
                                    <input v-model="form.email" type="email" class="input"
                                        placeholder="jane@company.com" required />
                                </div>
                                <div>
                                    <label class="label">Company</label>
                                    <input v-model="form.company" class="input" placeholder="Acme Corp" />
                                </div>
                                <div>
                                    <label class="label">Phone</label>
                                    <input v-model="form.phone" class="input" placeholder="+1 555 000 0000" />
                                </div>
                                <div class="col-span-2">
                                    <label class="label">Address</label>
                                    <textarea v-model="form.address" class="input resize-none" rows="2"
                                        placeholder="123 Main St, NYC" />
                                </div>
                            </div>

                            <div v-if="formError" class="text-rose-500 text-sm">{{ formError }}</div>

                            <div class="flex justify-end gap-3 pt-2">
                                <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
                                <button type="submit" class="btn-primary" :disabled="saving">
                                    <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {{ saving ? 'Saving...' : (editingId ? 'Update' : 'Add Client') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
