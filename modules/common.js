
const scriptSectionProcessing = function (vueScript, regx) {
    let methodsString = vueScript
    if (regx) {
        var extract = vueScript.match(regx)
        methodsString = extract[0]
    }
    let stackP = []
    let firstIndex = null
    let lastIndex = null
    for (let i = 0; i < methodsString.length; i++) {
        if (methodsString[i] === '{') {
            if (stackP.length === 0) {
                firstIndex = i
            }
            stackP.push(methodsString[i])
        }
        if (methodsString[i] === '}') {
            stackP.pop()
            if (stackP.length === 0) {
                lastIndex = i
                break
            }
        }
    }
    return {
        methodsString,
        firstIndex,
        lastIndex
    }
}

export { scriptSectionProcessing }
