import { scriptSectionProcessing } from './common'
class Mounted {
    constructor(vueScript) {
        let regx = /mounted\s*\(\s*\)\s*{([^]*)}/g
        this.mounted = this.extractAndUpdateMounted(regx, vueScript)
    }
    extractAndUpdateMounted (regx, vueScript) {
        let newScript = ''
        let matchMounted = vueScript.match(regx)
        if (!matchMounted) {
            newScript = '\n mounted() { \n' + '\n}'
        } else {
            let data = scriptSectionProcessing(vueScript, regx)
            newScript = data.methodsString.substring(data.firstIndex + 1, data.lastIndex)
        }

        return newScript
    }
}

export default Mounted