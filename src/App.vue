<template>
    <div class="main-container">
        <RouterView />
    </div>

</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.main-container{
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: gray;
}
</style>
