// types/User.ts
import { HydratedDocument, Types } from "mongoose";
import { Case } from "./Case";

export type User = {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    cases: Types.ObjectId[];
};

export type PopulatedUser = Omit<User, 'cases'> & {
    cases: Case[];
};

export type UserDocument = HydratedDocument<User>;
export type PopulatedUserDocument = HydratedDocument<PopulatedUser>;
