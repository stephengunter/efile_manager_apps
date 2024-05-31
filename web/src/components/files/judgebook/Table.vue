<script setup>
import { ref, reactive, computed, watch, onBeforeMount, onMounted } from 'vue'
import { useStore } from 'vuex'
import { isEmptyObject, deepClone, showModifyRecords, rocNumToDateText } from '@/utils'
import { ENTITY_TYPES, ACTION_TYPES, WIDTH } from '@/consts'

const name = 'FilesJudgebookTable'
const store = useStore()
const props = defineProps({
   model: {
		type: Object,
		default: null
	},
   loading: {
		type: Boolean,
		default: false
	},
   can_remove: {
      type: Boolean,
      default: false
   },
   can_edit: {
      type: Boolean,
      default: true
   },
   can_review: {
      type: Boolean,
      default: false
   },
   disable_review: {
      type: Boolean,
      default: false
   },
   court_types: {
      type: Array,
      default: () => []
   },
   origin_types: {
      type: Array,
      default: () => []
   }
})

const initialState = {
	checked_ids: [],
   checkAll: false
}

const state = reactive(deepClone(initialState))

const entity_type = ENTITY_TYPES.JUDGEBOOKFILE

const emit = defineEmits(['select', 'download', 'check_changed', 'options_changed'])
const labels = computed(() => store.state.files_judgebooks.labels)
const params = computed(() => store.state.files_judgebooks.params)

watch(params, (new_value) => {
   state.checkAll = false
   state.checked_ids = []
})
watch(
   () => state.checked_ids,
   (new_value, old_value) => {
	   emit('check_changed', new_value)
   },
   { deep: true }
)

const headers = [{
   title: '',
   align: 'center',
   width: '3%',
   sortable: false,
   key: 'action',
},{
   title: '審核',
   align: 'center',
   width: '3%',
   sortable: false,
   key: 'reviewed',
},

{
   title: `${labels.value['typeId']}`,
   align: '',
   width: '5%',
   sortable: false,
   key: 'typeId',
},

{
   title: labels.value['courtType'],
   align: 'start',
   width: '5%',
   sortable: false,
   key: 'courtType',
},
// {
//    title: labels.value['dpt'],
//    align: 'start',
//    width: '5%',
//    sortable: false,
//    key: 'dpt',
// },
// {
//    title: labels.value['originType'],
//    align: 'start',
//    width: '5%',
//    sortable: false,
//    key: 'originType',
// },
{
   title: labels.value['fileNumber'],
   align: 'start',
   width: '12%',
   sortable: false,
   key: 'fileNumber',
},
{
   title: `${labels.value['year']}`,
   align: 'start',
   width: '5%',
   sortable: false,
   key: 'year',
},
{
   title: `${labels.value['category']}`,
   align: 'start',
   width: '5%',
   sortable: false,
   key: 'category',
},
{
   title: `${labels.value['num']}`,
   align: 'start',
   width: '5%',
   sortable: false,
   key: 'num',
},
{
   title: labels.value['judgeDate'],
   align: 'start',
   width: '5%',
   sortable: false,
   key: 'judgeDate',
},
{
   title: '檔案',
   align: 'start',
   width: '10%',
   sortable: false,
   key: 'fileName',
},{
   title: '上傳日期',
   align: 'start',
   width: '8%',
   sortable: false,
   key: 'createdAtText',
}
]

const table_headers = computed(() => {
   if(props.can_review && !props.disable_review) {
      let th_list = headers.slice()
      th_list.splice(0, 0, {
         title: '',
         align: 'start',
         width: '3%',
         sortable: false,
         key: 'check'
      })
      return th_list
   }else return headers
})

const list = computed(() => isEmptyObject(props.model) ? [] : props.model.viewList)
const modify_record_actions = computed(() => {
   const actions = [ACTION_TYPES.CREATE, ACTION_TYPES.UPDATE, ACTION_TYPES.REVIEW]
   return actions.map(item => item.name)
})
function select(id) {
   emit('select', id)
}
function download(id) {
   emit('download', id)
}
function onPageChanged(page) {
   emit('options_changed', {
      page
   })
}     
function onPageSizeChanged(size) {
   emit('options_changed', {
      size 
   })
}

function typeOrigin(model) {
   const originType = props.origin_types.find(item => item.value === model.originType)
   
   return `${model.type.title} (${originType.title})`
}

function caseInfo(model) {
   
   return `${model.year}年 ${model.category} ${model.num}`
}

function getCourtTypeTitle(key) {
   const type = props.court_types.find(x => x.value === key)
   return type.title
}
function getOriginTypeTitle(key) {
   const type = props.origin_types.find(x => x.value === key)
   return type.title
}
function checkReviewRecords(id) {
   showModifyRecords({
      type:entity_type.name, id: id, 
      action: ACTION_TYPES.REVIEW.name, title: `${ACTION_TYPES.REVIEW.title}紀錄`, width: WIDTH.L
   })
}
function onCheckAll(val) {
   if(val) {
      state.checked_ids = list.value.map(item => item.id)
   }else state.checked_ids = []
}

</script>


<template>
   <v-data-table-server
   v-model:items-per-page="model.pageSize"
   :headers="table_headers"
   :items-length="model.totalItems"
   :loading="props.loading"
   :items="list"
   >
      <template v-if="can_review" v-slot:header.check>
         <v-checkbox hide-details v-show="list.length"
         v-model="state.checkAll"
         @update:modelValue="onCheckAll"
         />
      </template>
      <template v-if="can_review" v-slot:item.check="{ item }">
         <v-checkbox hide-details
         v-model="state.checked_ids"
         :value="item.id"
         />
      </template>
		<template v-slot:item.action="{ item }">
         <CommonButtonEdit v-if="item.canEdit" size="x-small"  
			@edit="select(item.id)"
			/>
      </template>
      <template v-slot:item.reviewed="{ item }">
         <v-tooltip text="查看審核紀錄" v-if="item.reviewed">
            <template v-slot:activator="{ props }">
               <v-icon v-bind="props" color="success" icon="mdi-check-circle" 
               @click.prevent="checkReviewRecords(item.id)"
               >
               </v-icon>
            </template>
         </v-tooltip>
      </template>
      <template v-slot:item.typeId="{ item }">
         {{ item.type.title }}
      </template>
      <template v-slot:item.courtType="{ item }">
         {{ getCourtTypeTitle(item.courtType) }}
      </template>
      <!-- <template v-slot:item.originType="{ item }">
         {{ getOriginTypeTitle(item.originType) }}
      </template> -->
      <template v-slot:item.judgeDate="{ item }">
         {{ rocNumToDateText(item.judgeDate, true) }}
      </template>
		<template v-slot:item.fileName="{ item }">
         <v-tooltip text="下載檔案" v-if="item.canEdit">
            <template v-slot:activator="{ props }">
               <a href="#" v-bind="props" @click.prevent="download(item.id)">{{ item.fileName }}</a>
            </template>
         </v-tooltip>
         <span v-else>{{ item.fileName }}</span>
      </template>
      <template v-slot:item.createdAtText="{ item }">
         <ModifyRecordButton :type="entity_type" 
         :action="modify_record_actions.join()"
         tooltip="查看編修紀錄" title="編修紀錄"
         :id="item.id.toString()"
         :text="item.createdAtText" 
         />         
      </template>
		<template v-slot:bottom="{ item }">
         <CommonTablePager  :model="model"
         @page_changed="onPageChanged" @size_changed="onPageSizeChanged"
         />
      </template>
   </v-data-table-server>
</template>