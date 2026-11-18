import { FileText, Package, FileClock, FileMinus, Truck, Tag, Files } from 'lucide-vue-next'
import './docTypeStyle.css'

// One icon per document type code. The colour is the `vi-t-<code>` class (docTypeStyle.css), which also tints a grid
// row that has the `vi-row` class. A type this panel does not know (added by another plugin) gets the neutral one.
const TYPE_ICONS = { I: FileText, P: Package, F: FileClock, C: FileMinus, D: Truck, L: Tag }

export const typeIcon = (code) => TYPE_ICONS[code] || Files
export const typeClass = (code) => (TYPE_ICONS[code] ? 'vi-t-' + code : 'vi-t-x')
// For the grid's get-row-class: the type colour as the row background.
export const typeRowClass = (code) => 'vi-row ' + typeClass(code)
