<template>

<el-container>
  <el-container class="name">
    <h3>Node App</h3>
  </el-container>

  <el-container>
      <el-header class="header">
        <el-button type="primary" @click="executeNodeCode">Execute Node Code</el-button>
        <el-button type="primary" @click="pythonCode">Make Python Code</el-button>
        <el-button type="primary" @click="clearEditor">Clear Editor</el-button>
        <el-button type="primary" @click="importEditor">Import Editor</el-button>
        <el-button type="primary" @click="exportEditor">Export Editor</el-button>
      </el-header>
  </el-container>
</el-container>

<el-container>
  <el-container class="container">
    <el-aside width="250px" class="column">
        <ul>
            <li v-for="n in listNodes" :key="n" draggable="true" :data-node="n.item" @dragstart="drag($event)" class="drag-drawflow" >
                <div class="node" :style="`background: ${n.color}`" >{{ n.name }}</div>
            </li>
        </ul>
    </el-aside>
    <el-main>
        <div id="drawflow" @drop="drop($event)" @dragover="allowDrop($event)"></div>
    </el-main>
  </el-container>
</el-container>

<el-dialog
  v-model="dialogVisiblePythonCode" title="pythonCode" width="50%">
  <span>Python Code:</span>
  <pre><code id="pythonCode">{{dialogPythonCode}}</code></pre>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisiblePythonCode = false">Cancel</el-button>
      <el-button type="primary" @click="dialogVisiblePythonCode = false">Confirm</el-button>
    </span>
  </template>
</el-dialog>

<el-dialog
    v-model="dialogVisibleImport" title="Import" width="50%">
    <span>Data:</span>
    <pre><code id="importData">{{dialogDataImport}}</code></pre>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisibleImport = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisibleImport = false, importDataConfirm()">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

<el-dialog
  v-model="dialogVisibleExport" title="Export" width="50%">
  <span>Data:</span>
  <p id="exportData">{{dialogDataExport}}</p>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisibleExport = false">Cancel</el-button>
      <el-button type="primary" @click="dialogVisibleExport = false, exportDataConfirm()">Confirm</el-button>
    </span>
  </template>
</el-dialog>

  <el-container>
    <el-container class="console">Console: {{consoleData}}</el-container>
    <el-container class="requests">Requests: {{requestsData}} </el-container>
  </el-container>

</template>

<script>

import DrawflowApp from 'drawflow/dist/drawflow.min.js'
import { onMounted, shallowRef, h, getCurrentInstance, render, readonly, ref } from 'vue'
import Numeric from './nodes/numericNode.vue'
import Logic from './nodes/logicOps.vue'
import Math from './nodes/mathOps.vue'
import IFELSE from './nodes/ifElse.vue'
import FOR from './nodes/FOR.vue'
import DrawflowExtend from '../assets/drawflowExtend.js'
import axios from 'axios'

