import BaseService from '@/common/baseService'
import { API_URL } from '@/config'

const source =`${API_URL}/authtoken`

const login = (form) => BaseService.post(`${source}/login`, form)

export default { login }