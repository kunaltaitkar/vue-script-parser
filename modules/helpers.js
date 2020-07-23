import { scriptSectionProcessing } from './common'
import Vue from 'vue'
const extractAndUpdateData = function (vueScript, regx) {
    let data = dataSectionProcessing(vueScript, regx)
    let oldData = data.methodsString.substring(
        data.firstIndex + 1,
        data.lastIndex
    )
    return { oldData, data }
}
const dataSectionProcessing = function (stringToBeProcessed, regx) {
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

const setNestedObject = function (obj = {}, pList = [], value, isArray = false) {
    if (pList.length === 0) return obj
    const key = pList.pop()
    const pointer = pList.reduce((accumulator, currentValue) => {
        if (accumulator[currentValue] === undefined) {
            accumulator[currentValue] = {}
        }
        return accumulator[currentValue]
    }, obj)
    if (isArray) {
        pointer[key] = Array.isArray(pointer[key]) ? pointer[key] : []
        pointer[key].push(value)
        return obj
    }
    pointer[key] = value
    return obj
}

const deletePropertyPath = function (obj, path) {
    if (!obj || !path) {
        return
    }

    if (typeof path === 'string') {
        path = path.split('.')
    }

    for (var i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]]

        if (typeof obj === 'undefined') {
            return
        }
    }

    delete obj[path.pop()]
}

const extractAndUpdateMounted = function (regx, oldScript, newMountedBody) {
    // extracts old mounted indexes
    let newScript = ''
    if (!oldScript) {
        oldScript = `
      export default {
        data () {
          return {}
        },
        mounted () {},
        created () {},
        methods : {}  
      }
      `
    }
    let matchMounted = oldScript.match(regx)
    if (!matchMounted) {
        let data = scriptSectionProcessing(oldScript)
        newMountedBody = ',\n mounted() { \n' + newMountedBody + '\n}'
        newScript =
            data.methodsString.substring(0, data.lastIndex) +
            newMountedBody +
            data.methodsString[data.lastIndex]
    } else {
        let data = scriptSectionProcessing(oldScript, regx)
        newMountedBody =
            data.methodsString.substring(0, data.firstIndex + 1) +
            newMountedBody +
            data.methodsString.substring(data.lastIndex, data.methodsString.length)
        newScript = oldScript.replace(regx, newMountedBody)
    }

    return newScript
}

const extractMethodsFromScript = function (regx, vueScript = '') {
    let { methodsString, firstIndex, lastIndex } = scriptSectionProcessing(
        vueScript,
        regx
    )
    return makeArrayOfMethods(
        methodsString.substring(firstIndex + 1, lastIndex)
    )
}

const updateMethod = function (newMethod, methodsData) {


    var existingMethods = {};

    (methodsData || []).forEach(function (item) {
        existingMethods[item.name] = new Function(
            item.args,
            item.body
        )
    })

    const vm = new Vue({
        methods: existingMethods
    })

    let newMethodFunction = new Function(
        newMethod.args,
        newMethod.body
    );

    let updatedMethodsData = ``

    vm.$options.methods[newMethod.name] = newMethodFunction

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

    return updatedMethodsData
}

const removeNewLine = function (functionStr) {
    let closingParethesesIndex = null
    for (let i = 0; i < functionStr.length; i++) {
        if (functionStr[i] == ')') {
            closingParethesesIndex = i
            break
        }
    }
    functionStr =
        functionStr
            .substring(0, closingParethesesIndex + 1)
            .split('\n')
            .join('') +
        functionStr.substring(closingParethesesIndex + 1, functionStr.length)
    return functionStr
}

function makeArrayOfMethods (methodsStr) {
    let methodDetails = []
    let arrayOfFirstIndexes = []
    let arrayOfLastIndexes = []
    let bracesStk = []
    let fIndex = 0
    let lIndex = -2
    var functionName = ''
    if (methodsStr) {
        for (let i = 0; i < methodsStr.length; i++) {
            if (bracesStk.length === 0 && methodsStr[i] === '(') {
                functionName = methodsStr
                    .substring(lIndex + 2, i)
                    .split('\n')
                    .join('')
                    .split(' ')
                    .join('')
            }
            if (methodsStr[i] === '{') {
                if (bracesStk.length === 0) {
                    fIndex = i
                    arrayOfFirstIndexes.push(fIndex)
                }
                bracesStk.push(methodsStr[i])
            }
            if (methodsStr[i] === '}') {
                bracesStk.pop()
                if (bracesStk.length === 0) {
                    lIndex = i
                    arrayOfLastIndexes.push(lIndex)
                    var obj = {
                        name: functionName,
                        body: methodsStr.substring(fIndex + 1, lIndex),
                        args: []
                    }
                    methodDetails.push(obj)
                }
            }
        }
        for (let i = 0; i < arrayOfFirstIndexes.length; i++) {
            if (i == 0) {
                methodDetails[i].args = collectArgs(
                    methodsStr.substring(0, arrayOfFirstIndexes[i])
                )
            } else {
                methodDetails[i].args = collectArgs(
                    methodsStr.substring(
                        arrayOfLastIndexes[i - 1] + 2,
                        arrayOfFirstIndexes[i]
                    )
                )
            }
        }
        return methodDetails
    }
    return []
}
function collectArgs (str) {
    let firstParentheses = null
    let lastParentheses = null
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '(') {
            firstParentheses = i
        }
        if (str[i] == ')') {
            lastParentheses = i
        }
    }
    return str.substring(firstParentheses + 1, lastParentheses).split(',')
}


export { extractAndUpdateData, setNestedObject, deletePropertyPath, extractAndUpdateMounted, extractMethodsFromScript, updateMethod, removeNewLine }