import Data from './modules/data'
import Methods from './modules/methods'
import Mounted from './modules/mounted'
import Imports from './modules/imports'

class VueScriptParser {
    constructor(vueScript = '') {

        //set original script
        this.script = vueScript

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
    addVariable () {
        
    }
    removeVariable () {
        
    }
}

export default VueScriptParser