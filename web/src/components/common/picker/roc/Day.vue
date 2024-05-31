<script setup>
import { computed } from 'vue'
import {
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	subMonths,
	addMonths,
	startOfWeek,
	endOfWeek,
	isSameDay,
	setDay,
	isWithinInterval,
	isBefore,
	isAfter,
	isSameMonth,
	endOfDay,
	startOfDay,
	isValid,
	format as formatDate,
} from 'date-fns'
import Popup from './Popup.vue'
import { month_list, toYearTW, toWeekdayTW } from '@/utils'

const emit = defineEmits(['update:pageDate', 'select', 'back'])

const props = defineProps({
	selected: {
		type: Date,
		required: false,
	},
	pageDate: {
		type: Date,
		required: true,
	},
	format: {
		type: String,
		required: false,
		default: 'dd',
	},
	headingFormat: {
		type: String,
		required: false,
		default: 'LLLL yyyy',
	},
	weekdayFormat: {
		type: String,
		required: false,
		default: 'EE',
	},
	locale: {
		type: Object,
		required: false,
	},
	weekStartsOn: {
		type: Number,
		required: false,
		default: 1,
		validator: (i) =>
			typeof i === 'number' && Number.isInteger(i) && i >= 0 && i <= 6,
	},
	lowerLimit: {
		type: Date,
		required: false,
	},
	upperLimit: {
		type: Date,
		required: false,
	},
	disabledDates: {
		type: Object,
		required: false,
	},
	allowOutsideInterval: {
		type: Boolean,
		required: false,
		default: false,
	},
	roc: {
      type: Boolean,
		default: false
	}
})

const format = computed(() =>
	(format) => (value) =>
	formatDate(value, format, {
		locale: props.locale,
		weekStartsOn: props.weekStartsOn,
	})
)

const monthStart = computed(() => startOfMonth(props.pageDate))
const monthEnd = computed(() => endOfMonth(props.pageDate))
const currentMonth = computed(() => ({
	start: monthStart.value,
	end: monthEnd.value
}))

const displayedInterval = computed(() => ({
	start: startOfWeek(monthStart.value, {
		weekStartsOn: props.weekStartsOn,
	}),
	end: endOfWeek(monthEnd.value, {
		weekStartsOn: props.weekStartsOn,
	})
}))

const weekDays = computed(() => {
	const initial = props.weekStartsOn
	const dayFormat = format.value(props.weekdayFormat)
	return Array.from(Array(7))
		.map((_, i) => (initial + i) % 7)
		.map((v) =>
			setDay(new Date(), v, {
			weekStartsOn: props.weekStartsOn,
			})
		)
		.map(dayFormat)
})
const days = computed(() => {
	const today = new Date()
	const dayFormat = format.value(props.format)
	return eachDayOfInterval(displayedInterval.value).map(
		(value) => ({
			value,
			display: dayFormat(value),
			selected: !!props.selected && isSameDay(props.selected, value),
			current: isSameDay(today, value),
			disabled:
			(!props.allowOutsideInterval &&
				!isWithinInterval(value, currentMonth.value)) ||
			!isEnabled(
				value,
				props.lowerLimit,
				props.upperLimit,
				props.disabledDates
			),
			key: format.value('yyyy-MM-dd')(value),
		})
	)
})
const heading = computed(() => {
	let value = format.value(props.headingFormat)(props.pageDate)
	const year = props.pageDate.getFullYear()
	const month = props.pageDate.getMonth()
	return props.roc ? `${toYearTW(year)} 年 ${month_list[month].cn}` : `${year} 年 ${month_list[month].cn}`
})
    
const leftDisabled = computed(() =>
	props.lowerLimit &&
	(isSameMonth(props.lowerLimit, props.pageDate) ||
		isBefore(props.pageDate, props.lowerLimit))
)
const rightDisabled = computed(() =>
	props.upperLimit &&
	(isSameMonth(props.upperLimit, props.pageDate) ||
		isAfter(props.pageDate, props.upperLimit))
)

function isEnabled(target, lower, upper, disabledDates) {
	if (disabledDates?.dates?.some((date) => isSameDay(target, date)))
		return false
	if (disabledDates?.predicate?.(target)) return false
	if (!lower && !upper) return true
	if (lower && isBefore(target, startOfDay(lower))) return false
	if (upper && isAfter(target, endOfDay(upper))) return false
	return true
}

   
    

function previousPage() {
	emit('update:pageDate', subMonths(props.pageDate, 1))
}
      
function nextPage() {
	emit('update:pageDate', addMonths(props.pageDate, 1))
}


</script>
<template>
	<Popup headingClickable :leftDisabled="leftDisabled" :rightDisabled="rightDisabled" :items="days" viewMode="day"
		@left="previousPage" @right="nextPage" @heading="$emit('back')" @elementClick="$emit('select', $event)">
		<template #heading>{{ heading }}</template>
		<template #subheading>
			<span v-for="(day, index) in weekDays" :key="day" :class="`v3dp__subheading__weekday__${index}`">
				{{ toWeekdayTW(day) }}
			</span>
		</template>
	</Popup>
</template>
 
