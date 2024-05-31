import { jwtDecode } from 'jwt-decode'
import moment from 'moment'

const ID_TOKEN_KEY = 'id_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const getToken = () => window.localStorage.getItem(ID_TOKEN_KEY)
const getRefreshToken = () => window.localStorage.getItem(REFRESH_TOKEN_KEY)

const saveToken = (token, refreshToken) => {  
   window.localStorage.setItem(ID_TOKEN_KEY, token)
   window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

const destroyToken = () => {
   window.localStorage.removeItem(ID_TOKEN_KEY)
   window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const resolveClaims = (token) => jwtDecode(token)

const tokenStatus = () => {
   let token = window.localStorage.getItem(ID_TOKEN_KEY)
   if(!token) return -2 //無token

   let claims = jwtDecode(token)
   let exp = moment.unix(claims.exp)
   let now = moment.utc()
   let diff = exp.diff(now, 'minutes')

   if(diff <= 0) return -1  //過期
   if(diff < 30) return 0 //即將到期
   return 1
}


export default { getToken, getRefreshToken, saveToken, destroyToken, resolveClaims, tokenStatus }
