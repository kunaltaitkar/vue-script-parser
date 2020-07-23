import { scriptSectionProcessing} from './common'
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

const setNestedObject = function(obj = {}, pList = [], value, isArray = false) {
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

export { extractAndUpdateData, setNestedObject, deletePropertyPath, extractAndUpdateMounted }