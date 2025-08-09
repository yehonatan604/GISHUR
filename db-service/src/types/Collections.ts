import type { Model } from 'mongoose';
import type { Case } from './Case';
import { CaseModel } from '../models/Case.model';
import { UserModel } from '../models/User.model';
import { User } from './User';

export type CollectionMap = {
    cases: Case;
    users: User;
};

export type CollectionModelMap = {
    [K in keyof CollectionMap]: Model<CollectionMap[K]>;
};

export const models: CollectionModelMap = {
    cases: CaseModel,
    users: UserModel
};
