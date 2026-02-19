<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import NavItem from '@/components/layouts/NavItem.vue'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { name: 'Dashboard', to: '/', icon: 'dashboard' },
  { name: 'Invoices', to: '/invoices', icon: 'invoice' },
  { name: 'Clients', to: '/clients', icon: 'clients' },
  { name: 'Settings', to: '/settings', icon: 'settings' },
]

const pageTitles: Record<string, string> = {
  Dashboard: 'Dashboard',
  Invoices: 'Invoices',
  NewInvoice: 'New Invoice',
  InvoiceDetail: 'Invoice Detail',
  Clients: 'Clients',
  Settings: 'Settings',
}

const currentPageTitle = computed(() => pageTitles[route.name as string] || 'InvoiceFlow')
const userInitial = computed(() => (auth.user?.name?.[0] || auth.user?.email?.[0] || 'U').toUpperCase())

async function handleSignOut() {
  await auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<template>
  <div class="flex h-[100dvh] overflow-hidden bg-ink-50 dark:bg-ink-950">
    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false" />
    </Transition>

    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 w-64 flex flex-col',
      'bg-white dark:bg-ink-900 border-r border-ink-200 dark:border-ink-800',
      'transition-transform duration-300 ease-out',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-ink-200 dark:border-ink-800">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span class="font-display font-bold text-xl text-ink-900 dark:text-ink-50">InvoiceFlow</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavItem v-for="item in navItems" :key="item.name" v-bind="item" @click="sidebarOpen = false" />
      </nav>

      <!-- User section -->
      <div class="px-3 py-4 border-t border-ink-200 dark:border-ink-800">
        <div
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer group transition-colors">
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">{{ auth.user?.name || 'User' }}</p>
            <p class="text-xs text-ink-500 truncate">{{ auth.user?.email }}</p>
          </div>
        </div>
        <button @click="handleSignOut"
          class="btn-ghost w-full justify-center mt-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64 h-[100dvh] overflow-hidden">
      <!-- Top header -->
      <header
        class="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-b border-ink-200 dark:border-ink-800">
        <!-- Mobile menu button -->
        <button class="lg:hidden btn-ghost p-2" @click="sidebarOpen = !sidebarOpen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Page title -->
        <h1 class="font-display font-bold text-lg text-ink-900 dark:text-ink-100 lg:ml-0 ml-2">
          {{ currentPageTitle }}
        </h1>

        <!-- Header actions -->
        <div class="flex items-center gap-2">
          <!-- Theme toggle -->
          <button class="btn-ghost p-2 rounded-xl" @click="theme.toggle()"
            :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <svg v-if="theme.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Create invoice quick action -->
          <RouterLink to="/invoices/new" class="btn-primary hidden sm:inline-flex">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </RouterLink>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>
