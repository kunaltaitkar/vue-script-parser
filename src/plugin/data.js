
import Vue from 'vue'
class Data {
    constructor(vueScript = '') {
        this.data = this.setData(vueScript)
    }

    setData (vueScript = '') {
        let dataRegx = /data\s*\(\s*\)\s*\{\s*return\s*{([^]*)}/g
        let processedData = this.extractAndUpdateData(vueScript, dataRegx)

        let dataFunc = new Function('return {' + processedData.oldData + '}')
        let vm = new Vue({
            data: dataFunc
        })


        let result = []

        Object.keys(vm._data).forEach(key => {
            result.push({
                key: key,
                value: vm._data[key]
            })
        })


        return result
    }
    extractAndUpdateData (vueScript, regx) {
        let data = this.dataSectionProcessing(vueScript, regx)
        let oldData = data.methodsString.substring(
            data.firstIndex + 1,
            data.lastIndex
        )
        return { oldData, data }
    }
    dataSectionProcessing (stringToBeProcessed, regx) {
        let methodsString = stringToBeProcessed
        if (regx) {
            var extract = stringToBeProcessed.match(regx)
            methodsString = extract[0]
        }
        let stackP = []
        let firstIndex = null
        let lastIndex = null
        for (let i = 0; i < methodsString.length; i++) {
            if (methodsString[i] === '{') {
                if (stackP.length === 1) {
                    firstIndex = i
                }
                stackP.push(methodsString[i])
            }
            if (methodsString[i] === '}') {
                stackP.pop()
                if (stackP.length === 1) {
                    lastIndex = i
                    break
                }
            }
        }
        return { methodsString, firstIndex, lastIndex }
    }


}

export default Data