import axios from 'axios'
import { buildQuery } from '@/utils'

const setHeader = (token) => {
	if(token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
	else axios.defaults.headers.common['Authorization'] = null	
}

const fetch = (url, params) => new Promise((resolve, reject) => {
	axios.get(buildQuery(url, params))
	.then(response => resolve(response.data))
	.catch(error => reject(error.response))
})

const submit = (requestType, url, data, options = null) => new Promise((resolve, reject) => {
	axios[requestType](url, data, options)
	.then(response => resolve(response.data))
	.catch(error => reject(error.response))
})

const blob = (requestType, url, data = null) => new Promise((resolve, reject) => {
	axios[requestType](url, data, { responseType: 'blob' })
	.then(response => resolve(response.data))
	.catch(error => reject(error.response))
})


const post = (url, data, options = null) => submit('post', url, data, options)

const put = (url, data, options = null) => submit('put', url, data, options)

const remove = (url, data, options = null) => submit('delete', url, data, options)

export default { setHeader, fetch, submit, post, put, remove, blob }