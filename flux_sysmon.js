const { EmbedBuilder, WebhookClient } = require('discord.js');
const shell = require('shelljs');
const fs = require('fs');
const webhookClient = new WebhookClient({ url: 'URL' });

var disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`,{ silent: true }).stdout;
var disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`,{ silent: true }).stdout;

const embed = new EmbedBuilder()
    .setTitle('Disk Usage Report')
    .setColor(0x00FFFF)
    .addFields({ name: 'Disk Usage', value: `${disku_per} of ${disku_max}`, inline: true });

webhookClient.send({
	content: 'Flux Node System Report',
	username: 'USER',
	avatarURL: 'https://i.imgur.com/AfFp7pu.png',
	embeds: [embed],
});