import { getGlobalApps, getCurrentBlockHeight } from "../utils/functions.js";
import { EmbedBuilder } from "discord.js";
import { discordNotify, discordSendEmbed } from "./discord.js";
import config from "../config/config.js";
const { appOwner } = config;

try {
  if (appOwner) {
    console.log(`App Owner: ${appOwner}`);
  } else {
    console.log("no app owner found in config");
  }
} catch (error) {
  console.log("no app owner found in config");
}

/**
 * Notifies owner via webhook about expiring apps on Flux network
 * @returns {Promise<void>} A promise that resolves when the notification process is complete.
 */
async function notifyExpiringApps() {
  const myApps = await getGlobalApps(appOwner);
  const height = await getCurrentBlockHeight();
  let appNotify = false;
  let message = "";
  let expireHeight = 0;

  if (height > 0) {
    for (const checkApp of myApps) {
      appNotify = false;
      message = "";
      expireHeight = 0;

      if (checkApp.expire) {
        expireHeight = checkApp.height + checkApp.expire;
      } else {
        expireHeight = checkApp.height + 22000;
      }

      if (expireHeight < height + 3600 && expireHeight > height + 2880) {
        appNotify = true;
        message = "expiring in less than 5 days";
      } else if (expireHeight < height + 2160 && expireHeight > height + 1440) {
        appNotify = true;
        message = "expiring in less than 3 days";
      } else if (expireHeight < height + 1440 && expireHeight > height + 720) {
        appNotify = true;
        message = "expiring in less than 2 days";
      } else if (expireHeight < height + 720 && expireHeight > height) {
        appNotify = true;
        message = "expiring within 24 hours!";
      } else if (height > expireHeight) {
        appNotify = true;
        message = "expired!";
      }

      if (appNotify) console.log(`${checkApp.name} ${message}`);
      if (discordNotify && appNotify) {
        const embed = new EmbedBuilder()
          .setTitle(`App ${message}`)
          .setColor(0xff0000)
          .addFields({ name: `App`, value: `${checkApp.name}` })
          .addFields({ name: `Expire Height:`, value: `${expireHeight}` });

        await discordSendEmbed(embed);
      }
    }
  }
}

export { notifyExpiringApps };
