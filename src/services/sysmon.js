import shell from "shelljs";
import { EmbedBuilder } from "discord.js";
import { discordSendEmbed, discordNotify } from "./discord.js";
import config from "../config/config.js";

let { blockedApps, summaryOnly } = config;

try {
  if (blockedApps.length) {
    blockedApps = blockedApps.filter((item) => item.length >= 4);
    console.log(`Blocked Repos: ${blockedApps}`);
  } else {
    console.log(`no blocked apps found in config ...`);
  }
} catch (error) {
  console.log(`no blocked apps found in config ...`);
  blockedApps = [];
}

let Hostname = "Default";
let disku_max = "0";
let disku_per = "0";
let diskPercent = "0";
let memTotal = "1";
let memAvailable = "0";
let memPercent = "0";
let numRemoved = "0";
let embed;

/**
 * Gathers system details such as hostname, disk usage, and memory usage.
 *
 * @throws {Error} If there is an error while retrieving the system details.
 * @returns {Promise<void>} - A promise that resolves after gathering the system details.
 */
async function gatherSystemDetails() {
  Hostname = shell.exec(`hostname`, { silent: true }).stdout.trim();

  disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`, { silent: true }).stdout.trim();
  disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`, { silent: true }).stdout.trim();
  diskPercent = Math.floor(disku_per.replace("%", ""));

  memTotal = shell.exec(`cat /proc/meminfo | grep MemTotal | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `, { silent: true }).stdout.trim();
  memAvailable = shell.exec(`cat /proc/meminfo | grep MemAvailable | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `, { silent: true }).stdout.trim();
  memPercent = Math.floor(((memTotal - memAvailable) / memTotal) * 100);
}

/**
 * Checks system details such as disk usage and memory usage, and sends a Discord notification if thresholds are exceeded.
 *
 * @throws {Error} If there is an error while checking the system details or sending the Discord notification.
 * @returns {Promise<void>} - A promise that resolves after checking the system and sending the notification (if applicable).
 */
async function checkSystem() {
  try {
    await gatherSystemDetails();
    console.log(`USAGE OF /: ${disku_per} of ${disku_max}`);
    console.log(`MEMORY USED : ${memPercent}%`);

    if ((diskPercent > 90 || memPercent > 90) && discordNotify) {
      embed = new EmbedBuilder()
        .setTitle(`Disk Usage Report`)
        .setColor(0xff0000)
        .addFields({ name: `Host`, value: `${Hostname}` })
        .addFields({ name: `Usage of /:`, value: `${disku_per} of ${disku_max}` })
        .addFields({ name: `MEMORY USED :`, value: `${memPercent}%` })
        .addFields({ name: `MEMORY TOTAL:`, value: `${memTotal}` })
        .addFields({ name: `MEMORY AVAILABLE:`, value: `${memAvailable}` });

      await discordSendEmbed(embed);
    }

    await checkBlockedApps();
    console.log(`#########################################`);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Checks for blocked apps and stops their corresponding Docker containers.
 *
 * @throws {Error} If there is an error while checking blocked apps or stopping Docker containers.
 * @returns {Promise<void>} - A promise that resolves after checking blocked apps and stopping containers.
 */
async function checkBlockedApps() {
  try {
    if (blockedApps.length > 0) {
      var checkPawns = shell.exec("docker ps", { silent: true }).stdout.trim();
      let appContainerID;
      blockedApps.some((item) => {
        if (checkPawns.includes(item)) {
          console.log(`Found blocked repo: ${item}`);
          appContainerID = shell.exec(`docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Names}}" | grep -E "${item}" | awk '{print $3}'`, { silent: true }).stdout.trim();
          console.log(appContainerID);
          shell.exec(`docker stop ${appContainerID}`, { silent: true });
          shell.exec(`docker rm $(docker ps --filter=status=exited --filter=status=dead -q)`, { silent: true });

          // only send indivudual pings if summaryOnly is off
          if (summaryOnly != 1) {
            embed = new EmbedBuilder()
              .setTitle(`REMOVING BLOCKED APP`)
              .setColor(0xff0000)
              .addFields({ name: `Host`, value: `${Hostname}` })
              .addFields({ name: `IMAGE KILLED`, value: `${item}` })
              .addFields({ name: `APP NAME`, value: `${appContainerID}` });

            discordSendEmbed(embed);
          }
          numRemoved++;
          return true; // Stop iterating further
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Creates a discord embed and sends message to discord
 */
async function sendDailyUpdate() {
  try {
    await gatherSystemDetails();
    embed = new EmbedBuilder()
      .setTitle(`Daily Machine Usage Report`)
      .setColor(0xff0000)
      .addFields({ name: `Host`, value: `${Hostname}` })
      .addFields({ name: `Usage of /:`, value: `${disku_per} of ${disku_max}` })
      .addFields({ name: `MEMORY USED :`, value: `${memPercent}%` })
      .addFields({ name: `MEMORY TOTAL:`, value: `${memTotal}` })
      .addFields({ name: `MEMORY AVAILABLE:`, value: `${memAvailable}` })
      .addFields({ name: `BLOCKED APPS REMOVED`, value: `${numRemoved}` });

    numRemoved = "0";
  } catch (error) {
    console.log(error);
    numRemoved = "0";
    return;
  }

  await discordSendEmbed(embed);
}

export { checkSystem, checkBlockedApps, sendDailyUpdate, numRemoved };
