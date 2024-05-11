import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import { createWebHistory, createRouter } from 'vue-router'
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { md3 } from 'vuetify/blueprints';
import { routes } from './route.ts';
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
    components,
    directives,
    blueprint: md3,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const pinia = createPinia()

createApp(App)
    .use(vuetify)
    .use(router)
    .use(pinia)

    .mount('#app');
