class Imports {
    constructor(vueScript = '') {
        this.imports = this.setImports(vueScript) || []
    }
    setImports (vueScript) {
        return vueScript.match(/import .*/g)
    }

}


export default Imports