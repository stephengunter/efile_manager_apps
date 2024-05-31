import BaseService from '@/common/baseService'
import { API_URL } from '@/config'

const source =`${API_URL}/auth`

const login = (form) => BaseService.post(`${source}`, form)

const refreshToken = (id, credentials) => BaseService.put(`${source}/${id}`, credentials)

export default { login, refreshToken }