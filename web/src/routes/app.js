import { ROUTE_TYPES, ROUTE_NAMES, MENUS, ENTITY_TYPES } from '@/consts'
import { isNullOrEmpty, upperFirstLetter, pluralization } from '@/utils'
import Page from '@/models/page'

const PROFILES = ENTITY_TYPES.PROFILES
const JUDGEBOOKFILE = ENTITY_TYPES.JUDGEBOOKFILE

const applinks = [
new Page({
   name: ROUTE_NAMES.CLOSE,
   path: `/${ROUTE_NAMES.CLOSE}`,
   view: `${upperFirstLetter(ROUTE_NAMES.CLOSE)}`,
   icon: '',
   title: '系統維護中',
   menus: []
}),
new Page({
   name: ROUTE_NAMES.NOT_FOUND,
   path: '/:pathMatch(.*)*',
   view: '404', 
   icon: '',
   title: 'Page Not Found',
   menus: []
}),
new Page({
   name: 'test',
   path: '/test',
   view: 'Test',      
   icon: '',
   title: 'Test',
   menus: []
})
]

const userlinks = [
// groups
new Page({
   name: ROUTE_NAMES.JUDGEBOOKFILES,
   path: '/files/judgebooks',
   view: 'files/judgebooks/Index',
   icon: 'mdi-briefcase-outline', 
   title: `${JUDGEBOOKFILE.title}管理`,
   menus: [MENUS.MAIN],
   alias: '/'
}),
new Page({
   name: `upload-${ROUTE_NAMES.JUDGEBOOKFILES}`,
   path: '/files/judgebooks/upload',
   view: 'files/judgebooks/Upload',
   icon: 'mdi-folder-upload',
   title: `${JUDGEBOOKFILE.title}上傳`,
   menus: [MENUS.MAIN],
   parent: ROUTE_NAMES.JUDGEBOOKFILES
}),
new Page({
   name: `reports-${ROUTE_NAMES.JUDGEBOOKFILES}`,
   path: '/files/judgebooks/reports',
   view: 'files/judgebooks/Reports',
   icon: 'mdi-file-export',
   title: `${JUDGEBOOKFILE.title}報表`,
   menus: [MENUS.MAIN],
   parent: ROUTE_NAMES.JUDGEBOOKFILES
}),

]


const guestLinks = [
new Page({
   name: ROUTE_NAMES.LOGIN,
   path: `/${ROUTE_NAMES.LOGIN}`,
   view: `${upperFirstLetter(ROUTE_NAMES.LOGIN)}`,
   icon: '',
   title: 'Login',
   menus: []
}),
new Page({
   name: ROUTE_NAMES.AUTHTOKEN,
   path: `/${ROUTE_NAMES.AUTHTOKEN}/:username/:token/:provider`,
   view: `${upperFirstLetter(ROUTE_NAMES.AUTHTOKEN)}`,
   icon: '',
   title: '系統登入',
   menus: []
})
]

applinks.forEach(page => page.setType(ROUTE_TYPES.FOR_ALL))

userlinks.forEach(page => page.setType(ROUTE_TYPES.ADMIN_ONLY))

guestLinks.forEach(page => page.setType(ROUTE_TYPES.GUEST_ONLY))

const appRoutes = applinks.concat(userlinks).concat(guestLinks)

appRoutes.forEach((page, index) => {
   page.setSubs(appRoutes.filter(item => item.hasParent(page.name)))
   page.setOrder(index)
})

export default appRoutes