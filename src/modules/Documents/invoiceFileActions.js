import { useDocumentsStore } from './documents.js'

// Download and print of a generated document PDF, shared by the Documents list and the Dashboard.
export function useInvoiceFileActions() {
  const store = useDocumentsStore()

  // Download follows the General setting "When someone opens a PDF": 'tab' opens it inline in a new tab,
  // anything else (or a settings failure) saves the file.
  async function download(row) {
    let view = 'download'
    try {
      const { useSettingsStore } = await import('@admin/modules/Settings/settings.js')
      const settings = await useSettingsStore().allSettings()
      view = settings?.data?.pdf_view || 'download'
    } catch (e) {
      view = 'download'
    }
    if (view === 'tab') {
      window.open(store.fileUrl(row.id, 'inline'), '_blank', 'noopener')
      return
    }
    const link = document.createElement('a')
    link.href = store.fileUrl(row.id, 'attachment')
    link.download = ''
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Print: load the PDF in a hidden frame and open the browser's print dialog; fall back to a new tab.
  // (Never print from the sandboxed preview frame: its CSP blocks scripts.)
  function printPdf(row) {
    const url = store.fileUrl(row.id, 'inline')
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
    frame.onload = () => {
      try {
        frame.contentWindow.focus()
        frame.contentWindow.print()
      } catch (e) {
        window.open(url, '_blank', 'noopener')
      }
    }
    frame.onerror = () => frame.remove()
    frame.src = url
    document.body.appendChild(frame)
    setTimeout(() => frame.remove(), 60000)
  }

  return { download, printPdf }
}
