import { ENTITY_TYPES, ACTION_TYPES } from '@/consts'

class ModifyRecord {
   constructor(model) {
      this.model = model
   }
   

   getEntityType(type) {
      for (const key in ENTITY_TYPES) {
         if (ENTITY_TYPES[key].name === type.toLowerCase()) {
            return ENTITY_TYPES[key]
         }
      }
      return null
   }
   getActionType(action) {
      for (const key in ACTION_TYPES) {
         if (ACTION_TYPES[key].name === action.toLowerCase()) {
            return ACTION_TYPES[key]
         }
      }
      return null
   }
   typeTitle() {
      const type = this.getEntityType(this.model.entityType) 
      if(type) return type.title 
      return this.model.entityType
   }
   actionTitle() {
      const action = this.getActionType(this.model.action) 
      if(action) return action.title 
      return this.model.action
   }
   
   getUserName() {
      if(this.model.profiles) return this.model.profiles.name
      return this.model.userName
   }
   entityId() {
      return this.model.entityId
   }
   dateTimeText() {
      return this.model.dateTimeText
   }
   remoteIP() {
      return this.model.remoteIP
   }
}

export default ModifyRecord