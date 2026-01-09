export async function safeEditOrReply(ctx, text, keyboard) {
  try {
    return await ctx.editMessageText(text, keyboard);
  } catch {
    return await ctx.reply(text, keyboard);
  }
}
