import Vue from 'vue'
import { extractAndUpdateData, setNestedObject, deletePropertyPath, extractAndUpdateMounted, extractMethodsFromScript, updateMethod, removeNewLine } from './modules/helpers'
import { scriptSectionProcessing } from './modules/common'
import { pattern } from './modules/constant'


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
        this.methods = this.methodsReader()

    }

    dataReader () {
        let processedData = extractAndUpdateData(this.script, pattern.dataRegex)

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
        let processedData = extractAndUpdateData(this.script, pattern.dataRegex)

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
            pattern.dataRegex,
            script
        )

    }

    removeData (key) {

        let processedData = extractAndUpdateData(this.script, pattern.dataRegex)

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
            pattern.dataRegex,
            script
        )


    }
    mountedReader () {

        let newScript = ''
        let matchMounted = this.script.match(pattern.mountedRegex)

        if (!matchMounted) {
            newScript = '\n mounted() { \n' + '\n}'
        } else {
            let data = scriptSectionProcessing(this.script, pattern.mountedRegex)
            newScript = data.methodsString.substring(data.firstIndex + 1, data.lastIndex)
        }

        return newScript
    }

    addMounted (body) {

        let updatedVueScript = extractAndUpdateMounted(
            pattern.mountedRegex,
            this.script,
            body
        )

        if (updatedVueScript) {
            this.script = updatedVueScript
        }
    }

    methodsReader () {
        let matchMethods = this.script.match(pattern.methodsRegex)
        if (!matchMethods) {
            let data = scriptSectionProcessing(this.script)

            this.script =
                data.methodsString.substring(0, data.lastIndex) +
                ',\n methods : {}\n' +
                data.methodsString[data.lastIndex]
        }
        let methodsData = extractMethodsFromScript(pattern.methodsRegex, this.script)

        return methodsData || []

    }

    addMethod (name = '', body = '', args = '') {

        let newMethod = {
            name: name,
            args: args,
            body: body
        }

        let matchMethods = this.script.match(pattern.methodsRegex)
        if (!matchMethods) {
            let data = this.scriptSectionProcessing(this.script)

            this.script =
                data.methodsString.substring(0, data.lastIndex) +
                ',\n methods : {}\n' +
                data.methodsString[data.lastIndex]
        }
        let methodsData = extractMethodsFromScript(pattern.methodsRegex, this.script)

        let updatedMethods = updateMethod(newMethod, methodsData)


        let { methodsString, firstIndex, lastIndex } = scriptSectionProcessing(
            this.script,
            pattern.methodsRegex
        )

        updatedMethods =
            methodsString.substring(0, firstIndex + 1) +
            updatedMethods +
            methodsString.substring(lastIndex, methodsString.length)

        this.script = this.script.replace(pattern.methodsRegex, updatedMethods)
    }

    removeMethod (name = '') {

        let matchMethods = this.script.match(pattern.methodsRegex)
        if (!name || !matchMethods) {
            return
        }

        let methodsData = extractMethodsFromScript(pattern.methodsRegex, this.script)
        var existingMethods = {};
        (methodsData || []).forEach(function (item) {
            if (item.name === name) {
                return
            }
            existingMethods[item.name] = new Function(
                item.args,
                item.body
            )
        })

        const vm = new Vue({
            methods: existingMethods
        })

        let updatedMethodsData = ``

        Object.keys(vm.$options.methods).forEach((key, index) => {
            let temp = String(vm.$options.methods[key]).replace(
                'function anonymous',
                key
            )
            temp = removeNewLine(temp)

            updatedMethodsData +=
                Object.keys(vm.$options.methods).length - 1 === index
                    ? temp
                    : temp + ','
        })

        let { methodsString, firstIndex, lastIndex } = scriptSectionProcessing(
            this.script,
            pattern.methodsRegex
        )

        updatedMethodsData =
            methodsString.substring(0, firstIndex + 1) +
            updatedMethodsData +
            methodsString.substring(lastIndex, methodsString.length)

        this.script = this.script.replace(pattern.methodsRegex, updatedMethodsData)
    }
}

export default VueScriptParser