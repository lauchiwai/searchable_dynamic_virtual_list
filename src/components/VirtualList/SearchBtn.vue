<template>
    <div class="search-container">
        <div class="search-box" >
            <span :class="show ? 'item-select-show' : 'item-select-hide'">
                {{ current + " / " + total }}
            </span>

            <span :class="show ? 'item-select-show' : 'item-select-hide'">
                <UpOutlined class="item-select-bnt" @click="searchPre()"/>
                <DownOutlined class="item-select-bnt" @click="searchNext()"/>
            </span>

            <a-input
                v-model:value="keyWord"
                :bordered="false"
                placeholder="Search"
                :class="show ?  'scrolling' : 'search-input'"
                @keydown="onKeyDown"
            />

            <SearchOutlined  class="search-icon" @click="onSearch()"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';

const emit = defineEmits(['search', 'searchPre', 'searchNext'])
const show = computed<boolean> (() => {return keyWord.value.length > 0})
const keyWord = defineModel('keyWord', { type: String, required: true, default: ""});
const current = defineModel('current', { type: Number, required: true, default: 0});
const total = defineModel('total', { type: Number, required: true, default: 0});

const searchPre = () => {
    if (total.value > 0){
        emit('searchPre')
    }
}

const searchNext = () => {
    if (total.value > 0){
        emit('searchNext')
    }
}

const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchNext()
    }
};

const onSearch = () =>{
    emit('search');
}
</script>

<style scoped>
.search-container {
    pointer-events: none;
    position: absolute;
    top: 40px;
    right: 20px; 
    z-index: 100;
    max-width: 300px;
}

.search-box {
    pointer-events: auto;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px); 
    border-radius: 24px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
    border: 1px solid #e0e0e0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 4px 12px;
}

.search-input {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    font-size: 14px;
    border: none;
    background: transparent;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
}

.search-box:hover .search-input,
.search-input:focus,
.scrolling {
    opacity: 1;
    visibility: visible;
    width: 240px; 
}

.search-icon {
    color: #64748b;
    cursor: pointer;
    padding: 8px;
    transition: color 0.2s;
    margin-left: 4px;
}

.search-icon:hover {
    color: #3b82f6;
}

.item-select-show {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 13px;
    margin: 0 12px 0 8px;
}

.item-select-bnt {
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    color: #64748b;
}

.item-select-bnt:hover {
    background: #f1f5f9;
    color: #3b82f6;
}

.scrolling {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
    opacity 0.3s ease;
}
</style>