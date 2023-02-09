import {ObjectId} from "mongodb";

export default interface UserModel {
  _id: ObjectId
  firstName: string,
  lastName: string,
  telegramId: number,
  lastUpdatedAt: Date
}
