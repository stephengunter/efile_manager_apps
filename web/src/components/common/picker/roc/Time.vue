<script setup>
import { defineComponent, computed, ref, watch, nextTick } from 'vue'
import { isSameHour, isSameMinute, isValid, set } from 'date-fns'
import Popup from './Popup.vue'
import { it } from 'date-fns/locale';

const props = defineProps({
	selected: {
		type: Date,
		required: false,
	},
	pageDate: {
		type: Date,
		required: true,
	},
	visible: {
		type: Boolean,
		required: true,
	},
	disabledTime: {
		type: Object,
		required: false,
	},
	hours_allow: {
		type: Array,
		required: false,
		default: () => []
	},
	minutes_allow: {
		type: Array,
		required: false,
		default: () => []
	}
	
})

const emit = defineEmits(['select', 'back'])
const hoursListRef = ref(null)
const minutesListRef = ref(null)

const currentDate = computed(() => props.pageDate ?? props.selected)

const hours = ref(currentDate.value.getHours())
const minutes = ref(currentDate.value.getMinutes())

watch(
	() => props.selected,
	(value) => {
		//console.log('selected date', value)
		let newHours = 0
		let newMinutes = 0

		if (value) {
			newHours = value.getHours()
			newMinutes = value.getMinutes()
		}

		hours.value = newHours
		minutes.value = newMinutes
	}
)
watch(
	() => props.visible,
	(visible) => {
		if (visible) {
			nextTick(scroll)
		}
	}
)
// const hoursList = computed(() =>
// 	[...Array(24).keys()].map((value) => ({
// 		value,
// 		date: set(new Date(currentDate.value.getTime()), {
// 			hours: value,
// 			minutes: minutes.value,
// 			seconds: 0,
// 		}),
// 		selected: hours.value === value,
// 		ref: ref(null),
// 	}))
// )

const hoursList = computed(() => {
	let list = props.hours_allow.slice(0)
	if(!list.length) list = [...Array(24).keys()]
	return list.map((value) => ({
		value,
		date: set(new Date(currentDate.value.getTime()), {
			hours: value,
			minutes: minutes.value,
			seconds: 0,
		}),
		selected: hours.value === value,
		ref: ref(null),
	}))
})
const minutesList = computed(() => {
	let list = props.minutes_allow.slice(0)
	if(!list.length) list = [...Array(60).keys()]
	// let interval = props.min_interval
	// let nums = [...Array(60).keys()]
	//if(interval) nums = nums.filter(num => num % interval === 0 )
	return list.map((value) => ({
		value,
		date: set(new Date(currentDate.value.getTime()), {
			hours: hours.value,
			minutes: value,
			seconds: 0,
		}),
		selected: minutes.value === value,
		ref: ref(null),
	}))
})
function selectMinutes(item) {
	minutes.value = item.value
	emit('select', item.date)
}
function scroll() {
	const currentHour = hoursList.value.find(
		(item) => item.ref.value?.classList?.contains('selected') ?? false
	)
	const currentMinute = minutesList.value.find(
		(item) => item.ref.value?.classList?.contains('selected') ?? false
	)

	if (currentHour && currentMinute) {
		scrollParentToChild(hoursListRef.value, currentHour.ref.value)
		scrollParentToChild(minutesListRef.value, currentMinute.ref.value)
	}
}
function isEnabled(target) {
	if (
		props.disabledTime?.dates?.some(
			(date) => isSameHour(target, date) && isSameMinute(target, date)
		)
	) {
		return false
	}
	if (props.disabledTime?.predicate?.(target)) return false
	return true
}
function padStartZero(item) {
	item = String(item); // Ensure the item is a string
	return item.length < 2 ? '0' + item : item
}



function scrollParentToChild(parent, child) {
	const parentRect = parent.getBoundingClientRect()
	const parentViewableArea = {
		height: parent.clientHeight,
		width: parent.clientWidth,
	}

	const childRect = child.getBoundingClientRect()
	const isViewable =
		childRect.top >= parentRect.top &&
		childRect.bottom <= parentRect.top + parentViewableArea.height

	if (!isViewable) {
		const scrollTop = childRect.top - parentRect.top
		const scrollBot = childRect.bottom - parentRect.bottom
		if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
			parent.scrollTop += scrollTop
		} else {
			parent.scrollTop += scrollBot
		}
	}
}

</script>
<template>
	<Popup headingClickable :columnCount="2" :leftDisabled="true" :rightDisabled="true" viewMode="time"
		@heading="$emit('back')">
		<template #heading>{{ padStartZero(hours) }}:{{ padStartZero(minutes) }}</template>
		<!-- <template #heading>{{ currentDate.getHours(0) }}</template> -->
		<template #body>
			<div ref="hoursListRef" class="v3dp__column">
				<button v-for="item in hoursList" :key="item.value" :ref="item.ref"
					:class="[{ selected: item.selected }, 'v3dp__element_button__hour']" :disabled="!isEnabled(item.date)"
					@click.stop.prevent="hours = item.value">
					<span>{{ padStartZero(item.value) }}</span>
				</button>
			</div>
			<div ref="minutesListRef" class="v3dp__column">
				<button v-for="item in minutesList" :key="item.value" :ref="item.ref"
					:class="[{ selected: item.selected }, 'v3dp__element_button__minute']" :disabled="!isEnabled(item.date)"
					@click.stop.prevent="selectMinutes(item)">
					<span>{{ padStartZero(item.value) }}</span>
				</button>
			</div>
		</template>
	</Popup>
</template>


<style scoped>
.v3dp__column {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	height: 190px;
}
</style>
