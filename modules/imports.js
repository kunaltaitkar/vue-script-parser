class Imports {
    constructor(vueScript = '') {
        this.config = this.importsReader(vueScript) || []
    }
    importsReader (vueScript) {
        return vueScript.match(/import .*/g)
    }

}


export default Imports