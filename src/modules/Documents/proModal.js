import { ref } from 'vue';

// One Pro modal for the whole panel (rendered in AdminLayout); anything can open it.
const visible = ref(false);

export const proModalVisible = visible;
export const openProModal = () => { visible.value = true; };
export const closeProModal = () => { visible.value = false; };
