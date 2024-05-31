<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { arrayEqual, tryParseInt, deepClone, orderByDesc } from '@/utils'

const name = 'TreeItem'
const props = defineProps({
   model: {
      type: Object,
      default: null
   },
   active_ids: {
      type: Array,
      default: () => []
   },
   version: {
      type: Number,
      default: 0
   },
   on_select: {
      type: Function,
      default: () => {}
   },
   on_active: {
      type: Function,
      default: () => {}
   },
   on_orders: {
      type: Function,
      default: () => {}
   }
})

const tree = ref(null)
const sortable = ref(null)

const initialState = {
	order: {
		dirty: false,
      current: []
	},
   active: false
}
const state = reactive(deepClone(initialState))

const subItems = computed(() => props.model.subItems ? orderByDesc(props.model.subItems) : [] )

watch(() => props.active_ids, (val) => {
   init()
},{
   deep:true
})
watch(() => props.version, () => {
   init()
})

function init() {
   Object.assign(state, deepClone(initialState))
  
   nextTick(() => {
      state.active = props.active_ids.indexOf(props.model.id) > -1
      if(props.model.subItems.length > 1) bindSortable()
      else {
         if(sortable.value) sortable.value.destroy()
      }
   
   })
   
}
function bindSortable() {
   if(sortable.value) {
      const source = props.model.subItems.map(c => c.id)
      sortable.value.sort(source)
      return
   }
   const el = tree.value
   sortable.value = Sortable.create(
      el,
      {
         draggable: '.tree-item',
         onEnd: onDragEnd
      }
   )
}
function onDragEnd() {
   const source = props.model.subItems.map(c => c.id)
   const current = sortable.value.toArray().map(i => tryParseInt(i))
   state.order.dirty = !arrayEqual(source, current)
   state.order.current = current
}

</script>
<template>
   <div>
      <div>
         <v-btn v-if="model.subItems.length" density="compact" class="mb-1" flat :icon="state.active ? 'mdi-menu-down' : 'mdi-menu-right'"
         @click.prevent="on_active(model.id)"
         />
         <slot name="title" :model="model">
            <a href="#" class="text-decoration-none" 
            @click.prevent="on_select(model.id)" v-text="model.title"
            >
            </a>
         </slot>
         <slot name="append" :model="model">
            
         </slot>
         <v-tooltip v-if="on_orders && state.order.dirty" text="儲存順序">
            <template v-slot:activator="{ props }">
               <v-btn class="mb-1 ml-1" v-bind="props" density="compact" flat icon="mdi-content-save" size="small"
               @click.prevent="on_orders(state.order.current)"
               />
            </template>
         </v-tooltip>
         
      </div>
      <slot name="bottom" :model="model">
            
      </slot>
      
      <div ref="tree" style="margin-left : 45px" v-show="state.active">
         <TreeItem v-for="(subItem, index) in subItems" :data-id="subItem.id"  class="tree-item" 
         :model="subItem" :active_ids="active_ids" :version="version"
         :on_select="on_select" :on_active="on_active" :on_orders="on_orders"
         >
            <template v-slot:title="{ model }">
               <slot name="title" :model="model"></slot>
            </template>
            <template v-slot:append="{ model }">
               <slot name="append" :model="model"></slot>
            </template>
            <template v-slot:bottom="{ model }">
               <slot name="bottom" :model="model"></slot>
            </template>
        </TreeItem>
         
      </div>
      
   </div>

</template>