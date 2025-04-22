<!-- ParentComponent.vue -->
<template>
    <div class="list-container">
        <VirtualList 
            v-model:listData="items"
        >
            <template #content-box="{ content, keyWord, insertItem, removeItem }">
                <div class="custom-item">
                    <div class="text-content" v-html="highlightText(content.text, keyWord)"></div>
                    <div class="actions">
                        <a-button type="primary" @click="insertItem(generateNewItem(content))">
                            Insert
                        </a-button>
                        <a-button danger @click="removeItem(content.index)">
                            Remove
                        </a-button>
                    </div>
                </div>
            </template>
        </VirtualList>
    </div>
</template>

<script lang="ts" setup>
import type { DataType } from '@/components/VirtualList/type'
import { ref } from 'vue'

import VirtualList from '@/components/VirtualList/VirtualList.vue'

const items = ref<DataType[]>(Array.from({ length: 1000 }, (_, i) => ({
    index: i,
    text: `Item ${i} - ${'Content '.repeat(Math.floor(Math.random() * 80) + 1)}`,
    key: `new-item-${Date.now()}-${Math.random()}`
})))

const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
}

const generateNewItem = (item: DataType) => ({
    index: item.index + 1,
    text: `New Item - ${'Content '.repeat(Math.floor(Math.random() * 80) + 1)}`,
    key: `new-item-${Date.now()}-${Math.random()}`
} as DataType)
</script>

<style scoped>
.list-container{
    height: 80vh;
    width: 80vw;
    border: 1px solid white;
    border-radius: 5px; 
    background-color: #E0E0E0;
}

.custom-item {
    padding: 16px;
    margin: 8px;
    border-radius: 8px;
    background: transparent;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.custom-item:hover {
    transform: translateX(4px);
}

.text-content {
    margin-bottom: 12px;
    line-height: 1.6;
    color: #334155;
}

.actions {
    display: flex;
    gap: 8px;
}

mark {
    background-color: #fde047;
    padding: 0 2px;
}
</style>