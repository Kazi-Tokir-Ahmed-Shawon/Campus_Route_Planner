import mongoose, { Document } from 'mongoose';
export interface ILocation extends Document {
    id: string;
    name: string;
    label: string;
    lat: number;
    lng: number;
    type: 'all-campus' | 'tree-house-campus';
    room_code?: string;
    welsh_name?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Location: mongoose.Model<ILocation, {}, {}, {}, mongoose.Document<unknown, {}, ILocation, {}, {}> & ILocation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Location.d.ts.map