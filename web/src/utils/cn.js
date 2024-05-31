export const toRocYear = (val) => val - 1911

export const cnNumbers = ['零','一','二','三','四','五','六','七','八','九','十']

export const toCnNumber = (num) => {
   let strVal = String(num)
   let length = strVal.length
   let int = strVal[length - 1]
   
   let intStr = Number(int) ? cnNumbers[Number(int)] : ''
   if(length === 1) return intStr

   let ten = strVal[length - 2]
   let tenStr = cnNumbers[Number(ten)]
   if(length === 2) {
      if(intStr) {
         if(Number(ten) > 1) return `${tenStr}十${intStr}`
         return `十${intStr}` 
      } 
      else return `${tenStr}十`
   } 

   let hundred = strVal[length - 3]
   let hundredStr = cnNumbers[Number(hundred)]
   if(length === 3) {
      if(intStr) return `${hundredStr}百${tenStr}十${intStr}`
      else return `${hundredStr}百${tenStr}十`
   }
  
   return ''
}
