<template>
    <div class="scroller-container">
        <SearchBtn
            v-model:keyWord="keyWord"
            v-model:current="searchState.current"
            v-model:total="searchState.total"
            @search="onSearch"
            @searchNext="searchNext"
            @searchPre="searchPre"
        />

        <DynamicScroller
            ref="scrollerRef"
            :items="_listData"
            :min-item-size="80"
            :prerender="12"
            :buffer="200"
            key-field="index"
            class="scroller"
        >
            <template v-slot="{ item, index, active }">
                <DynamicScrollerItem
                    :item="item"
                    :active="active"
                    :data-index="index"
                    :id="item.index"
                >
                    <div class="content-container"
                        :class="[(searchState.activeIndex == index) ? 'blue-bgc' : '']"
                    >
                        <slot name="content-box" :content="item" :keyWord="keyWord" :insertItem="insertItem" :removeItem="removeItem"></slot>
                    </div>

                </DynamicScrollerItem>
            </template>
        </DynamicScroller>
    </div>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue';
import type { DataType } from "@/components/VirtualList/type";

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { ref, watch, inject } from 'vue';

import SearchBtn from './SearchBtn.vue';
import type { ComponentPublicInstance } from 'vue'

interface VirtualScrollerExposes {
    scrollToItem: (index: number) => void
}

const scrollerRef = ref<ComponentPublicInstance & VirtualScrollerExposes | null>(null)
const keyWord = ref<string>("");
const _listData = defineModel("listData", { type: Array as () => DataType[], required: true, default: [] });
const searchState = ref({
    current: 0,
    total: 0,
    activeIndex: undefined as number | undefined
});

watch(keyWord, (newValue) => {
    if (newValue.length > 0) {
        onSearch();
    } else {
        searchState.value.activeIndex = undefined
    }
});

watch(() => searchState.value.activeIndex, (newValue) => {
    if (newValue != null && newValue != undefined && newValue > -1) {
        scrollToIndex();
    }
});

// const insertItem = (newItem: DataType) => {
//     _listData.value.splice(newItem.index, 0, newItem)
//     _listData.value.forEach((item, idx) => {
//         if (item.index !== idx) {
//             item.index = idx
//         }
//     })
// }

const insertItem = (newItem: DataType) => {
    const insertIndex = newItem.index;
    
    const newList = [
        ..._listData.value.slice(0, insertIndex),
        newItem,
        ..._listData.value.slice(insertIndex)
    ];

    newList.forEach((item, index) => {
        if (index >= insertIndex) {
        item.index = index;
        }
    });

    _listData.value = newList;
};

const removeItem = (index: number) => {
    const newList = _listData.value.filter((_, i) => i !== index);
    
    newList.forEach((item, i) => {
        if (i >= index) {
        item.index = i;
        }
    });

    _listData.value = newList;

    if (searchState.value.activeIndex === index) {
        resetSearch();
    }
};

const searchPre = () => {
    if (searchState.value.current == 1) {
        searchState.value.current = searchState.value.total;
    } else {
        searchState.value.current--;
    }

    let keyWordChange = false;
    onSearch(keyWordChange);
}

const searchNext = () => {
    if (searchState.value.current == searchState.value.total) {
        searchState.value.current = 1;
    } else {
        searchState.value.current++;
    }

    let keyWordChange = false;
    onSearch(keyWordChange);
}

const resetSearch = () => {
    searchState.value.total = 0;
    searchState.value.current = 0;
    searchState.value.activeIndex = undefined;
}

const onSearch = (keyWordChange: boolean = true) => {
    const validateKeyWord = () =>{
        return trimmedSearch.length > 0;
    }

    const validateMatchData= () =>{
        return matchDatas.length != 0
    }

    const findMatchData = () =>{
        return _listData.value.filter((item) =>
            item.text.toLowerCase().includes(trimmedSearch)
        );
    }

    const initCurrentIndex = () =>{
        if (keyWordChange) {
            searchState.value.current = matchDatas.length > 0 ? 1 : 0;
        }
    }

    const initTotal = () =>{
        if (keyWordChange) {
            searchState.value.total = matchDatas.length;
        }
    }

    const trimmedSearch = keyWord.value.trim().toLowerCase();
    if (!validateKeyWord()) {
        return;
    }

    let matchDatas = findMatchData()
    if (!validateMatchData()) {
        resetSearch();
        return;
    };

    initCurrentIndex();
    initTotal();
    searchState.value.activeIndex = matchDatas[searchState.value.current - 1].index;
};

const scrollToIndex = () => {
    if (scrollerRef.value && searchState.value.activeIndex) {
        scrollerRef.value.scrollToItem(searchState.value.activeIndex);
    }
};
</script>

<style scoped>
.scroller-container{
    height: 100%;
    width: 100%;
    position: relative;
}

.blue-bgc{
    background-color: #ECF5FF;
}

.scroller {
    height: 100%;
    width: 100%;
}
</style>
