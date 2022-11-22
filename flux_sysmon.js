const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookURL, userID, watchDog } = require('./config.json');
const shell = require('shelljs');
const fs = require('fs');
var cron = require('node-cron');
const webhookClient = new WebhookClient({ url: webhookURL });

var Hostname="";
var disku_max="";
var disku_per="";
var diskPercent="";
var memTotal="";
var memAvailable ="";
var memPercent="";

cron.schedule('*/15 * * * *', () => {

	Hostname = shell.exec(`hostname`,{ silent: true }).stdout.trim();

	disku_max = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f2 -d" "`,{ silent: true }).stdout.trim();
	disku_per = shell.exec(`df -Hl / | grep -v File | tr -s ' '|cut -f5 -d" "`,{ silent: true }).stdout.trim();
	diskPercent = Math.floor(disku_per.replace('%', ''));

	memTotal = shell.exec(`cat /proc/meminfo | grep MemTotal | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `,{ silent: true}).stdout.trim();
	memAvailable = shell.exec(`cat /proc/meminfo | grep MemAvailable | awk -F ':' '{print $2}' | awk -F ' kB' '{print $1}' `,{ silent: true}).stdout.trim();
	memPercent = Math.floor(((memTotal-memAvailable) / memTotal) * 100);

	console.log(`USAGE OF /: ${disku_per} of ${disku_max}`);
	console.log(`MEMORY USED : ${memPercent}%`);
	

	if ( diskPercent > 90 || memPercent > 90 ) {
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
			embeds: [embed]
		});
	}

	var checkMonestry = shell.exec(`docker ps | grep monestry | awk '{print $1}'`,{ silent: true }).stdout.trim();
	if ( checkMonestry != "" ) {
		console.log(`MONESTRY IMAGE FOUND ${checkMonestry}`);
		shell.exec(`docker stop ${checkMonestry}`,{ silent: true });
		shell.exec(`docker rm $(docker ps --filter=status=exited --filter=status=dead -q)`,{ silent: true });
		//shell.exec(`docker rmi $(docker images --filter dangling=true -q)`,{ silent: true });

		const embed = new EmbedBuilder()
		.setTitle(`REMOVING MONESTRY`)
		.setColor(0xff0000)
		.addFields({ name: `Host`, value: `${Hostname}` })
		.addFields({ name: `IMAGE KILLED`, value: `${checkMonestry}` });

		webhookClient.send({
			username: `FluxNode`,
			avatarURL: `https://i.imgur.com/AfFp7pu.png`,
			embeds: [embed]
		});
	} else {
		console.log(`MONESTRY IMAGE NOT FOUND`);
	}
	console.log(`#########################################`);
});

// Daily Machine Usage Every day at noon
cron.schedule('59 16 * * *', () => {

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
			embeds: [embed]
		});
});
//nvm install 16
//npm install pm2@latest -g