<script setup>
import { ref, computed,  watch, watchEffect, onBeforeMount } from 'vue'
import { parse, isValid, format, max, min } from 'date-fns'
import Year from './Year.vue'
import Month from './Month.vue'
import Day from './Day.vue'
import Time from './Time.vue'

const props = defineProps({
	action: {
		type: String,
		default: '',
	},
	auto_show: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: '',
	},
	modelValue: {
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
	disabledTime: {
		type: Object,
		required: false,
	},
	upperLimit: {
		type: Date,
		required: false,
	},
	lowerLimit: {
		type: Date,
		required: false,
	},
	startingView: {
		type: String,
		required: false,
		default: 'day'
	},
	startingViewDate: {
		type: Date,
		required: false,
		default: () => new Date(),
	},
	dayPickerHeadingFormat: {
		type: String,
		required: false,
		default: 'LLLL yyyy',
	},
	monthListFormat: {
		type: String,
		required: false,
		default: 'LLL',
	},
	weekdayFormat: {
		type: String,
		required: false,
		default: 'EE',
	},
	dayFormat: {
		type: String,
		required: false,
		default: 'dd',
	},
	inputFormat: {
		type: String,
		required: false,
		default: 'yyyy-MM-dd',
	},
	locale: {
		type: Object,
		required: false,
	},
	weekStartsOn: {
		type: Number,
		required: false,
		default: 1,
		validator: (value) => [0, 1, 2, 3, 4, 5, 6].includes(value),
	},
	disabled: {
		type: Boolean,
		required: false,
		default: false,
	},
	clearable: {
		type: Boolean,
		required: false,
		default: false,
	},
	typeable: {
		type: Boolean,
		required: false,
		default: false,
	},
	roc: {
      type: Boolean,
		default: false
	},
	minimumView: {
		type: String,
		required: false,
		default: 'day'
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

const emit = defineEmits(['update:modelValue', 'decadePageChanged', 'yearPageChanged', 'monthPageChanged', 'opened', 'closed'])

defineExpose({
   launch
})


onBeforeMount(() => {
	if(props.auto_show) focus()
})
const TIME_RESOLUTIONS = ['time', 'day', 'month', 'year']

const viewShown = ref('none')
const pageDate = ref(props.startingViewDate)
const inputRef = ref(null)
const isFocused = ref(false)
const input = ref('')

watch(() => props.action, (val) => {
	if(val === 'focus') focus()
	else if(val === 'blur') blur()
	else if(val === 'click') {
		click()
		focus()
	}
} ,{
   deep: false
})

const initialView = computed(() => {
	const startingViewOrder = TIME_RESOLUTIONS.indexOf(props.startingView)
	const minimumViewOrder = TIME_RESOLUTIONS.indexOf(props.minimumView)

	return startingViewOrder < minimumViewOrder
									? props.minimumView
									: props.startingView
})

watchEffect(() => {
	const parsed = parse(input.value, props.inputFormat, new Date(), {
		locale: props.locale,
	})
	if(isValid(parsed)) {
		pageDate.value = parsed
	}
})
watchEffect(() => {
	input.value = props.modelValue && isValid(props.modelValue)
	? format(props.modelValue, props.inputFormat, { locale: props.locale })
	: ''
})
watchEffect(() => {
	if (props.disabled) viewShown.value = 'none'
})

function updatePageDate(view, newPageDate) {
	pageDate.value = newPageDate
	if (view === 'year') emit('decadePageChanged', newPageDate)
	else if (view === 'month') emit('yearPageChanged', newPageDate)
	else if (view === 'day') emit('monthPageChanged', newPageDate)
}
function selectYear(date) {
	pageDate.value = date;
	if (props.minimumView === 'year') {
		renderView('none')
		emit('update:modelValue', date)
	} else {
		viewShown.value = 'month'
	}
}

function selectMonth(date) {
	pageDate.value = date;
	if (props.minimumView === 'month') {
		renderView('none')
		emit('update:modelValue', date)
	} else {
		viewShown.value = 'day'
	}
}
function renderView(view) {
	if (!props.disabled) {
		if (view !== 'none' && viewShown.value === 'none') {
			pageDate.value = props.modelValue ||
			boundedDate(props.lowerLimit, props.upperLimit, pageDate.value)
		}
		viewShown.value = view
		emit(view !== 'none' ? 'opened' : 'closed')
	}
}
function selectDay(date) {
	pageDate.value = date;
	if (props.minimumView === 'day') {
		renderView('none')
		emit('update:modelValue', date)
	} else {
		viewShown.value = 'time'
	}
}

function selectTime(date) {
	renderView('none')
	emit('update:modelValue', date)
}

function clearModelValue() {
	if (props.clearable) {
		renderView('none')
		emit('update:modelValue', null)
		pageDate.value = props.startingViewDate
	}
}
function click() {
	isFocused.value = true
}
function focus() {
	renderView(initialView.value)
}
function blur() {
	isFocused.value = false;
   renderView()
}
function keyUp(event) {
	const code = event.keyCode ? event.keyCode : event.which
	const closeButton = [27, 13].includes(code)
	if (closeButton) inputRef.value.blur()
	if (props.typeable) {
		const parsedDate = parse(inputRef.value.value, props.inputFormat, new Date(), { locale: props.locale })
		if (isValid(parsedDate) &&
			input.value === format(parsedDate, props.inputFormat, { locale: props.locale })) {
			input.value = inputRef.value.value
			emit('update:modelValue', parsedDate)
		}
	}
}
function variables (object) {
	return Object.fromEntries(
        Object.entries(object ?? {}).filter(([key, _]) => key.startsWith('--')))
}

function goBackFromTimepicker() {
	return props.startingView === 'time' && props.minimumView === 'time'
														? null
														: (viewShown.value = 'day')
}
      

function clear() {
	clearModelValue()
}

function boundedDate(lower, upper, target = undefined) {
	let date = target || new Date();

	if (lower) date = max([lower, date]);
	if (upper) date = min([upper, date]);

	return date;
}

function launch() {
	focus()
}

</script>
<template>
	<div class="v3dp__datepicker" :style="variables($attrs.style)">
		<Year :roc="roc" v-show="viewShown === 'year'" :pageDate="pageDate" @update:pageDate="(v) => updatePageDate('year', v)"
			:selected="modelValue" :lowerLimit="lowerLimit" :upperLimit="upperLimit" @select="selectYear" 
		/>
		<Month :roc="roc" v-show="viewShown === 'month'" :pageDate="pageDate" @update:pageDate="(v) => updatePageDate('month', v)"
			:selected="modelValue" @select="selectMonth" :lowerLimit="lowerLimit" :upperLimit="upperLimit"
			:format="monthListFormat" :locale="locale" @back="viewShown = 'year'" 
		/>
		<Day :roc="roc" v-show="viewShown === 'day'" :pageDate="pageDate" @update:pageDate="(v) => updatePageDate('day', v)"
			:selected="modelValue" :weekStartsOn="weekStartsOn" :lowerLimit="lowerLimit" :upperLimit="upperLimit"
			:headingFormat="dayPickerHeadingFormat" :disabledDates="disabledDates" :locale="locale"
			:weekdayFormat="weekdayFormat" :allow-outside-interval="allowOutsideInterval" :format="dayFormat"
			@select="selectDay" @back="viewShown = 'month'" 
		/>
		<Time :roc="roc" v-show="viewShown === 'time'" :pageDate="pageDate" :visible="viewShown === 'time'" :selected="modelValue"
			:hours_allow="hours_allow" :minutes_allow="minutes_allow" 
			:disabledTime="disabledTime" @select="selectTime" @back="goBackFromTimepicker" 
		/>
	</div>
</template>
 
<style>
.v3dp__datepicker {
  /* --popout-bg-color: var(--vdp-bg-color, #fff);  */
  --popout-bg-color: var(--vdp-bg-color, #fff); 
  --box-shadow: var(
    --vdp-box-shadow,
    0 4px 10px 0 rgba(128, 144, 160, 0.1),
    0 0 1px 0 rgba(128, 144, 160, 0.81)
  );
  --text-color: var(--vdp-text-color, #000000);
  --border-radius: var(--vdp-border-radius, 3px);
  --heading-size: var(--vdp-heading-size, 2.5em); /* 40px for 16px font */
  --heading-weight: var(--vdp-heading-weight, bold);
  --heading-hover-color: var(--vdp-heading-hover-color, #eeeeee);
  --arrow-color: var(--vdp-arrow-color, currentColor);

  --elem-color: var(--vdp-elem-color, currentColor);
  --elem-disabled-color: var(--vdp-disabled-color, #d5d9e0);
  --elem-hover-color: var(--vdp-hover-color, #fff);
  --elem-hover-bg-color: var(--vdp-hover-bg-color, #0baf74);
  --elem-selected-color: var(--vdp-selected-color, #fff);
  --elem-selected-bg-color: var(--vdp-selected-bg-color, #0baf74);

  --elem-current-outline-color: var(--vdp-current-date-outline-color, #888);
  --elem-current-font-weight: var(--vdp-current-date-font-weight, bold);

  --elem-font-size: var(--vdp-elem-font-size, 0.8em);
  --elem-border-radius: var(--vdp-elem-border-radius, 3px);

  --divider-color: var(--vdp-divider-color, var(--elem-disabled-color));

  position: relative;
}

.v3dp__clearable {
  display: inline;
  position: relative;
  left: -15px;
  cursor: pointer;
}
</style>
