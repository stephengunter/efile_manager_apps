export const findCategory = (list, id, key = 'subItems') => {
   for(const item of list) {
      if(item.id === id) return item
  
      if(hasSubItem(item)) {
        const target = findCategory(item[key], id, key)
        if(target) return target
      }
   }
   return null
}

export const loadSubItems = (category, list, key = 'subItems') => {
   category[key] = list.filter(item => item.parentId === category.id).sort((a, b) => a.order - b.order)
   category[key].forEach(item => {
      if(!item.hasOwnProperty('parentIds')) item['parentIds'] = []
      item['parentIds'].push(category.id)
      loadSubItems(item, list, key)
   })
}


export const getSubItems = (category, key = 'subItems') => {
   let result = []
   if(category[key].length) {
      category[key].forEach(item => {
         result.push(item)
         result =  result.concat(getSubItems(item, key))
      })
   }
   return result
}

export const loadParent = (category, list, key = 'parent') => {
   let parentIdKey = `${key}Id`
   if(!category.hasOwnProperty('parents')) category['parents'] = []

   if(category[parentIdKey]) {
      category[key] = list.find(item => item.id === category[parentIdKey])
      category['parents'].push(category[key])
   } 
   else category[key] = null

   if(category[key]) loadParent(category[key], list, key)
}

export const getFullText = (category) => {
   if(!category['parents'].length) return category.title

   let parentName = category['parents'].map(item => item.title).join(' > ')
   return [parentName, category.title].join(' > ')

}

const hasSubItem = (category, key = 'subItems') => category.hasOwnProperty(key) && category[key].length