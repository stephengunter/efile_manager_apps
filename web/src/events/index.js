import { SHOW_PHOTO } from '@/store/actions.type'

window[SHOW_PHOTO] = (id) => window.dispatchEvent(new CustomEvent(SHOW_PHOTO, { detail: { id } }))
