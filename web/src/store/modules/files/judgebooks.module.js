import JudgebooksService from '@/services/files/judgebooks.service'
import { resolveErrorData, deepClone, isEmptyObject, getListFromObj, uniqueItems,
   appendFormData, isFilesManager, isAdmin, hasRole } from '@/utils'
import { COURT_TYPES, ORIGIN_TYPES, ROLE_TYPES  } from '@/consts'
import JwtService from '@/services/jwt.service'
import {
   FETCH_JUDGEBOOKFILES, UPLOAD_JUDGEBOOKFILES, DOWNLOAD_JUDGEBOOKFILE,
   EDIT_JUDGEBOOKFILE, UPDATE_JUDGEBOOKFILE, REMOVE_JUDGEBOOKFILE, INIT_JUDGEBOOKFILES,
   REVIEW_JUDGEBOOKFILES, SUBMIT_REVIEW_JUDGEBOOKFILES, REPORT_JUDGEBOOKFILES, SUBMIT_REPORT_JUDGEBOOKFILES
} from '@/store/actions.type'

import { SET_JUDGEBOOKFILES_ADMIN_MODEL, SET_JUDGEBOOKFILES_PARAMS, SET_JUDGEBOOKFILE_UPLOAD_RESULTS, SET_JUDGEBOOK_TYPES, SET_JUDGEBOOKFILE_DEPARTMENTS,
   SET_LOADING, SET_USER 
} from '@/store/mutations.type'

const initialState = {
   ad_dpts:[],

   isFilesManager: false,
   isChiefClerk: false,
   isAdmin: false,

   allowEmptyJudgeDate: true,
   allowEmptyFileNumber: true,
   types: [],
   departments: null,
   courtTypes: [],
   originTypes: getListFromObj(ORIGIN_TYPES),
   labels: {
      typeId: '書類',
      judgeDate: '裁判日期',
      originType: '原/正本',
      fileNumber: '檔案號',
      courtType: '案類',
      dpt: '股別',
      year: '年度',
      category: '字別',
      num: '案號',
      ps: '備註',
      createdBy: '建檔人員',
      createdAtText: '建檔日期',
      reviewed: '審核狀態',
      reviewedBy: '審核人員'
   },
   params: {
      reviewed: -1,
		typeId: 0,
      departmentId: null,
		fileNumber: '',
		courtType: '',
		year: '',
		category: '',
		num: '',
      createdby: '',
		page: 1,
		pageSize: 50
	},
   actions: [],
   pagedList: null,
   upload: {
      results: [],
      has_error: false
   }
}

const state = deepClone(initialState)
 
const getters = {
   
}


