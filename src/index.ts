/* eslint-disable @typescript-eslint/no-var-requires */
import {RedisAdapter} from "@grammyjs/storage-redis";
import {UserFromGetMe} from "@grammyjs/types";
import consola from "consola";
import {Bot, session, webhookCallback} from "grammy";
import * as http from "http";
import config from "./config";
import {makeDb} from "./helpers/makeDb";
import $redis from "./helpers/makeRedis";
import ContextModel, {SessionStorageModel} from "./models/Context";

// Wrap all console out to consola
consola.wrapAll();

// Create new bot instance
export const bot = new Bot<ContextModel>(config.BOT_TOKEN);

// Set up sessions
bot.use(session({
  initial: (): SessionStorageModel => ({
    state: null,
    data: null
  }),
  storage: new RedisAdapter({instance: $redis})
}));

// Main handlers
bot.command("start", require("./handlers/onStart").default);
bot.callbackQuery("confirmAuth", require("./handlers/onConfirm").default);
bot.callbackQuery("declineAuth", require("./handlers/onDecline").default);

// Handle bot errors
bot.catch((error) => {
  const $error = error.error;

  consola.error($error);

  try {
    error.ctx.session.state = null;
    error.ctx.session.data = null;
  }
  catch { /* empty */ }
  return error.ctx.reply(`
    ❌ <b>An error occured during processing your message</b>:

    <code>${error.message}</code>

    Send this message to bot maintainers to solve this problem
  `.replace(/^ +/gm, ""), {
    parse_mode: "HTML"
  });
});

// Init a bot
let botInfo: UserFromGetMe;
const botLaunchedCallback = () => {
  consola.ready(`Bot launched via ${config.WEBHOOK.isEnabled ?
    "webhook" :
    `long polling`}. https://t.me/${botInfo.username}`);
};
Promise.resolve()
  .then(() => makeDb())
  .then(() => bot.api.getMe().then((me) => botInfo = me))
  .then<boolean|void>(() => {

    // Webhook to get updates
    if(config.WEBHOOK.isEnabled) {
      http
        .createServer(webhookCallback(bot, "http"))
        .listen(config.WEBHOOK.PORT, config.WEBHOOK.HOST, botLaunchedCallback);

      return bot.api.setWebhook(config.WEBHOOK.ENDPOINT, {
        drop_pending_updates: true
      });
    }

    // Long polling to get updates
    else {
      return Promise.resolve()
        .then(() => bot.api.setWebhook(""))
        .then(() => bot.start({
          drop_pending_updates: true,
          onStart: botLaunchedCallback
        }));
    }
  });
