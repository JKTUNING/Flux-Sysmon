import cron from "node-cron";
import config from "./config/config.js";
import { notifyExpiringApps } from "./services/apps.js";
import { checkSystem, sendDailyUpdate } from "./services/sysmon.js";
import { discordNotify } from "./services/discord.js";

const { appOwner } = config;

// Checks system details and blocked apps every 2 mins
cron.schedule("*/2 * * * *", () => {
  console.log("Checking system ...");
  checkSystem();
});

// Daily machine usage every day at 4:59PM
//cron.schedule("59 16 * * *", () => {
cron.schedule("59 16 * * *", () => {
  if (discordNotify) {
    console.log("Sending daily updates ...");
    sendDailyUpdate();
  }
});

// Checks for expiring apps every day at 12:07pm
//cron.schedule("7 12 * * *", () => {
cron.schedule("7 12 * * *", () => {
  if (appOwner) {
    console.log("Checking for expiring apps ...");
    notifyExpiringApps();
  }
});
