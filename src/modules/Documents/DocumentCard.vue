<template>
  <!-- The click lives on a plain wrapper: AbCard does not reliably pass listeners to its root. -->
  <div class="h-100" :class="{ 'vi-clickable': !disabled }" @click="!disabled && emit('open')">
  <ab-card show-border container-class="h-100">
    <template #body>
      <div class="vi-icon mb-3"><component :is="icon" :size="18" /></div>
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="fw-bold">{{ title }}</span>
        <ab-badge v-if="active" color="success" size="sm">{{ t('gbl.active') }}</ab-badge>
        <ab-badge v-else-if="pro" color="warning" size="sm">{{ t('gbl.pro') }}</ab-badge>
      </div>
      <p class="text-muted small mb-2">{{ description }}</p>
      <a v-if="locked" href="#" class="fw-semibold small" @click.prevent.stop="emit('open')">{{ t('docs.unlock') }}</a>
      <a v-else-if="actionLabel && !disabled" href="#" class="fw-semibold small" @click.prevent.stop="emit('open')">{{ actionLabel }}</a>
      <span v-else-if="actionLabel" class="text-muted small">{{ actionLabel }}</span>
    </template>
  </ab-card>
  </div>
</template>

<script setup>
import { AbCard, AbBadge, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'

defineProps({
  icon: { type: [Object, Function], required: true },
  title: String,
  description: String,
  pro: Boolean,
  locked: Boolean,
  active: Boolean,
  disabled: Boolean,
  actionLabel: { type: String, default: '' },
})
const emit = defineEmits(['open'])
</script>

<style scoped>
.vi-clickable { cursor: pointer; }
/* The background is a tint of the text colour, so it follows light and dark mode (Bootstrap's secondary background stays white in dark). */
.vi-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
</style>
