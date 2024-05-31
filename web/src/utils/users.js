import { ROLE_TYPES } from '@/consts'

export const resolveUserFromClaims = (claims) => {
   return {
      id: claims.id,
      email: claims.sub,
      picture: claims.picture,
      name: claims.name,
      roles: claims.roles ? claims.roles.split(',') : []
   }
}


export const shortName = (user) => {
   let name = user.name ? user.name : user.email
   if(!name) return ''
   let words = name.split(' ')
   if(words.length === 1) return words[0].substr(0, 2).toUpperCase()
   else return `${words[0].substr(0, 1).toUpperCase()}${words[1].substr(0, 1).toUpperCase()}`   
}

export const isBoss = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.BOSS)
   return false
}

export const isDev = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.DEV)
   return false
}
export const isIT = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.IT)
   return false
}
export const isClerk = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.CLERK)
   return false
}
export const isRecorder = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.RECORDER)
   return false
}
export const isFilesManager = (user) => {
   if(user.roles && user.roles.length) return user.roles.includes(ROLE_TYPES.FILES)
   return false
}


export const isAdmin = (user) => {
   if(isDev(user)) return true
   return isBoss(user)
}

export const getRoleColor = (role) => {
   if(role.name === ROLE_TYPES.BOSS || role.name === ROLE_TYPES.DEV) return 'red'
   else if(role.name === ROLE_TYPES.CLERK) return 'green'
   else return ''
}