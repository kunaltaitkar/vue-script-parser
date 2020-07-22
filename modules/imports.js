class Imports {
    constructor(vueScript = '') {
        this.imports = this.importsReader(vueScript) || []
    }
    importsReader (vueScript) {
        return vueScript.match(/import .*/g)
    }

}


export default Imports