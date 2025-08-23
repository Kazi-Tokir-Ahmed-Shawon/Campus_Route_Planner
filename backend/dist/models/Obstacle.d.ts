import mongoose, { Document } from 'mongoose';
export interface IObstacle extends Document {
    id: string;
    name: string;
    lat: number;
    lng: number;
    restricted_for: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Obstacle: mongoose.Model<IObstacle, {}, {}, {}, mongoose.Document<unknown, {}, IObstacle, {}, {}> & IObstacle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Obstacle.d.ts.map