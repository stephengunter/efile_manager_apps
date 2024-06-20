import { SHOW_PHOTO } from '@/store/actions.type'
window[SHOW_PHOTO] = (url) => window.dispatchEvent(new CustomEvent(SHOW_PHOTO, { detail: { url } }))


