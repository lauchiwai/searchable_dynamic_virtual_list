<template>
    <div ref="listRef" class="render-list-container" @scroll="scrollEvent">
        <div ref="phantomRef" class="render-list-phantom"></div>
        <div ref="contentRef" class="render-list">
            <div ref="itemRefs"
                v-for="(Content) in visibleData"
                class="list-box"
                :id="`_${Content.item.key}`"
                :key="`_${Content.item.key}`"
            >
                <slot name="content-box" :content="Content"></slot>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import type { VirtualListType, DataType, PositionsType } from '@/components/MyVirtualList/type';
import { ref, computed, onMounted, onUpdated, nextTick, watch } from 'vue';

const props = defineProps<{
    showSearchBnt: boolean;
    dataReady: boolean
}>();

let itemHeight = 100;
let startOffset = 0;
const screenHeight = ref(0);
const start = ref(0);
const end = ref(0);

const listRef = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const phantomRef = ref<HTMLDivElement| null>(null);
const contentRef = ref<HTMLDivElement| null>(null);

const keyToIndexMap = new Map<string, number>();
const positions = ref<PositionsType[]>([]);
const oriListData = defineModel('listData', { type: Array as () => DataType[], required: true, default: []});

const _listData = computed<VirtualListType<DataType>[]>(() => {
    return oriListData.value.map((item,index)=> {
        return {
            index: index,
            item
        }
    })
})

const aboveCount  = computed(() => Math.min(start.value, 1));

const belowCount = computed(() => Math.min(_listData.value.length - end.value, 1));

const visibleCount = computed(() => Math.ceil(screenHeight.value / itemHeight));

const visibleData = computed(() =>{
    const tempStart = start.value - aboveCount.value;
    const tempEnd = end.value + belowCount.value;
    return _listData.value.slice(tempStart, tempEnd);
});

const setStartOffset = () =>{
    startOffset = 0;
    if (start.value >= 1) {
        let size = positions.value[start.value].top - (positions.value[start.value - aboveCount.value] ? positions.value[start.value - aboveCount.value].top : 0);
        startOffset = positions.value[start.value - 1].bottom - size;
    }
    if (contentRef.value)
        contentRef.value.style.transform = `translate3d(0,${startOffset}px,0)`;
}

const getStartIndex = (scrollTop : number = 0) =>{
    return binarySearch(positions.value, scrollTop)
}

const binarySearch = (list : PositionsType[], value:number) =>{
    let start : number = 0
    let end : number = list.length - 1
    let tempIndex = null

    while (start <= end) {
        const midIndex = Math.floor((start + end) / 2)
        const midValue = list[midIndex].bottom
        if (midValue === value) {
            return midIndex + 1
        } else if (midValue < value) {
            start = midIndex + 1
        } else if (midValue > value) {
            if (tempIndex === null || tempIndex > midIndex) {
                tempIndex = midIndex
            }
            end = midIndex - 1;
        }
    }
    return tempIndex
}

let rafId: number | null = null;

const scrollEvent = () => {
    if (!listRef.value) return;

    const onScroll = () => {
        const scrollTop = listRef.value!.scrollTop;
        start.value = getStartIndex(scrollTop) ?? 0; 
        end.value = start.value + visibleCount.value;
        setStartOffset()
    }

    if (rafId !== null) {
        cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(onScroll);
};

const initPositions = () => {
    keyToIndexMap.clear(); 
    positions.value = _listData.value.map((virtualItem, index) => {
        keyToIndexMap.set(virtualItem.item.key, index); 
        return {
            index: index,
            height: itemHeight,
            top: index * itemHeight,
            bottom: (index + 1) * itemHeight
        }
    });
}

const debounce = (callback: () => void, delay: number) => {
    let timer: number | undefined;
    return () => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(callback, delay);
    }
}

const debouncedUpdateItemsSize = debounce(() => {
    const nodes = itemRefs.value;
    if (nodes != null && positions.value != null) {
        nodes.forEach((node) => {
            const rect = node.getBoundingClientRect();
            const height = rect.height;
            const dataKey = node.id.slice(1); 
            
            const indexInPositions = keyToIndexMap.get(dataKey);
            if (indexInPositions === undefined) return;
            const oldHeight = positions.value[indexInPositions]?.height;
            const dValue = oldHeight - height;
            if (dValue && positions.value[indexInPositions]) {
                positions.value[indexInPositions].bottom -= dValue;
                positions.value[indexInPositions].height = height;
                for (let k = indexInPositions + 1; k < positions.value.length; k++) {
                    positions.value[k].top = positions.value[k - 1].bottom;
                    positions.value[k].bottom -= dValue;
                }
            }
        });
    }
}, 200);

const updateItemsSize = () => {
    debouncedUpdateItemsSize();
}

const init = () => {
    if (listRef.value) {
        screenHeight.value = listRef.value.clientHeight;
        initPositions();
        start.value = 0;
        end.value = start.value + visibleCount.value;
    } else {
        console.log("init listRef null")
    }
}

onMounted(() => {
    init();
});

const resetStartOffset = () =>{
    if (itemRefs.value.length > 0) {
        updateItemsSize();
        const height = positions.value[positions.value.length - 1].bottom;
        if ( phantomRef.value ) {
            phantomRef.value.style.height = `${height}px`;
        }
        setStartOffset();
    }
}

onUpdated(async () => {
    await nextTick();
    resetStartOffset();
});

watch(listRef, (newvalue) => {
    if(newvalue != null) {
        screenHeight.value = newvalue.clientHeight;
        setStartOffset();
    } else {
        console.log("listRef is null")
    }
}, { deep : true});
</script>

<style scoped>
.loading-skeleton {
    display: flex;
    overflow: hidden;
    padding: 30px 50px;
}

.render-list-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;
    position: relative;
    min-height: 0;
}

.render-list-phantom {
    position: absolute;
    left: 0;
    right: 0;
    z-index: -1;
    width: 100%;
}

.render-list {
    text-align: start;
    width: 100%;
    transition: top 2s ease-out, left 2s ease-out;
}

.list-box {
    word-break:break-all;
    transition: top 1s ease-out, left 1s ease-out;
}

.gray-highlight {
    background-color: #F0F0F0;
}
</style>
