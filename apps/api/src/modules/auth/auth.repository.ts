import { Types, type Model } from "mongoose";

import {
  AuthActionTokenModel,
  type AuthActionTokenDocument,
} from "./auth-action-token.model.js";
import {
  RefreshTokenModel,
  type RefreshTokenDocument,
} from "./refresh-token.model.js";
import type {
  AuthActionTokenRecord,
  AuthActionType,
  RefreshTokenRecord,
} from "./auth.types.js";

export interface RefreshTokenRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeIfActive(id: string, revokedAt: Date): Promise<boolean>;
  revokeFamily(familyId: string, revokedAt: Date): Promise<void>;
  revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
}

export interface AuthActionTokenRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    type: AuthActionType;
    expiresAt: Date;
  }): Promise<void>;
  consumeActive(
    tokenHash: string,
    type: AuthActionType,
    consumedAt: Date,
  ): Promise<AuthActionTokenRecord | null>;
}

type RefreshPersistence = RefreshTokenDocument & {
  _id: Types.ObjectId;
  createdAt: Date;
};

type ActionPersistence = AuthActionTokenDocument & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export class MongooseRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    private readonly model: Model<RefreshTokenDocument> = RefreshTokenModel,
  ) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    const token = await this.model.create(input);
    return toRefreshTokenRecord(token.toObject() as RefreshPersistence);
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = await this.model
      .findOne({ tokenHash })
      .lean<RefreshPersistence>();
    return token ? toRefreshTokenRecord(token) : null;
  }

  async revokeIfActive(id: string, revokedAt: Date): Promise<boolean> {
    const result = await this.model.updateOne(
      { _id: id, revokedAt: { $exists: false } },
      { $set: { revokedAt } },
    );
    return result.modifiedCount === 1;
  }

  async revokeFamily(familyId: string, revokedAt: Date): Promise<void> {
    await this.model.updateMany(
      { familyId, revokedAt: { $exists: false } },
      { $set: { revokedAt } },
    );
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    await this.model.updateMany(
      { userId, revokedAt: { $exists: false } },
      { $set: { revokedAt } },
    );
  }
}

export class MongooseAuthActionTokenRepository implements AuthActionTokenRepository {
  constructor(
    private readonly model: Model<AuthActionTokenDocument> = AuthActionTokenModel,
  ) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    type: AuthActionType;
    expiresAt: Date;
  }): Promise<void> {
    await this.model.create(input);
  }

  async consumeActive(
    tokenHash: string,
    type: AuthActionType,
    consumedAt: Date,
  ): Promise<AuthActionTokenRecord | null> {
    const token = await this.model
      .findOneAndUpdate(
        {
          tokenHash,
          type,
          consumedAt: { $exists: false },
          expiresAt: { $gt: consumedAt },
        },
        { $set: { consumedAt } },
        { new: true },
      )
      .lean<ActionPersistence>();
    return token ? toAuthActionTokenRecord(token) : null;
  }
}

function toRefreshTokenRecord(token: RefreshPersistence): RefreshTokenRecord {
  return {
    id: token._id.toString(),
    userId: token.userId.toString(),
    tokenHash: token.tokenHash,
    familyId: token.familyId,
    expiresAt: token.expiresAt,
    ...(token.revokedAt ? { revokedAt: token.revokedAt } : {}),
    createdAt: token.createdAt,
  };
}

function toAuthActionTokenRecord(
  token: ActionPersistence,
): AuthActionTokenRecord {
  return {
    id: token._id.toString(),
    userId: token.userId.toString(),
    tokenHash: token.tokenHash,
    type: token.type,
    expiresAt: token.expiresAt,
    ...(token.consumedAt ? { consumedAt: token.consumedAt } : {}),
    createdAt: token.createdAt,
  };
}
