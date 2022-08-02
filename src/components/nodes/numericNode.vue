<template>
    <div ref="el">
        <nodeHeader  title="Numeric"/>
        <el-select v-model="method" placeholder="Select" @change="updateSelect" size="small" df-method>
        <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        >
        </el-option>
    </el-select>
    <br><br>
        <el-input v-model="valueVar" df-valueVar placeholder="Please input" size="small">
        <template #prepend>Var</template>
        </el-input>
    </div>
</template>

<script>
import { defineComponent, onMounted, getCurrentInstance, readonly, ref, nextTick } from 'vue'
import nodeHeader from './nodeHeader.vue'

export default defineComponent({
    components: {
        nodeHeader
    },
    setup() {
        const el = ref(null);
        const nodeId = ref(0);
        let df = null
        const valueVar = ref('');
        const method = ref('');
        const dataNode = ref({});
        const options = readonly([
            {
                value: 'float',
                label: 'float'
            },
            {
                value: 'int',
                label: 'int'
            }
        ]);
        
        df = getCurrentInstance().appContext.config.globalProperties.$df.value;

        const updateSelect = (value) => {
            dataNode.value.data.method = value;
            df.updateNodeDataFromId(nodeId.value, dataNode.value);
        }
        
        
        onMounted(async () => {
            await nextTick()
            nodeId.value = el.value.parentElement.parentElement.id.slice(5)
            dataNode.value = df.getNodeFromId(nodeId.value)
            
            valueVar.value = dataNode.value.data.valueVar;
            method.value = dataNode.value.data.method;
        });
        
        return {
            el, valueVar, method, options, updateSelect
        }

    }    
    
})
</script>