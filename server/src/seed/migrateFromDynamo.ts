/**
 * One-off migration: copy every course, transaction and progress record from
 * DynamoDB (DynamoDB Local by default) into MongoDB.
 *
 *   MONGODB_URI=<target> npm run migrate:dynamo
 *
 * Optional env: DYNAMODB_ENDPOINT (default http://localhost:8000), AWS_REGION.
 * Safe to re-run: records are upserted by their natural keys, never duplicated.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { connectDB } from "../db";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

const endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
const isLocal = endpoint.includes("localhost") || endpoint.includes("127.0.0.1");

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION || "us-east-1",
    ...(isLocal
      ? { credentials: { accessKeyId: "local", secretAccessKey: "local" } }
      : {}),
  })
);

const scanAll = async (TableName: string) => {
  const items: Record<string, any>[] = [];
  let ExclusiveStartKey: Record<string, any> | undefined;
  do {
    const page = await dynamo.send(new ScanCommand({ TableName, ExclusiveStartKey }));
    items.push(...(page.Items ?? []));
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
};

// Dynamoose stored timestamps as epoch millis; Mongoose expects Dates
const fixTimestamps = (item: Record<string, any>) => ({
  ...item,
  ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
  ...(item.updatedAt ? { updatedAt: new Date(item.updatedAt) } : {}),
});

const tables = [
  { table: "Course", model: Course, key: (i: any) => ({ courseId: i.courseId }) },
  { table: "Transaction", model: Transaction, key: (i: any) => ({ transactionId: i.transactionId }) },
  {
    table: "UserCourseProgress",
    model: UserCourseProgress,
    key: (i: any) => ({ userId: i.userId, courseId: i.courseId }),
  },
];

async function migrate() {
  console.log(`Reading from DynamoDB at ${endpoint}`);
  await connectDB();

  for (const { table, model, key } of tables) {
    const Model = model as mongoose.Model<any>;
    const items = await scanAll(table).catch((error) => {
      console.warn(`  ${table}: could not read (${error.name}) - skipped`);
      return [] as Record<string, any>[];
    });
    if (items.length === 0) {
      console.log(`  ${table}: nothing to copy`);
      continue;
    }
    await Model.syncIndexes();
    const result = await Model.bulkWrite(
      items.map((item) => ({
        replaceOne: { filter: key(item), replacement: fixTimestamps(item), upsert: true },
      })),
      { timestamps: false } as any
    );
    console.log(
      `  ${table}: ${items.length} read -> ${result.upsertedCount} inserted, ${result.modifiedCount} updated`
    );
  }
}

migrate()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
