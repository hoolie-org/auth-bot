// noinspection ExceptionCaughtLocallyJS

import axios from "axios";
import * as fs from "fs";
import {CommandMiddleware, InlineKeyboard} from "grammy";
import * as path from "path";
import config from "../config";
import {$db} from "../helpers/makeDb";
import ContextModel from "../models/Context";
import UserModel from "../models/User";

const onStart: CommandMiddleware<ContextModel> = async(ctx) => {

  // eslint-disable-next-line
  let payload: any;

  try {
    payload = JSON.parse(ctx.message?.text.replace("/start ", "") ?? "");

    if(
      typeof payload.appUrl !== "string"
      ||
      typeof payload.socketId !== "string"
      ||
      typeof payload.appBackendEndpoint !== "string"
    ) {
      throw new Error("Can't parse payload");
    }
  }
  catch {
    return ctx.reply("❌ Can't parse payload");
  }

  // Get user info
  const userInfo = await ctx.getChat();
  if(userInfo.type !== "private" || !userInfo.photo) {
    throw new Error("Cant parse user data");
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
    upsert: true
  });

  // Update context
  ctx.session.state = null;
  ctx.session.data = {
    payload: {
      ...payload,
      userId: String(dbResult.value?._id)
    }
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
    
    App <b>${payload.appUrl}</b> requires to authenticate you.
    
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
