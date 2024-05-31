import moment from 'moment'

export const registerFilters = (app) => {
	app.config.globalProperties.$filters = {
		defaultDateTime
	}	
}

const defaultDateTime = (val) => moment(val).format("YYYY-MM-DD HH:MM:SS")//moment(val, "MM-DD-YYYY");