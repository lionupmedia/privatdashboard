export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const cron = (await import("node-cron")).default;
  const { runReminders } = await import("./lib/reminders");
  cron.schedule("0 8 * * *", () => {
    runReminders().catch((e) => console.error("[reminders]", e));
  });
}
