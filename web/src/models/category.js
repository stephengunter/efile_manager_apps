class Category {
   constructor(model) {
      for(const [key, value] of Object.entries(model)) {
         this[key] = value
      }
   }

   loadSubItems(list, key = 'subItems') {
      this[key] = list.filter(item => item.parentId === this.id).sort((a, b) => {
         return b.order - a.order
      })
      this[key].forEach(item => {
         item.loadSubItems(list, key)
      })
   }
   loadParentIds(list, key = 'parentIds') {
      this[key] = []
      if(!this.parentId) return

      let parentId = this.parentId
      while(parentId) {
         let parent = list.find(item => item.id == parentId)
         this[key].splice(0, 0, parentId)
         parentId = parent.parentId
      }
   }

   getFullText(list, key = 'parentIds') {
      if(list) {
         if(!this[key].length) return this.title
         let parentNames = this.parentIds.map(id => list.find(c => c.id === id))
                                          .map(item => item.title)
         return parentNames.concat([this.title]).join(' > ')
      }
      let titles = [this.title]
      let parent = this.parent
      while(parent) {
         titles.splice(0, 0, parent.title)
         parent = parent.parent
      }
      return titles.join(' > ')
   }

   hasParent(id, key = 'parentIds') {
      if(!this[key].length) return false
      return this.parentIds.includes(id)
   }
}

export default Category