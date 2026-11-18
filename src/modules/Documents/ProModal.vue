<template>
  <ab-modal ref="modal" header-class="vi-pro-head" body-class="vi-pro-body" modal-size="modal-md" :is-border="true" hide-form @close="emit('close')">
    <template #headerTitle>{{ t('pro.title') }}</template>
    <template #body>
      <p class="mb-3">{{ t('pro.intro') }}</p>
      <ul class="vi-pro-list">
        <li v-for="f in features" :key="f">{{ f }}</li>
      </ul>
    </template>
    <template #footer="{ close }">
      <ab-button type="button" color="secondary" variant="outline" @click="close">{{ t('pro.later') }}</ab-button>
      <ab-button type="button" color="primary" @click="compare">{{ t('pro.compare') }}</ab-button>
    </template>
  </ab-modal>
</template>

<script setup>
import { AbModal, AbButton, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'

const emit = defineEmits(['close'])
const features = ['pro.f1', 'pro.f2', 'pro.f3', 'pro.f4', 'pro.f5', 'pro.f6'].map((k) => t(k))
// TODO: point at the real pricing page once it exists.
const compare = () => window.open('https://appsbd.com', '_blank', 'noopener')
</script>

<style>
/* Unscoped: the modal is teleported out of this component. */
.vi-pro-head .modal-title, .vi-pro-head h1, .vi-pro-head h2, .vi-pro-head h5 { font-size: 18px; font-weight: 700; }
.vi-pro-body { font-size: 14px; line-height: 1.5; }
.vi-pro-list { list-style: disc; padding-left: 20px; margin: 0; }
.vi-pro-list li { padding: 3px 0; }
</style>
