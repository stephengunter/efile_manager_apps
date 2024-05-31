import { MENUS } from '@/consts'

export const isSmallScreen = () => window.innerWidth < 991

export const scrollToTop = () => {
   let element = document.getElementById('app')
   if(!element) return

   element.scrollIntoView()
}

export const activeOptions = [{
   value: true,
   title: '上架中'
},{
   value: false,
   title: '已下架'
}]
export const reviewedOptions = [{
   value: 1,
   title: '已審核'
},{
   value: 0,
   title: '未審核'
}]
export const yearOptions = (begin, end) => {
   let options = []
   for(let i = begin; i <= end; i++) {
      options.push({
         value: i,
         title: i.toString()
      })
   }
   return options
}

export const statusText = (active) => active ? '上架中' : '已下架'