import {Middleware} from "grammy";

const handler: Middleware = async(ctx) => {
  await ctx.deleteMessage();
  await ctx.answerCallbackQuery("Authentication declined");
};

export default handler;
