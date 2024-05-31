import ModifyRecordsService from '@/services/modify_records.service'
import { FETCH_MODIFY_RECORDS } from '@/store/actions.type'
import { SET_LOADING , SET_MODIFY_RECORDS } from '@/store/mutations.type'
import { deepClone } from '@/utils'

const initialState = {
   list: []
}

const state = deepClone(initialState)


const getters = {
   modify_records(state) {
      return state.list
   }
}


const actions = {
   [FETCH_MODIFY_RECORDS](context, params) {
      context.commit(SET_MODIFY_RECORDS, [])
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         ModifyRecordsService.fetch(params)
            .then(list => {
               context.commit(SET_MODIFY_RECORDS, list)
               resolve()
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   }
}

const mutations = {
   [SET_MODIFY_RECORDS](state, list) {
      state.list = list
   }
}

export default {
   state,
   actions,
   mutations,
   getters
}
 