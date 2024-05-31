import { MENUS } from '@/consts'
import { isNullOrEmpty } from '@/utils'

class Page {
   constructor({ name, path, view, icon, title, menus, parent = '', alias = ''}) {
      this.name = name
      this.path = path
      this.view = view
      this.meta = {
         icon, title, menus, parent
      }
      if(alias) this.alias = alias
   }

   setType(type) {
      this.meta['type'] = type
   }
   setOrder(order) {
      this.meta['order'] = order
   }
   setSubs(subs) {
      this.meta['subs'] = subs
   }
   isMainMenuItem() {
      return this.meta.hasOwnProperty('menus') && this.meta.menus.includes(MENUS.MAIN)
   }
   hasParent(name) {
      return this.meta.hasOwnProperty('parent') && this.meta.parent === name
   }
   isRoot() {
      if(!this.meta.hasOwnProperty('parent')) return true
      return isNullOrEmpty(this.meta.parent)
   }
   getSubitems() {
      return this.meta.hasOwnProperty('subs') ? this.meta.subs : []
   }
}

export default Page