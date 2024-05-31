export const hasIntersection = (arrA, arrB) => arrA.some((val) => arrB.indexOf(val) !== -1)

export const noIntersection = (arrA, arrB) => !hasIntersection(arrA, arrB)

export const arrayEqual = (arrA, arrB) => {
   if(arrA.length !== arrB.length) return false
   for(let i = 0; i < arrB.length; i++) {
      if(arrA[i] !== arrB[i]) return false;
   }
   return true;
}
export const resort = (arr, name, key) => {
   let newArr = arr.slice()
   const index = newArr.findIndex(item => item[key] === name)
   if(index < 0) return arr
   newArr.splice(index, 1) // Remove the element from its current position
   newArr.unshift(arr[index]) // Add the element to the beginning of the array
   return newArr
}

export const randomItem = (arr) => {
   const randomIndex = Math.floor(Math.random() * arr.length)
   return arr[randomIndex];
}

export const hasNonEmptyString = (arr) => arr.some(item => !isNullOrEmpty(item))