import EventService from '@/services/events.service'
import { resolveErrorData, deepClone, now, isEmptyObject, getListFromObj } from '@/utils'
import { FETCH_EVENTS_CALENDAR, FETCH_EVENTS, EDIT_EVENT, UPDATE_EVENT, REMOVE_EVENT, FETCH_EVENT_CATEGORIES
   
} from '@/store/actions.type'

import { SET_EVENTS_MODEL, SET_EVENTS_PARAMS, SET_EVENT_CATEGORIES,
   SET_LOADING 
} from '@/store/mutations.type'


const initialState = {
   categories: [],
   labels: {
      ps: '備註',
      createdAtText: '建檔日期',
   },
   params: {
		year: now(),
      month: ''
	},
   actions: []
}

const state = deepClone(initialState)
 
const getters = {
   
}


const actions = {
   [FETCH_EVENTS_CALENDAR](context, { key, params }) {
      console.log('state', state)
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.calendar({ key, params })
            .then(model => {
               context.commit(SET_EVENTS_MODEL, model)
               resolve(model)
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [FETCH_EVENTS](context, { key, params }) {
      
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.fetch({ key, params })
            .then(model => {
               context.commit(SET_EVENTS_MODEL, model)
               resolve(model)
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [FETCH_EVENT_CATEGORIES](context) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.fetch_categories()
            .then(list => {
               console.log(list)
               context.commit(SET_EVENT_CATEGORIES, list)
               resolve(list)
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [EDIT_EVENT](context, id) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.edit(id)
         .then(model => resolve(model))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [UPDATE_EVENT](context, model) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.update(model.id, model)
         .then(() => resolve())
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [REMOVE_EVENT](context, id) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         EventService.remove(id)
         .then(() => resolve())
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   }   
}


const mutations = {
   [SET_EVENTS_MODEL](state, model) {
      state.params = model.request
      state.actions = model.actions
      state.list = model.list
   },
   [SET_EVENTS_PARAMS](state, params) {
      state.params = params
   },
   [SET_EVENT_CATEGORIES](state, categories) {
      state.categories = categories
   }
}

export default {
   state,
   actions,
   mutations,
   getters
}
 