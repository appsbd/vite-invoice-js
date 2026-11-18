// The six document types defined in the product spec. One entry drives the sidebar submenu,
// the route, the settings form and the live preview, so adding a field here is enough.
export const DOCUMENT_TYPES = [
    {
        slug: 'invoice',
        title: 'Invoice',
        description: 'One invoice per order. Duplicates are never created.',
        blurb: 'PDF invoice for every order. Automatic or manual.',
        trigger: 'Create when order becomes',
        numbered: true,
        pro: false,
        showPrices: true,
        defaults: { auto: 'Y', triggers: ['processing'], emailAuto: 'N', emailStatuses: ['processing'], manual: 'Y', customerDownload: 'Y', showSku: 'Y', showTax: 'Y', showShipping: 'Y', showPayment: 'N', skipFree: 'N', skipStatuses: [], shipAddr: 'never', showEmail: 'N', showPhone: 'N', showNotes: 'Y', showImage: 'Y', showCustom: 'Y', showQr: 'Y', dateSource: 'document', showDue: 'N', dueDays: '30', prefix: 'INV-', suffix: '-BD', next: '1', length: '5', reset: 'never' },
    },
    {
        slug: 'packing-slip',
        title: 'Packing Slip',
        description: 'Item list for the warehouse, without prices.',
        trigger: 'When an order becomes Processing',
        numbered: false,
        pro: true,
        showPrices: false,
        defaults: { auto: 'Y', triggers: ['processing'], customerDownload: 'N', prices: 'N', billAddr: 'when_different', showSku: 'Y', showImage: 'Y', showShipMethod: 'Y', showEmail: 'N', showPhone: 'N', showNotes: 'Y', showCustom: 'Y', note: '' },
    },
    {
        slug: 'delivery-note',
        title: 'Delivery Note',
        description: 'Goes in the box so customers can check their order.',
        trigger: 'When an order becomes Completed',
        numbered: false,
        pro: true,
        showPrices: false,
        defaults: { auto: 'N', triggers: ['completed'], customerDownload: 'Y', prices: 'N', billAddr: 'when_different', showSku: 'Y', showImage: 'Y', showShipMethod: 'Y', showNotes: 'Y', showCustom: 'Y', note: '' },
    },
    {
        slug: 'shipping-label',
        title: 'Shipping Label',
        description: 'Printable address label for the courier.',
        trigger: 'When you print it from an order',
        numbered: false,
        pro: true,
        showPrices: false,
        defaults: { auto: 'N', triggers: ['processing'], size: '4x6', showQr: 'Y', showBarcode: 'Y' },
    },
    {
        slug: 'credit-note',
        title: 'Credit Note',
        description: 'One per WooCommerce refund, with its own number.',
        trigger: 'When a WooCommerce refund is created',
        numbered: true,
        pro: true,
        showPrices: true,
        defaults: { auto: 'Y', email: 'N', showSku: 'Y', showImage: 'Y', showTax: 'Y', showPayment: 'N', showEmail: 'N', showPhone: 'N', showQr: 'Y', shipAddr: 'never', prefix: 'CN-', suffix: '-BD', next: '1', length: '5', reset: 'never' },
    },
    {
        slug: 'proforma-invoice',
        title: 'Proforma Invoice',
        description: 'A quote-style invoice with a separate number series.',
        trigger: 'When you create it, or when an order becomes On hold',
        numbered: true,
        pro: true,
        showPrices: true,
        defaults: { auto: 'N', email: 'Y', triggers: ['on-hold'], showSku: 'Y', showTax: 'Y', showShipping: 'Y', showPayment: 'N', shipAddr: 'never', showEmail: 'N', showPhone: 'N', showNotes: 'Y', showImage: 'Y', showCustom: 'Y', showQr: 'Y', dateSource: 'document', showDue: 'Y', dueDays: '30', emailAuto: 'N', customerDownload: 'Y', prefix: 'PF-', suffix: '-BD', next: '1', length: '5', reset: 'never' },
    },
];

DOCUMENT_TYPES.forEach((t) => { t.blurb = t.blurb || t.description; });

import { translateGetMsg } from '@appsbd/vue3-appsbd-ui';

// Translated text for a type: field is title, desc, blurb or trigger. The English values above stay
// as the source for the PDF preview; the UI always goes through the language catalogue.
// Only Invoice has its own short blurb for the Documents list; the others reuse their description.
export const typeText = (t, field) => {
  const f = field === 'blurb' && t.slug !== 'invoice' ? 'desc' : field;
  return translateGetMsg(`doc.type.${t.slug.replace(/-/g, '_')}.${f}`);
};

export const getDocumentType = (slug) => DOCUMENT_TYPES.find((t) => t.slug === slug);

export const documentRouteName = (slug) => `settings-${slug}`;

export const documentNumberingRouteName = (slug) => `settings-${slug}-numbering`;
