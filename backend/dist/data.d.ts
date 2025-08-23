interface Location {
    name: string;
    label: string;
    lat: number;
    lng: number;
}
export declare const getLocationById: (id: string) => Location | undefined;
export declare const getAllLocations: () => {
    [key: string]: Location;
};
export {};
//# sourceMappingURL=data.d.ts.map