// noinspection ExceptionCaughtLocallyJS

import axios from "axios";
import * as fs from "fs";
import {CommandMiddleware, InlineKeyboard} from "grammy";
import {ObjectId} from "mongodb";
import * as path from "path";
import config from "../config";
import {$db} from "../helpers/makeDb";
import ContextModel from "../models/Context";
import UserModel from "../models/User";

const onStart: CommandMiddleware<ContextModel> = async(ctx) => {

  /* Get payload info */

  const payload = ctx.message?.text.replace("/start ", "");
  if(!payload) {
    return ctx.reply((`
      Hi ${ctx.from?.first_name}!
      
      Go to auth.hoolie.org for more info
    `).replace(/^ +/gm, ""), {
      parse_mode: "HTML"
    });
  }

  const [appId, socketId] = atob(payload).split(":");
  if(!ObjectId.isValid(appId)) {
    return ctx.reply("❌ App not found");
  }

  // Get user info
  const userInfo = await ctx.getChat();
  if(userInfo.type !== "private" || !userInfo.photo) {
    throw new Error("Cant parse user data");
  }

  // Get app info
  const app = await $db.apps.findOne({_id: new ObjectId(appId)});
  if(!app) {
    return ctx.reply("❌ App not found");
  }

  // Update user info
  const dbResult = await $db.users.findOneAndUpdate({
    "telegramId": userInfo.id
  }, {
    $set: {
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      lastUpdatedAt: new Date(),
    } as UserModel
  }, {
    upsert: true,
    returnDocument: "after"
  });

  // Update context
  ctx.session.state = null;
  ctx.session.data = {
    app: JSON.stringify(app),
    socketId,
    userId: String(dbResult.value?._id)
  };

  // Save user avatar
  const fileUrl = await ctx.api.getFile(userInfo.photo.big_file_id);
  const avatar = await axios.get(`https://api.telegram.org/file/bot${config.BOT_TOKEN}/${fileUrl.file_path}`, {
    responseType: "stream"
  });
  avatar.data.pipe(fs.createWriteStream(path.join(config.AVATARS_DIRECTORY, `${userInfo.id}.jpg`)));

  // Confirm auth
  return ctx.reply((`
    Hi ${userInfo.first_name}!
    
    App <b>${app.url}</b> requires to authenticate you.
    
    The app will have access to your:
    
    - Telegram first and last names;
    - Telegram avatar;
    - Telegram ID
    
    Do you confirm that authentication?
  `).replace(/^ +/gm, ""), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text("✅ Yes", "confirmAuth").text("❌ No", "declineAuth")
  });
};

export default onStart;
