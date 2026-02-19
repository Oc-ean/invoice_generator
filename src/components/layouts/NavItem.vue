<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import {
    HomeIcon,
    DocumentTextIcon,
    UsersIcon,
    Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{ name: string; to: string; icon: string }>()
defineEmits<{ click: [] }>()

const route = useRoute()

const isActive = computed(() => {
    if (props.to === '/') return route.path === '/'
    return route.path.startsWith(props.to)
})
</script>

<template>
    <RouterLink :to="to"
        class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
        :class="isActive
            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
            : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-ink-100'"
        @click="$emit('click')">
        <span class="absolute left-0 w-0.5 h-5 bg-brand-600 rounded-r-full transition-opacity duration-150"
            :class="isActive ? 'opacity-100' : 'opacity-0'" />

        <span class="flex-shrink-0 w-5 h-5" :class="isActive
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-300'">
            <HomeIcon v-if="icon === 'dashboard'" />
            <DocumentTextIcon v-else-if="icon === 'invoice'" />
            <UsersIcon v-else-if="icon === 'clients'" />
            <Cog6ToothIcon v-else-if="icon === 'settings'" />
        </span>

        <span>{{ name }}</span>
    </RouterLink>
</template>
