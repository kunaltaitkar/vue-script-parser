import { scriptSectionProcessing } from './common'

class Methods {
    constructor(vueScript = '') {
        this.methods = this.setMethod(vueScript)
    }
    setMethod (vueScript = '') {
        let regx = /methods\s*:\s*{([^]*)}/g
        let matchMethods = vueScript.match(regx)
        if (!matchMethods) {
            let data = scriptSectionProcessing(vueScript)

            vueScript =
                data.methodsString.substring(0, data.lastIndex) +
                ',\n methods : {}\n' +
                data.methodsString[data.lastIndex]
        }
        let methodsData = this.extractMethodsFromScript(regx, vueScript)

        return methodsData || []

    }
    extractMethodsFromScript (regx, vueScript = '') {
        let { methodsString, firstIndex, lastIndex } = scriptSectionProcessing(
            vueScript,
            regx
        )
        return this.makeArrayOfMethods(
            methodsString.substring(firstIndex + 1, lastIndex)
        )
    }

    makeArrayOfMethods (methodsStr) {
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
                            arguments: []
                        }
                        methodDetails.push(obj)
                    }
                }
            }
            for (let i = 0; i < arrayOfFirstIndexes.length; i++) {
                if (i == 0) {
                    methodDetails[i].arguments = this.collectArgs(
                        methodsStr.substring(0, arrayOfFirstIndexes[i])
                    )
                } else {
                    methodDetails[i].arguments = this.collectArgs(
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
    collectArgs (str) {
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
}


export default Methods