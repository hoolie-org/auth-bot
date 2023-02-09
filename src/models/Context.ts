import {Context, SessionFlavor} from "grammy";

export interface SessionStorageModel {
  state: null
    |"hereIsState";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

type ContextWithSession = Context&SessionFlavor<SessionStorageModel>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface ContextModel extends ContextWithSession {

}
