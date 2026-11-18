import { defineStore } from 'pinia'

// Unsaved edits of the settings forms, kept outside the tabs: the live preview sits next to the tabs, so switching a tab
// never touches it. Each form writes its own section; the container merges them.
export const usePreviewDraftStore = defineStore('vi-preview-draft', {
  state: () => ({ general: null, logoUrl: null, sections: {} }),
  actions: {
    setSection(key, values) {
      if (values) this.sections[key] = values
      else delete this.sections[key]
    },
    reset() {
      this.general = null
      this.logoUrl = null
      this.sections = {}
    },
  },
})
