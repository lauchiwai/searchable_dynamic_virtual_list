export interface VirtualListType<T> {
    index: number;
    item: T;
}

export interface DataType {
    index: number,
    text: string,
    key: string
}

export interface PositionsType {
    index: number,
    height: number,
    top: number,
    bottom: number,
}
