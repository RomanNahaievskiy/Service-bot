export async function safeEditOrReply(ctx, text, keyboard) {
  text = (text ?? "").toString();
  if (!text.trim()) text = "…";
  try {
    return await ctx.editMessageText(text, keyboard);
  } catch {
    return await ctx.reply(text, keyboard);
  }
}