export default {
  name: 'drawflowApp',
  setup() {
    const listNodes = readonly([
         {
            name: 'Numeric',
            color: 'gray',
            item: 'Numeric',
            input: 0,
            output: 1

        },
         {
            name: 'Logic',
            color: 'green',
            item: 'Logic',
            input: 2,
            output: 1

        },
         {
            name: 'Math',
            color: 'brown',
            item: 'Math',
            input: 2,
            output: 1 
        },
         {
            name: 'IF/ELSE',
            color: 'blue',
            item: 'IFELSE',
            input: 3,
            output: 1

        },
         {
            name: 'FOR',
            color: 'black',
            item: 'FOR',
            input: 3,
            output: 1
         }
    ])
   
    const editor = shallowRef({});
    const dialogVisibleExport = ref(false);
    const dialogVisibleImport = ref(false);
    const dialogVisiblePythonCode = ref(false);
    const dialogDataExport = ref({});
    const dialogDataImport = ref({});
    const dialogPythonCode = ref('');
    const Vue = { version: 3, h, render };
    const internalInstance = getCurrentInstance();
    internalInstance.appContext.app._context.config.globalProperties.$df = editor;
    const drawflowExtend = shallowRef({});
    const consoleData = ref('');
    const requestsData = ref('');

    function executeNodeCode(){
      consoleData.value = drawflowExtend.value.executeNodeCode(editor.value.export())
      
      //console.log(drawflowExtend.value.data)
      //console.log(drawflowExtend.value.nodes)
    }

    function pythonCode(){
      //crear una funcion de javascript para convertir string/JSON a codigo python
      dialogPythonCode.value = drawflowExtend.value.makePythonCode(editor.value.export());
      dialogVisiblePythonCode.value = true;
    }

    function clearEditor(){
      editor.value.import({"drawflow": {"Home": {"data": {}}}});
      //algoritmo.value.obtenerNodos();
    }

    function importEditor() {
      //recivir de servidor y guardar en dialogDataImport
      //let palabra = "{\"drawflow\": {\"Home\": {\"data\": {}}}}";
      //dialogDataImport.value = JSON.parse(palabra);       
      dialogVisibleImport.value = true;
      axios.get('http://localhost:3000/readEditor')
      .then(response => {
        dialogDataImport.value = response.data;
      })
      .catch(error => requestsData.value = error)
    }

    function importDataConfirm(){
      if(dialogDataImport.value == 'Empty'){
        requestsData.value = "Empty"
        return 
      }
      editor.value.import(JSON.parse(dialogDataImport.value.replace("\\\"", "'")))
      requestsData.value = "Imported"
    }

    function exportEditor() {
      dialogDataExport.value = editor.value.export();
      dialogVisibleExport.value = true;
    }

    function exportDataConfirm(){
      var Editor = JSON.stringify(dialogDataExport.value)
      axios.get('http://localhost:3000/saveEditor?Editor='+Editor)
      .then(response => {
        requestsData.value = response.data;
      })
      .catch(error => requestsData.value = error)
      dialogVisibleExport.value = false;
    }

    const drag = (ev) => {
      if (ev.type === "touchstart") {
        mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
      } else {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
      }
    }
    const drop = (ev) => {
      if (ev.type === "touchend") {
        var parentdrawflow = document.elementFromPoint( mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflowApp");
        if(parentdrawflow != null) {
          addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
        }
        mobile_item_selec = '';
      } else {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
      }

    }
    const allowDrop = (ev) => {
      ev.preventDefault();
    }

   let mobile_item_selec = '';
   let mobile_last_move = null;
   function positionMobile(ev) {
     mobile_last_move = ev;
   }

    function addNodeToDrawFlow(name, pos_x, pos_y) {
      pos_x = pos_x * ( editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)) - (editor.value.precanvas.getBoundingClientRect().x * ( editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)));
      pos_y = pos_y * ( editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)) - (editor.value.precanvas.getBoundingClientRect().y * ( editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)));
    
      const nodeSelected = listNodes.find(ele => ele.item == name);
      editor.value.addNode(name, nodeSelected.input,  nodeSelected.output, pos_x, pos_y, name, {}, name, 'vue');
      
    }

   onMounted(() => {
      var elements = document.getElementsByClassName('drag-drawflow');
      for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('touchend', drop, false);
        elements[i].addEventListener('touchmove', positionMobile, false);
        elements[i].addEventListener('touchstart', drag, false );
      }
      
       const id = document.getElementById("drawflow");
       drawflowExtend.value = new DrawflowExtend();
       editor.value = new DrawflowApp(id, Vue, internalInstance.appContext.app._context);
       editor.value.start();

       editor.value.registerNode('Numeric', Numeric, {}, {})
       editor.value.registerNode('Logic', Logic, {}, {})
       editor.value.registerNode('Math', Math, {}, {})
       editor.value.registerNode('IFELSE', IFELSE, {}, {})
       editor.value.registerNode('FOR', FOR, {}, {})

       editor.value.import({"drawflow": {"Home": {"data": {}}}})
  })

  return {
    exportEditor, importEditor, listNodes, drag, drop, allowDrop, dialogVisibleExport, dialogVisibleImport, dialogDataExport, dialogDataImport, importDataConfirm, exportDataConfirm, clearEditor, pythonCode, dialogPythonCode, dialogVisiblePythonCode, executeNodeCode, consoleData, requestsData
  }

  },

  data(){
    return {
      NodeApp_pro: ""
    }
  },

  methods: {
    mostrarConsola(){
      console.log("funcion trasferida")
    }
  }

}
</script>

<style scoped>
@import "drawflow/dist/drawflow.min.css";
@import "../assets/style.css";

.name {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #494949;
}

.header {
    display: flex;
    justify-content: right;
    align-items: center;
    border-bottom: 1px solid #494949;
}
.container {
    min-height: calc(100vh - 100px);
}
.column {
    border-right: 1px solid #494949;
}
.column ul {
    padding-inline-start: 0px;
    padding: 10px 10px;
 
}
.column li {
    background: transparent;
}

.node {
    border-radius: 8px;
    border: 2px solid #494949;
    display: block;
    height:60px;
    line-height:40px;
    padding: 10px;
    margin: 10px 0px;
    cursor: move;
}

.console {
    min-width: calc(50vh - 0px);
    max-width: calc(150vh - 0px);
}

.requests {
    min-width: calc(50vh - 0px);
    max-width: calc(150vh - 0px);
}

#drawflow {
  width: 100%;
  height: 100%;
  text-align: initial;
  background: #2b2c30;
  background-size: 20px 20px;
  background-image: radial-gradient(#494949 1px, transparent 1px);
}
</style>