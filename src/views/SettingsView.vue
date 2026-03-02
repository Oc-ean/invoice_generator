<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()

const form = ref({ name: '', company: '' })
const saving = ref(false)
const success = ref(false)

const initial = computed(() => (auth.user?.name?.[0] || 'U').toUpperCase())

onMounted(() => {
    form.value.name = auth.user?.name || ''
    form.value.company = auth.user?.company || ''
})

async function handleSave() {
    saving.value = true
    try {
        await auth.updateProfile(form.value)
        success.value = true
        setTimeout(() => { success.value = false }, 3000)
    } finally {
        saving.value = false
    }
}

async function handleSignOut() {
    await auth.signOut()
    router.push('/login')
}
</script>



<template>
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-2xl">
        <div>
            <h2 class="font-display font-bold text-2xl text-ink-900 dark:text-ink-50">Settings</h2>
            <p class="text-ink-500 text-sm mt-1">Manage your profile and preferences</p>
        </div>

        <!-- Profile -->
        <div class="glass-card p-6 space-y-5">
            <h3 class="font-display font-semibold text-ink-900 dark:text-ink-100">Profile Information</h3>

            <div class="flex items-center gap-4">
                <div
                    class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl">
                    {{ initial }}
                </div>
                <div>
                    <p class="font-medium text-ink-900 dark:text-ink-100">{{ auth.user?.name }}</p>
                    <p class="text-sm text-ink-500">{{ auth.user?.email }}</p>
                </div>
            </div>

            <form @submit.prevent="handleSave" class="space-y-4">
                <div>
                    <label class="label">Full Name</label>
                    <input v-model="form.name" class="input" placeholder="Your name" />
                </div>
                <div>
                    <label class="label">Company Name</label>
                    <input v-model="form.company" class="input" placeholder="Your company (shown on invoices)" />
                </div>

                <div v-if="success"
                    class="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800">
                    ✅ Profile updated successfully!
                </div>

                <button type="submit" class="btn-primary" :disabled="saving">
                    <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
            </form>
        </div>

        <!-- Theme -->
        <div class="glass-card p-6 space-y-4">
            <h3 class="font-display font-semibold text-ink-900 dark:text-ink-100">Appearance</h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-sm text-ink-900 dark:text-ink-100">Dark Mode</p>
                    <p class="text-xs text-ink-500">Toggle between light and dark interface</p>
                </div>
                <button @click="theme.toggle()" class="relative w-12 h-6 rounded-full transition-colors duration-200"
                    :class="theme.isDark ? 'bg-brand-600' : 'bg-ink-300'">
                    <span class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                        :class="theme.isDark ? 'translate-x-7' : 'translate-x-1'" />
                </button>
            </div>
        </div>

        <!-- Danger zone -->
        <div class="glass-card p-6 space-y-4 border-rose-200 dark:border-rose-900">
            <h3 class="font-display font-semibold text-rose-600 dark:text-rose-400">Danger Zone</h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-sm text-ink-900 dark:text-ink-100">Sign Out</p>
                    <p class="text-xs text-ink-500">Sign out from all devices</p>
                </div>
                <button @click="handleSignOut" class="btn-danger text-sm py-2">Sign out</button>
            </div>
        </div>
    </div>
</template>
