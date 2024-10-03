import { createGtm } from '@gtm-support/vue-gtm'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(createGtm({
        id: 'GTM-PVQJWCR4',
        defer: false,
        compatibility: false,
        enabled: true,
        debug: false,
        loadScript: true,
        useRouter: true,
        trackOnNextTick: false,
    }))
})
