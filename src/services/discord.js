import { WebhookClient } from "discord.js";
import config from "../config/config.js";
const { webhookURL } = config;
let discordClient;
let discordNotify = true;

try {
  discordClient = new WebhookClient({ url: webhookURL });
  console.log(`Discord Webhook: ${webhookURL}`);
} catch (error) {
  console.log("no valid webhook url - discord notifications disabled");
  discordNotify = false;
}

/**
 * Sends an embed message to Discord using the configured Discord client.
 * The message is delayed by 500 milliseconds using setTimeout.
 * @param {object} embed - The embed object to send. It should follow the Discord Embed structure.
 * @throws {Error} If there is an error while sending the message.
 * @returns {Promise<void>} - A promise that resolves after the message is sent.
 */
async function discordSendEmbed(embed) {
  setTimeout(() => {
    try {
      if (discordClient && discordNotify) {
        discordClient.send({
          username: `FluxNode`,
          avatarURL: `https://i.imgur.com/AfFp7pu.png`,
          embeds: [embed],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, 500);
}

export { discordSendEmbed, discordNotify, discordClient };
