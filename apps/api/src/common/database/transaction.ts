import mongoose, { type ClientSession, type Mongoose } from "mongoose";

export interface TransactionRunner {
  run<T>(work: (session?: ClientSession) => Promise<T>): Promise<T>;
}

export class MongooseTransactionRunner implements TransactionRunner {
  constructor(private readonly instance: Mongoose = mongoose) {}

  async run<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.instance.startSession();
    try {
      let result!: T;
      let completed = false;
      await session.withTransaction(async () => {
        result = await work(session);
        completed = true;
      });
      if (!completed) {
        throw new Error("Database transaction completed without a result");
      }
      return result;
    } finally {
      await session.endSession();
    }
  }
}
