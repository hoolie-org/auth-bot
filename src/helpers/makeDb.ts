import {Collection, MongoClient} from "mongodb";
import config from "../config";
import AppModel from "../models/App";
import UserModel from "../models/User";

export let $db: {
  users: Collection<UserModel>,
  apps: Collection<AppModel>,
};

export async function makeDb(): Promise<typeof $db> {

  const client = new MongoClient(config.DB.URL);
  await client.connect();

  const db = client.db(config.DB.NAME);

  $db = {
    users: db.collection("users"),
    apps: db.collection("apps"),
  };

  return $db;
}
