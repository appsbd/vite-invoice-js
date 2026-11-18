<template>
    <div class="w-100">
        <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-icon btn-sm p-1 border-0 bg-transparent d-flex d-sm-none"
                :aria-label="translateGettext('gbl.toggle_sidebar')" @click="layoutState?.toggleLeftSidebar()">
                <Menu :size="20" />
            </button>
            <span v-if="icon" class="vi-head-icon flex-shrink-0" aria-hidden="true">
                <component :is="icon" :size="20" />
            </span>
            <div class="flex-grow-1 min-w-0">
                <h1 class="fs-5 mb-0 fw-boldest text-truncate">
                    {{ route.meta?.title ? translateGettext(route.meta.title) : '' }}
                </h1>
                <p class="mb-0">{{ route.meta?.subTitle ? translateGettext(route.meta.subTitle) : '' }}</p>
            </div>

            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <div v-if="route.meta?.headerComponent" class="me-auto">
                    <component :is="route.meta.headerComponent" />
                </div>
                <AbDarkModeToggler size="sm" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { inject } from 'vue';
import { AbDarkModeToggler, translateGettext } from '@appsbd/vue3-appsbd-ui';
import { Menu } from 'lucide-vue-next';
import { computed, toRaw } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// A component passed in the route meta (`meta: { icon: FileText }`); unwrapped so Vue does not make it reactive.
const icon = computed(() => (route.meta?.icon ? toRaw(route.meta.icon) : null));
const layoutState = inject('layoutState', null);
</script>

<style lang="scss" scoped>
.vi-head-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    color: var(--bb-primary, #079455);
    background: color-mix(in srgb, var(--bb-primary, #079455) 12%, transparent);
}
</style>
