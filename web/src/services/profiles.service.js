import BaseService from '@/common/baseService'
import { API_URL } from '@/config'

const source =`${API_URL}/admin/profiles`

const fetch = (params) => BaseService.fetch(source, params)

const get = (id) => BaseService.fetch(`${source}/${id}`)

const create = (id) => BaseService.fetch(`${source}/create/${id}`)

const store = (model) => BaseService.post(`${source}`, model)

const edit = (id) => BaseService.fetch(`${source}/edit/${id}`)

const update = (id, model) => BaseService.put(`${source}/${id}`, model)

const remove = (id) => BaseService.remove(`${source}/${id}`)

export default { fetch, get, create, store, edit, update, remove }