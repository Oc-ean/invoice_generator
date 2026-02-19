<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const route = useRoute()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
    loading.value = true
    error.value = ''
    try {
        await auth.signIn(form.value.email, form.value.password)
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Invalid credentials'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950 px-4">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
        </div>

        <div class="relative w-full max-w-md animate-slide-up">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div
                    class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow mb-4">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 class="font-display font-bold text-3xl text-ink-900 dark:text-ink-50">InvoiceFlow</h1>
                <p class="text-ink-500 mt-1 text-sm">Sign in to your account</p>
            </div>

            <!-- Card -->
            <div class="glass-card p-8">
                <form @submit.prevent="handleLogin" class="space-y-5">
                    <div>
                        <label class="label">Email address</label>
                        <input v-model="form.email" type="email" class="input" placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label class="label">Password</label>
                        <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
                    </div>

                    <div v-if="error"
                        class="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-800">
                        {{ error }}
                    </div>

                    <button type="submit" class="btn-primary w-full justify-center py-3" :disabled="loading">
                        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ loading ? 'Signing in...' : 'Sign in' }}
                    </button>
                </form>

                <p class="text-center text-sm text-ink-500 mt-6">
                    Don't have an account?
                    <RouterLink to="/register" class="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                        Sign up free</RouterLink>
                </p>
            </div>

            <!-- Theme toggle -->
            <div class="text-center mt-4">
                <button @click="theme.toggle()" class="btn-ghost text-xs text-ink-400">
                    {{ theme.isDark ? '☀️ Light mode' : '🌙 Dark mode' }}
                </button>
            </div>
        </div>
    </div>
</template>
