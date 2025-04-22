declare module 'vue-virtual-scroller' {
    import { App, Plugin, DefineComponent } from 'vue';

    export const RecycleScroller: DefineComponent;
    export const DynamicScroller: DefineComponent;
    export const DynamicScrollerItem: DefineComponent;

    const plugin: Plugin & { version: string };
    export default plugin;
}