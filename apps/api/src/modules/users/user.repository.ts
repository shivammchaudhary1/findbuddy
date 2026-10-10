import { Types, type Model } from "mongoose";

import type { AccountStatus } from "@findbuddy/types";

import { UserModel, type UserDocument } from "./user.model.js";
import type { CreateUserInput, UserRecord } from "./user.types.js";

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  markEmailVerified(id: string, verifiedAt: Date): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

type UserPersistence = UserDocument & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export class MongooseUserRepository implements UserRepository {
  constructor(private readonly model: Model<UserDocument> = UserModel) {}

  async create(input: CreateUserInput): Promise<UserRecord> {
    const document = await this.model.create(input);
    return toUserRecord(document.toObject() as UserPersistence);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.model
      .findOne({ email })
      .select("+passwordHash")
      .lean<UserPersistence>();
    return user ? toUserRecord(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const user = await this.model
      .findById(id)
      .select("+passwordHash")
      .lean<UserPersistence>();
    return user ? toUserRecord(user) : null;
  }

  async markEmailVerified(id: string, verifiedAt: Date): Promise<void> {
    await this.model.updateOne(
      { _id: id, emailVerifiedAt: { $exists: false } },
      { $set: { emailVerifiedAt: verifiedAt } },
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { $set: { passwordHash } });
  }
}

function toUserRecord(user: UserPersistence): UserRecord {
  return {
    id: user._id.toString(),
    email: user.email,
    passwordHash: user.passwordHash,
    accountRole: user.accountRole,
    accountStatus: user.accountStatus as AccountStatus,
    ...(user.emailVerifiedAt ? { emailVerifiedAt: user.emailVerifiedAt } : {}),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
