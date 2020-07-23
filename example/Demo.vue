<template>
  <div>
    <div class="inline-div">
    <input placeholder="Variable name" v-model="variable.key"/>
    <input placeholder="Variable value" v-model="variable.val"/>
    <button @click="addVariable">Add variable</button>
    <button @click="removeVariable">Remove variable</button>
    <textarea v-model="mountedBody" placeholder="mounted  body"></textarea>
    <button @click="addMounted">Add mounted</button>
    <button @click="parseCode">Parse</button>
    <button @click="downloadScript()">Download Script</button>
      <p align="center">Input</p>
      <textarea
        cols="91"
        rows="37"
        class="inline-txtarea"
        v-model="input"
      ></textarea>
    </div>
    <div class="inline-div">
      <p align="center">Output</p>
      <textarea
        cols="91"
        rows="37"
        class="inline-txtarea"
        v-model="output"
      ></textarea>
    </div>
  </div>
</template>

<script>
import VueScriptParser from '../index'
export default {
  data() {
    return {
      input: `export default {
        data() {
          return {}
        },
        mounted() {console.log(1)},
        methods: {}
      }`,
      output: '{}',
      instance: '',
      variable: {
        key: '',
        val: ''
      },
      mountedBody: ''
    }
  },
  mounted() {
    this.instance = new VueScriptParser(this.input)
    this.output = JSON.stringify(this.instance, undefined, 2)
  },
  methods: {
    parseCode() {
      this.instance = new VueScriptParser(this.input)
      this.output = JSON.stringify(this.instance, undefined, 2)
    },
    addVariable() {
      this.instance.addData(this.variable.key, this.variable.val)
      this.input = this.instance.script
      this.variable = {
        key: '',
        val:''
      }
    },
    removeVariable() {
      this.instance.removeData(this.variable.key)
      this.input = this.instance.script
      this.variable = {
        key: '',
        val:''
      }
    },
    downloadScript() {
      alert(this.instance.script)
    },
    addMounted() {
      this.instance.addMounted(this.mountedBody)
      this.input = this.instance.script
      this.mountedBody = ''
    }
  },
}
</script>

<style>
.inline-div {
  display: inline-block;
}
.inline-txtarea {
  resize: none;
  border: 2px solid;
  /* height:125px; */
}
</style>
