import axios from "axios";
import {CallbackQueryMiddleware} from "grammy";
import AppModel from "../models/App";
import ContextModel from "../models/Context";

const handler: CallbackQueryMiddleware<ContextModel> = async(ctx) => {

  const {
    app,
    socketId,
    userId,
  } = ctx.session.data as {[key: string]: string};

  const $app: AppModel = JSON.parse(app);

  // Send auth to app endpoint
  await axios.post($app.authEndpoint, {
    socketId,
    userId
  });

  // Delete message buttons
  await ctx.editMessageReplyMarkup();

  // Send OK message
  return ctx.answerCallbackQuery("Authentication confirmed");
};

export default handler;
