import type { Model } from 'mongoose';
import type { Case } from './Case';
import { CaseModel } from '../models/Case.model';

export type CollectionMap = {
    cases: Case;
};

export type CollectionModelMap = {
    [K in keyof CollectionMap]: Model<CollectionMap[K]>;
};

export const models: CollectionModelMap = {
    cases: CaseModel,
};
