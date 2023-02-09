import axios from "axios";
import {CallbackQueryMiddleware} from "grammy";
import ContextModel from "../models/Context";

const handler: CallbackQueryMiddleware<ContextModel> = async(ctx) => {

  const {
    appBackendEndpoint,
    socketId,
    userId,
  } = ctx.session.data.payload as {[key: string]: string};

  // Send auth to app endpoint
  await axios.post(appBackendEndpoint, {
    socketId,
    userId
  });

  // Delete message buttons
  await ctx.editMessageReplyMarkup();

  // Send OK message
  return ctx.answerCallbackQuery("Authentication confirmed");
};

export default handler;
