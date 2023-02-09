import {ObjectId} from "mongodb";

export default interface AppModel {
  _id: ObjectId,
  url: string,
  authEndpoint: string
}
