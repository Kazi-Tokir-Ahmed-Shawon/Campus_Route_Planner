interface PathResult {
    path: string[];
    distance: number;
}
export declare const findPath: (graph: {
    [key: string]: {
        [key: string]: number;
    };
}, locations: {
    [key: string]: {
        lat: number;
        lng: number;
    };
}, startId: string, endId: string) => PathResult | null;
export declare const findKShortestPaths: (graph: {
    [key: string]: {
        [key: string]: number;
    };
}, locations: {
    [key: string]: {
        lat: number;
        lng: number;
    };
}, startId: string, endId: string, k: number) => PathResult[];
export declare const printAllPaths: (graph: {
    [key: string]: {
        [key: string]: number;
    };
}, startId: string, endId: string) => void;
export {};
//# sourceMappingURL=astar.d.ts.map