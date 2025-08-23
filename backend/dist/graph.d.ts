declare const SPEEDS: {
    walk: number;
    cycle: number;
    disabled: number;
    default: number;
};
declare const DISTANCE_MULTIPLIERS: {
    walk: number;
    cycle: number;
    disabled: number;
    default: number;
};
declare const calculateDistance: (loc1: {
    lat: number;
    lng: number;
}, loc2: {
    lat: number;
    lng: number;
}) => number;
declare const calculateTime: (distance: number, mode: string) => number;
export declare const buildGraphWithObstacles: (restriction: string) => {
    adjacencyList: {
        [key: string]: {
            [key: string]: number;
        };
    };
    allNodes: {
        [key: string]: {
            lat: number;
            lng: number;
        };
    };
};
export declare const buildGraphFromJSON: () => {
    adjacencyList: {
        [key: string]: {
            [key: string]: number;
        };
    };
    allNodes: {
        [key: string]: {
            lat: number;
            lng: number;
        };
    };
};
export { calculateDistance, calculateTime, SPEEDS, DISTANCE_MULTIPLIERS };
//# sourceMappingURL=graph.d.ts.map