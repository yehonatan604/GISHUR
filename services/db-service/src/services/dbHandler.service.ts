import { CaseModel } from "../models/Case.model.js";
import { UserModel } from "../models/User.model.js";
import { DbActionInput } from "../types/Actions.js";
import { CollectionModelMap } from "../types/Collections.js";

export const handleDbAction = async (input: DbActionInput): Promise<any> => {
    if (input.action === 'ping') {
        return { status: 'ok', service: 'db-service', timestamp: Date.now() };
    }

    const { action } = input;

    const models: CollectionModelMap = {
        cases: CaseModel,
        users: UserModel
    };

    switch (action) {
        case 'insert': {
            const { collection, payload } = input;
            console.log('🔧 Inserting to DB:', payload);
            const model = models[collection as keyof CollectionModelMap];
            const res = await (model as any).create(payload);
            console.log('✅ Inserted:', res);
            return res;
        }
        case 'find': {
            const { collection, payload } = input;
            console.log('🔍 DB Find query:', payload);
            const res = await (models[collection as keyof CollectionModelMap] as any).find(payload);
            console.log('📦 DB Find result:', res);
            return res;
        }
        case 'findOne': {
            const { collection, payload } = input;
            console.log('🔍 DB FindOne query:', payload);
            const res = await (models[collection as keyof CollectionModelMap] as any).findOne(payload);
            console.log('📦 DB FindOne result:', res);
            return res;
        }
        case 'update': {
            const { collection, payload } = input;
            return (models[collection as keyof CollectionModelMap] as any).updateOne(payload.filter, payload.update);
        }
        case 'delete': {
            const { collection, payload } = input;
            return (models[collection as keyof CollectionModelMap] as any).deleteOne(payload);
        }
        default:
            throw new Error(`Unknown action: ${(action)}`);
    }
};
