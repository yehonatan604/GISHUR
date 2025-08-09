import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { CollectionMap } from './Collections';

export type DbAction = 'ping' | 'insert' | 'find' | 'update' | 'delete' | 'findOne';

export type ActionInputMap = {
    ping: undefined;
    insert: {
        [K in keyof CollectionMap]: { collection: K; payload: CollectionMap[K] }
    }[keyof CollectionMap];
    find: {
        [K in keyof CollectionMap]: { collection: K; payload: FilterQuery<CollectionMap[K]> }
    }[keyof CollectionMap];
    findOne: {
        [K in keyof CollectionMap]: { collection: K; payload: FilterQuery<CollectionMap[K]> }
    }[keyof CollectionMap];
    update: {
        [K in keyof CollectionMap]: {
            collection: K;
            payload: {
                filter: FilterQuery<CollectionMap[K]>;
                update: UpdateQuery<CollectionMap[K]>;
            };
        }
    }[keyof CollectionMap];
    delete: {
        [K in keyof CollectionMap]: { collection: K; payload: FilterQuery<CollectionMap[K]> }
    }[keyof CollectionMap];
};

export type DbActionInput = {
    [K in DbAction]: { action: K } & (ActionInputMap[K] extends undefined ? {} : ActionInputMap[K])
}[DbAction];
