# vue-script-parser

This package can be used to parse vue script section.


## Installation

``` 
npm install vue-script-ast-parser 
```


## Usage

```
<script>

import parser from 'vue-script-ast-parser';

export default {
    data() {
        return {}
    },
    methods: {
        parseCode() {
            let code = `
                        import Vue from 'vue
                        import myComponent from 'myComponent'
                        export default {
                            data() {
                              return {
                                  name: 'Kunal'
                              }
                            },
                            methods: {
                              test() {
                                  console.log('this is test method')
                              },
                            },
                        }`
            let instance = new VueScriptParser(code)
            console.log(instance)
        }
    }
}

</script>
```

## Output

```
{
  "imports": [
    "import Vue from 'vue",
    "import myComponent from 'myComponent'"
  ],
  "data": [
    {
      "key": "name",
      "value": "Kunal"
    }
  ],
  "mounted": "\n    console.log('this is mounted')\n  ",
  "methods": [
    {
      "name": "test",
      "body": "\n      console.log('this is test method')\n    ",
      "arguments": [
        "args1",
        "args2"
      ]
    }
  ]
}
```

