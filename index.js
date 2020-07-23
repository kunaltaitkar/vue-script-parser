import Vue from 'vue'
import { extractAndUpdateData, setNestedObject, deletePropertyPath, extractAndUpdateMounted } from './modules/helpers'
import { scriptSectionProcessing } from './modules/common'

let dataRegex = /data\s*\(\s*\)\s*\{\s*return\s*{([^]*)}/g
let mountedRegex = /mounted\s*\(\s*\)\s*{([^]*)}/g
class VueScriptParser {
    constructor(vueScript = '') {

        //set original script
        this.script = vueScript

        //load imports
        

        //load data
        this.data = this.dataReader()


        //load mounted
        this.mounted = this.mountedReader()
       

        //load methods

    }

    dataReader () {
        let processedData = extractAndUpdateData(this.script, dataRegex)

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

    addData (key, value) {
        let processedData = extractAndUpdateData(this.script, dataRegex)

        let dataFunc = new Function('return {' + processedData.oldData + '}')
        let vm = new Vue({
            data: dataFunc
        })

        vm._data = setNestedObject(
            vm._data,
            key.split('.'),
            value
        )

        let script =
            processedData.data.methodsString.substring(
                0,
                processedData.data.firstIndex
            ) +
            JSON.stringify(vm._data) +
            processedData.data.methodsString.substring(
                processedData.data.lastIndex + 1,
                processedData.data.methodsString.length
            )

        this.script = this.script.replace(
            /data\s*\(\s*\)\s*\{\s*return\s*{([^]*)}/g,
            script
        )

    }
    
    removeData (key) {

        let processedData = extractAndUpdateData(this.script, dataRegex)

        let dataFunc = new Function('return {' + processedData.oldData + '}')
        let vm = new Vue({
            data: dataFunc
        })

        let obj = JSON.parse(JSON.stringify(vm._data))

        deletePropertyPath(obj, key)
        
        vm._data = obj

        let script =
            processedData.data.methodsString.substring(
                0,
                processedData.data.firstIndex
            ) +
            JSON.stringify(vm._data) +
            processedData.data.methodsString.substring(
                processedData.data.lastIndex + 1,
                processedData.data.methodsString.length
            )

        this.script = this.script.replace(
            /data\s*\(\s*\)\s*\{\s*return\s*{([^]*)}/g,
            script
        )


    }
    mountedReader () {

        let newScript = ''
        let matchMounted = this.script.match(mountedRegex)

        if (!matchMounted) {
            newScript = '\n mounted() { \n' + '\n}'
        } else {
            let data = scriptSectionProcessing(this.script, mountedRegex)
            newScript = data.methodsString.substring(data.firstIndex + 1, data.lastIndex)
        }

        return newScript
    }

    addMounted (body) {

        let updatedVueScript = extractAndUpdateMounted(
            mountedRegex,
            this.script,
            body
        );

        if (updatedVueScript) {
            this.script = updatedVueScript
        }
    }
}

export default VueScriptParser