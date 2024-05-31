<script setup>
import { computed, ref } from 'vue'
import {
	startOfDecade,
	endOfDecade,
	eachYearOfInterval,
	getYear,
	subYears,
	addYears,
	isAfter,
	isBefore,
	getDecade,
	isValid
} from 'date-fns'

import Popup from './Popup.vue'
import { toYearTW } from '@/utils'

const props = defineProps({
	selected: {
		type: Date,
		required: false,
	},
	pageDate: {
		type: Date,
		required: true,
	},
	lowerLimit: {
		type: Date,
		required: false,
	},
	upperLimit: {
		type: Date,
		required: false,
	},
	roc: {
      type: Boolean,
		default: false
	}
})
const emit = defineEmits(['update:pageDate', 'select'])

const from = computed(() => startOfDecade(props.pageDate))
const to = computed(() => endOfDecade(props.pageDate))

const years = computed(() =>
	eachYearOfInterval({
		start: from.value,
		end: to.value,
	}).map((value) => ({
		value,
		key: String(getYear(value)),
		display: getYear(value),
		selected: !!props.selected && getYear(value) === getYear(props.selected),
		disabled: !isEnabled(value, props.lowerLimit, props.upperLimit),
	}))
)
const heading = computed(() => {
	const start = getYear(from.value)
	const end = getYear(to.value)
	if(props.roc) return `${toYearTW(start)} - ${toYearTW(end)}`
	return `${start} - ${end}`
	
})

const leftDisabled = computed(() =>
	props.lowerLimit &&
	(getDecade(props.lowerLimit) === getDecade(props.pageDate) ||
		isBefore(props.pageDate, props.lowerLimit))
)
const rightDisabled = computed(() =>
	props.upperLimit &&
	(getDecade(props.upperLimit) === getDecade(props.pageDate) ||
		isAfter(props.pageDate, props.upperLimit))
)

function previousPage() {
	emit('update:pageDate', subYears(props.pageDate, 10))
}
function nextPage() {
	emit('update:pageDate', addYears(props.pageDate, 10))
}


function isEnabled(target, lower, upper) {
	if (!lower && !upper) return true
   if (lower && getYear(target) < getYear(lower)) return false
   if (upper && getYear(target) > getYear(upper)) return false
   return true
}
</script>

<template>
	<Popup :roc="roc"
	:columnCount="3"
	:leftDisabled="leftDisabled"
	:rightDisabled="rightDisabled"
	:items="years"
	viewMode="year"
	@left="previousPage"
	@right="nextPage"
	@elementClick="$emit('select', $event)"
	>
		<template #heading>{{ heading }}</template>
	</Popup>
</template>
