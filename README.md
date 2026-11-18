# Vite Invoice - JavaScript source

JavaScript / Vue 3 source of the admin panel that is compiled into the **Vite Invoice** WordPress plugin
(`assets/admin.js` and `assets/admin.css` inside the plugin).

Plugin: Vite Invoice, by [appsbd](https://appsbd.com)

## What is in this repository

The `src/` folder of the admin panel app:

- `src/main.js`, `src/App.vue` - app entry
- `src/router/` - routes
- `src/layouts/` - admin layout and header
- `src/modules/Dashboard/` - dashboard page
- `src/modules/Documents/` - invoice and document lists
- `src/modules/Settings/` - settings pages

This is a partial extract of the full app source. Other modules, the shared libraries and the build
configuration are not included here.

## Stack

- Vue 3, Vue Router, Pinia
- Vite
- `@appsbd/vue3-appsbd-ui` and `@appsbd/vue3-elite-grid`

## How it is used

The plugin ships the compiled, minified output in its `assets/` folder. The PHP side of the plugin
loads that bundle on the plugin's own admin page only.

## License

GPLv2 or later, the same license as the plugin.
