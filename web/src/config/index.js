export const PRODUCTION = process.env.NODE_ENV === 'production'
export const APP_CLOSED = import.meta.env.VITE_APP_CLOSE == 1
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL
export const SITE_TITLE = import.meta.env.VITE_APP_TITLE


export const API_URL = import.meta.env.VITE_APP_API_URL
export const QQ_FACE_PATH = '/qqface.png'
export const PHOTO_ACTION_PATH = '/photo'

//AUTH
export const GOOGLE_AUTH_PARAMS = {
   client_id: import.meta.env.VITE_APP_GOOGLE_AUTH_CLIENT_ID,
   scope: 'email'
}

//UI
export const DIALOG_MAX_WIDTH = 480