<template>
  <div>
    <div class="inline-div">
      <p align="center">Input</p>
      <textarea cols="91" @input="parseCode" rows="39" class="inline-txtarea" v-model="input"></textarea>
    </div>
    <div class="inline-div">
      <p align="center">Output</p>
      <textarea cols="91" rows="39" class="inline-txtarea" v-model="output"></textarea>
    </div>
  </div>
</template>

<script>
import VueScriptParser from './plugin/index'
export default {
  data() {
    return {
      input: ``,
      output: '{}',
    }
  },
  methods: {
    parseCode() {
      let instance = new VueScriptParser(this.input)
      this.output = JSON.stringify(instance, undefined, 2)
    },
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
