import intelEdi from '@/js/appSubject/src/intelEdi.js'
import whsteelEdi from '@/js/appSubject/src/whsteelEdi.js'

const appSubjects = [
	intelEdi,
	whsteelEdi
]

export default (appPackageName) => {
	return appSubjects.find(item => {
		return item.appSubjectPackageName === appPackageName
	})
}

