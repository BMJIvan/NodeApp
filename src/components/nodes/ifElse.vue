<template>
    <div ref="el">
        <nodeHeader  title="IFELSE"/>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import nodeHeader from './nodeHeader.vue'

export default defineComponent({
    components: {
        nodeHeader
    }
})
</script>