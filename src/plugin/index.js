import Data from './data'
import Methods from './methods'
import Mounted from './mounted'
import Imports from './imports'
class VueScriptParser {
    constructor(vueScript = '') {
        //load imports
        let importsProcessor = new Imports(vueScript)
        this.imports = importsProcessor.imports

        //load data
        let dataProcessor = new Data(vueScript)
        this.data = dataProcessor.data

        //load mounted
        let mountedProcessor = new Mounted(vueScript)
        this.mounted = mountedProcessor.mounted

        //load methods
        let methodsProcessor = new Methods(vueScript)
        this.methods = methodsProcessor.methods
    }
}

export default VueScriptParser