const actions = {
   [FETCH_JUDGEBOOKFILES](context, params) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.fetch(params)
            .then(model => {
               context.commit(SET_JUDGEBOOKFILES_ADMIN_MODEL, model)
               resolve(model)
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [INIT_JUDGEBOOKFILES](context) {
      let state = context.state
      state.params = { ...initialState.params }
      if(state.isFilesManager || state.isChiefClerk || state.isAdmin) state.params.createdby = ''
	   else state.params.createdby = 'me'
      
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.init()
            .then(model => {
               context.commit(SET_JUDGEBOOK_TYPES, model.types)
               context.commit(SET_JUDGEBOOKFILE_DEPARTMENTS, model.departments)
               resolve()
            })
            .catch(error => reject(error))
            .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [UPLOAD_JUDGEBOOKFILES](context, models) {
      const formData = new FormData()
      models.forEach((item, index) => {
         for (const key in item) {
            if (key === 'File' && item[key]) {
               formData.append(`models[${index}].${key}`, item[key], item[key].name);
            } else if (item[key] != null) {
               formData.append(`models[${index}].${key}`, item[key]);
            }
         }
      })
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.upload(formData)
         .then(results => {
            context.commit(SET_JUDGEBOOKFILE_UPLOAD_RESULTS, results)
            resolve(results)
         })
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [DOWNLOAD_JUDGEBOOKFILE](context, id) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.download(id)
         .then(data => resolve(data))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [EDIT_JUDGEBOOKFILE](context, id) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.edit(id)
         .then(model => resolve(model))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [UPDATE_JUDGEBOOKFILE](context, { id, model, file }) {
      const formData = new FormData()
      Object.keys(model).forEach(key => {
         appendFormData(formData, model[key], key)
      })
      if(file) formData.append('file', file, file.name)
      
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.update(id, formData)
         .then(() => resolve())
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [REVIEW_JUDGEBOOKFILES](context, ids) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.review(ids)
         .then(list => resolve(list))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [REPORT_JUDGEBOOKFILES](context, params) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.reports(params)
         .then(list => resolve(list))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [SUBMIT_REPORT_JUDGEBOOKFILES](context, model) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.submit_reports(model)
         .then(model => resolve(model))
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [SUBMIT_REVIEW_JUDGEBOOKFILES](context, models) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.submit_review(models)
         .then(() => resolve())
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   },
   [REMOVE_JUDGEBOOKFILE](context, id) {
      context.commit(SET_LOADING, true)
      return new Promise((resolve, reject) => {
         JudgebooksService.remove(id)
         .then(() => resolve())
         .catch(error => reject(error))
         .finally(() => context.commit(SET_LOADING, false))
      })
   }   
}


const mutations = {
   [SET_USER](state, user) {
      state.isFilesManager = isFilesManager(user)
      state.isChiefClerk = hasRole(user, ROLE_TYPES.CHIEF_CLERK)
      state.isAdmin = isAdmin(user) || hasRole(user, ROLE_TYPES.IT)
      if(state.isFilesManager || state.isChiefClerk) {
         state.ad_dpts = []
      }else if(state.isAdmin) {
         state.ad_dpts = []
      }else {
         let token = JwtService.getToken()  
         let claims = JwtService.resolveClaims(token)
         
         if(claims.ad_dpts) state.ad_dpts = uniqueItems(claims.ad_dpts.split(','))
         else state.ad_dpts = []
      }
   },
   [SET_JUDGEBOOKFILES_ADMIN_MODEL](state, model) {
      state.allowEmptyFileNumber = model.allowEmptyFileNumber
      state.allowEmptyJudgeDate = model.allowEmptyJudgeDate
      state.params = model.request
      state.actions = model.actions
      state.pagedList = model.pagedList
   },
   [SET_JUDGEBOOKFILES_PARAMS](state, params) {
      state.params = params
   },
   [SET_JUDGEBOOKFILE_UPLOAD_RESULTS](state, results) {
      state.upload.results = results
      state.upload.has_error = results.some(item => !isEmptyObject(item.errors))
   },
   [SET_JUDGEBOOK_TYPES](state, types) {
      state.types = types
   },
   [SET_JUDGEBOOKFILE_DEPARTMENTS](state, departments) {
      let h_list = departments.filter(d => d.courtTypeList.includes('H'))
      let v_list = departments.filter(d => d.courtTypeList.includes('V'))
      let h_options =  h_list.map(d => ({ value: d.id, title: d.title}))
      let v_options =  v_list.map(d => ({ value: d.id, title: d.title}))
      if(state.ad_dpts.length) {
         let h = { list: [], options: [] }
         let v = { list: [], options: [] }
         state.ad_dpts.forEach(dpt => {
            let h_department = h_list.find(d => d.title === dpt)
            if(h_department) {
               h.list.push(h_department)
               h.options.push({value: h_department.id, title: h_department.title})
            }
            let v_department = v_list.find(d => d.title === dpt)
            if(v_department) {
               v.list.push(v_department)
               v.options.push({value: v_department.id, title: v_department.title})
            }
         })
         state.departments = {}
         if(h.list.length) state.departments.h = h
         if(v.list.length) state.departments.v = v         
      }else {
         state.departments = { 
            h: { list: h_list, options: h_options },
            v: { list: v_list, options: v_options }   
         }
      }

      let courtTypes = []
      if(state.departments.h) courtTypes.push({ value: 'H', title: '刑事'})
      if(state.departments.v) courtTypes.push({ value: 'V', title: '民事'})
      state.courtTypes = courtTypes
   }
}

export default {
   state,
   actions,
   mutations,
   getters
}
 