import { createRouter, createWebHashHistory } from 'vue-router';
import { FileText, Layers, LayoutDashboard } from 'lucide-vue-next';
import AdminLayout from '@admin/layouts/AdminLayout.vue';
import { settingsRoute } from '@admin/modules/Settings/routes.js';
import DashboardPage from '@admin/modules/Dashboard/DashboardPage.vue';
import InvoicesList from '@admin/modules/Documents/InvoicesList.vue';
import DocumentsList from '@admin/modules/Documents/DocumentsList.vue';

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'ap-active apbd-active',
  linkExactActiveClass: 'ap-exact-active apbd-exact-active',
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: DashboardPage,
          meta: { icon: LayoutDashboard, title: 'dash.page_title', subTitle: 'dash.page_subtitle' },
        },
        settingsRoute,
        {
          path: '/invoices',
          name: 'invoices',
          component: InvoicesList,
          meta: { icon: FileText, title: 'inv.page_title', subTitle: 'inv.page_subtitle' },
        },
        {
          path: '/documents',
          name: 'documents',
          component: DocumentsList,
          meta: { icon: Layers, title: 'docs.page_title', subTitle: 'docs.page_subtitle' },
        },
      ],
    },
  ],
});

export default router;
