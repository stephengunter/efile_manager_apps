import { isEmptyObject } from './objects'
import { tryParseInt, isTrue } from './helpers'
import queryString from 'query-string'

export const copyFromQuery = (params, query) => {
   for(const [key, value] of Object.entries(params)) {
      if(query.hasOwnProperty(key)) {
         if(typeof value === 'number') {
            params[key] = tryParseInt(query[key])
         }else if(typeof value === 'boolean') {
            params[key] = isTrue(query[key])
         }else params[key] = query[key]
		}
	}
}

export const buildQuery = (url, params) => queryString.stringifyUrl({ url, query: params }, { skipEmptyString: true })