import { EmbedBuilder, WebhookClient } from "discord.js";
import axios from "axios";
import shell from "shelljs";
import cron from "node-cron";
import config from "./config.js";

const { webhookURL, userID, summaryOnly, appOwner } = config;

let Hostname = "";
let disku_max = "";
let disku_per = "";
let diskPercent = "";
let memTotal = "";
let memAvailable = "";
let memPercent = "";
var numRemoved = "0";
var appName = "";

let ownerAppData = [];
let discordNotify = true;

let webhookClient;

try {
  webhookClient = new WebhookClient({ url: webhookURL });
} catch (error) {
  discordNotify = false;
}

/**
 * Pulls current running application specs from Flux API
 * @returns {Promise<Array>} A promise that resolves to an array of apps owned by appOwner.
 * @error If an error occurs or no apps are found, an empty array is returned.
 */
async function getGlobalApps() {
  try {
    const response = await axios.get("https://api.runonflux.io/apps/globalappsspecifications");
    const apps = response.data.data;
    ownerAppData = apps.filter((app) => app?.owner === appOwner);
    return ownerAppData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

/**
 * 
 * @returns {Promise<number>} A promise that resolves to the current blockHeight of Flux network
 * @error If an error occurs then 0 is returned
 */
async function getCurrentBlockHeight() {
  try {
    const response = await axios.get("https://api.runonflux.io/daemon/getinfo");
    return response.data?.data?.blocks;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

/**
 * Notifies owner via webhook about expiring apps on Flux network
 * @returns {Promise<void>} A promise that resolves when the notification process is complete.
 */
async function NotifyExpiringApps() {
  const myApps = await getGlobalApps();
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
        return;
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

      if (appNotify && discordNotify) {
        console.log(`${checkApp.name} ${message}`);
        const embed = new EmbedBuilder()
          .setTitle(`App ${message}`)
          .setColor(0xff0000)
          .addFields({ name: `App`, value: `${checkApp.name}` })
          .addFields({ name: `Expire Height:`, value: `${expireHeight}` });

        setTimeout(() => {
          webhookClient.send({
            username: `FluxNode`,
            avatarURL: `https://i.imgur.com/AfFp7pu.png`,
            embeds: [embed],
          });
        }, 500);
      }
    };
  }
}

cron.schedule("*/2 * * * *", () => {
  Hostname = shell.exec(`hostname`, { silent: true }).stdout.trim();

  disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`, { silent: true }).stdout.trim();
  disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`, { silent: true }).stdout.trim();
  diskPercent = Math.floor(disku_per.replace("%", ""));

  memTotal = shell.exec(`cat /proc/meminfo | grep MemTotal | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `, { silent: true }).stdout.trim();
  memAvailable = shell.exec(`cat /proc/meminfo | grep MemAvailable | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `, { silent: true }).stdout.trim();
  memPercent = Math.floor(((memTotal - memAvailable) / memTotal) * 100);

  console.log(`USAGE OF /: ${disku_per} of ${disku_max}`);
  console.log(`MEMORY USED : ${memPercent}%`);

  if ((diskPercent > 90 || memPercent > 90) && discordNotify) {
    const embed = new EmbedBuilder()
      .setTitle(`Disk Usage Report`)
      .setColor(0xff0000)
      .addFields({ name: `Host`, value: `${Hostname}` })
      .addFields({ name: `Usage of /:`, value: `${disku_per} of ${disku_max}` })
      .addFields({ name: `MEMORY USED :`, value: `${memPercent}%` })
      .addFields({ name: `MEMORY TOTAL:`, value: `${memTotal}` })
      .addFields({ name: `MEMORY AVAILABLE:`, value: `${memAvailable}` });

    webhookClient.send({
      username: `FluxNode`,
      avatarURL: `https://i.imgur.com/AfFp7pu.png`,
      embeds: [embed],
    });
  }

  var checkPawns = shell.exec(`docker ps | grep -E 'monestry|go-socks5-proxy|fabreeze' | awk '{print $1}'`, { silent: true }).stdout.trim();
  if (checkPawns != "") {
    appName = shell.exec(`docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Names}}" | grep -E 'monestry|go-socks5-proxy|fabreeze' | awk '{print $3}'`, { silent: true }).stdout.trim();
    console.log(`PAWNS IMAGE FOUND ${checkPawns}`);
    console.log(`PAWN APP NAME ${appName}`);
    shell.exec(`docker stop ${checkPawns}`, { silent: true });
    shell.exec(`docker rm $(docker ps --filter=status=exited --filter=status=dead -q)`, { silent: true });
    //shell.exec(`docker rmi $(docker images --filter dangling=true -q)`,{ silent: true });

    // only send indivudual pings if summaryOnly is off
    if (summaryOnly != 1) {
      const embed = new EmbedBuilder()
        .setTitle(`REMOVING PAWNS APP`)
        .setColor(0xff0000)
        .addFields({ name: `Host`, value: `${Hostname}` })
        .addFields({ name: `IMAGE KILLED`, value: `${checkPawns}` })
        .addFields({ name: `APP NAME`, value: `${appName}` });

      webhookClient.send({
        username: `FluxNode`,
        avatarURL: `https://i.imgur.com/AfFp7pu.png`,
        embeds: [embed],
      });
    }
    numRemoved++;
  } else {
    console.log(`PAWNS IMAGE NOT FOUND`);
  }
  console.log(`#########################################`);
});

// Daily Machine Usage Every day at noon
cron.schedule("59 16 * * *", () => {
  if (discordNotify) {
    const embed = new EmbedBuilder()
      .setTitle(`Daily Machine Usage Report`)
      .setColor(0xff0000)
      .addFields({ name: `Host`, value: `${Hostname}` })
      .addFields({ name: `Usage of /:`, value: `${disku_per} of ${disku_max}` })
      .addFields({ name: `MEMORY USED :`, value: `${memPercent}%` })
      .addFields({ name: `MEMORY TOTAL:`, value: `${memTotal}` })
      .addFields({ name: `MEMORY AVAILABLE:`, value: `${memAvailable}` });

    webhookClient.send({
      username: `FluxNode`,
      avatarURL: `https://i.imgur.com/AfFp7pu.png`,
      embeds: [embed],
    });
  }
  numRemoved = "0";
});
