export const ERRORS = 'errors'
export const WARNING = 'warning'
export const SUCCESS = 'success'
export const INFO = 'info'
export const REMOVE = 'remove'

export const BAD_REQUEST = 'badRequest'
export const ICONS = {
   [ERRORS]: 'mdi-alert-circle',
   [WARNING]: 'mdi-alert',
   [SUCCESS]: 'mdi-check-circle',
   [INFO]: 'mdi-information'
}
export const DIALOG_TITLE = {
   [ERRORS]: '發生錯誤',
   [REMOVE]: '確定要刪除嗎?',
   [BAD_REQUEST]: '處理您的要求時發生錯誤'
}
export const DIALOG_MESSAGE = {
   [ERRORS]: '伺服器暫時無回應，請稍候再試.',
   [BAD_REQUEST]: '請確認後重試'
}