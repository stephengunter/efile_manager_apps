import { cloneDeep } from 'lodash'

export const deepClone = (obj) => cloneDeep(obj)

export const getListFromObj = (obj) => {
   const list = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key]
            list.push({ value: key, title: value })
        }
    }
    return list
}

export const findItemFromObj = (obj, item_key, item_value) => {
   for (const key in obj) {
      const item = obj[key]
      if (item.hasOwnProperty(key)) {
         if (item[item_key] === item_value) return item
      }
   }
   return null
}

export const setValues = (source, dest) => {
   for(const [key, value] of Object.entries(source)) {
		if(dest.hasOwnProperty(key)) {
			dest[key] = value
		}
	}
}

export const areObjectsEqual = (obj1, obj2, ignoreType = false) => {
   // Get arrays of keys from the objects
   var keys1 = Object.keys(obj1)
   var keys2 = Object.keys(obj2)

   // Check if the number of keys is the same
   if (keys1.length !== keys2.length) {
      return false
   }

   // Check if all keys in obj1 exist in obj2 and have the same values
   for (var key of keys1) {
      if (!keys2.includes(key)) return false
      if(ignoreType) {
         if (obj1[key] != obj2[key]) {
            return false
         } 
      }else {
         if (obj1[key] !== obj2[key]) {
            return false
         }
      }
   }

   return true // Objects have the same keys and values
}

export const isEmptyObject = (obj) => {
   if (obj == null) return true

   // Assume if it has a length property with a non-zero value
   // that that property is correct.
   if (obj.length > 0)    return false
   if (obj.length === 0)  return true

   // If it isn't an object at this point
   // it is empty, but it can't be anything *but* empty
   // Is it empty?  Depends on your application.
   if (typeof obj !== 'object') return true

   // Otherwise, does it have any properties of its own?
   // Note that this doesn't handle
   // toString and valueOf enumeration bugs in IE < 9
   for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false
   }

   return true;
}

export const appendFormData = (formData, data, parentKey) => {
   if (data === null || data === undefined) {
     // If data is null or undefined, you can decide to either skip it or append an empty string
     formData.append(parentKey, '')
   } else if (data && typeof data === 'object' && !(data instanceof File)) {
     // Handle nested objects
     Object.keys(data).forEach(key => {
       appendFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key)
     })
   } else {
     // Handle all other types (including File)
     formData.append(parentKey, data)
   }
}