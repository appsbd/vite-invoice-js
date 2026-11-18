<template>
  <ChevronDown :size="18" class="vi-chev" :class="{ 'vi-chev-open': open }" />
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

// Accordion trigger icon (the library default needs Bootstrap Icons, which this admin does not load).
defineProps({ open: Boolean })
</script>

<style scoped>
.vi-chev { transition: transform .2s; }
.vi-chev-open { transform: rotate(180deg); }
</style>
