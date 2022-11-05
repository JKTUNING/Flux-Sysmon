const { EmbedBuilder, WebhookClient } = require('discord.js');
const shell = require('shelljs');
const fs = require('fs');
const webhookClient = new WebhookClient({ url: 'URL' });

var disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`,{ silent: true }).stdout.trim();
var disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`,{ silent: true }).stdout.trim();
var Hostname = shell.exec(`hostname`,{ silent: true }).stdout.trim();

const embed = new EmbedBuilder()
    .setTitle(`Disk Usage Report`)
    .setColor(0xff0000)
	.addFields({ name: `Hostname`, value: `${Hostname}`, inline: true })
    .addFields({ name: `Usage of /:`, value: `${disku_per} of ${disku_max}`, inline: true });

webhookClient.send({
	username: `FluxNode`,
	avatarURL: `https://i.imgur.com/AfFp7pu.png`,
	embeds: [embed],
});


//nvm install 16
//npm install pm2@latest -g