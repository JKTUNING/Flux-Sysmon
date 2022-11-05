const { EmbedBuilder, WebhookClient } = require('discord.js');
const shell = require('shelljs');
const fs = require('fs');
const webhookClient = new WebhookClient({ url: 'URL' });

var disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`,{ silent: true }).stdout.trim();
var disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`,{ silent: true }).stdout.trim();
var Hostname = shell.exec(`hostname`,{ silent: true }).stdout.trim();
var memTotal = shell.exec(`cat /proc/meminfo | grep MemTotal | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `,{ silent: true}).stdout.trim();
var memAvailable = shell.exec(`cat /proc/meminfo | grep MemAvailable | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `,{ silent: true}).stdout.trim();

var memPercent = Math.floor((memTotal/(memTotal-memAvailable) - 1) * 100);

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


//nvm install 16
//npm install pm2@latest -g