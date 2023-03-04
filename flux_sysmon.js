const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookURL, userID, summaryOnly, appOwner } = require('./config.json');
const axios = require('axios');
const shell = require('shelljs');
var cron = require('node-cron');
const webhookClient = new WebhookClient({ url: webhookURL });

var Hostname="";
var disku_max="";
var disku_per="";
var diskPercent="";
var memTotal="";
var memAvailable ="";
var memPercent="";

var ownerAppData = [];

async function getGlobalApps() {
	try {
	  const response = await axios.get('https://api.runonflux.io/apps/globalappsspecifications');
	  const apps = response.data.data;
	  apps.forEach((app) => {		
		if (app?.owner == appOwner) {
			ownerAppData.push(app);
		}
	  });
	  return ownerAppData;
	} catch (error) {
	  log.error(error);
	  return [];
	}
}

async function getCurrentBlockHeight() {
	try {
	  const response = await axios.get('https://api.runonflux.io/daemon/getinfo');
	  cachedHeight = response.data?.data?.blocks;
	  return cachedHeight;
	} catch (error) {
	  log.error(error);
	  return 0;
	}
}

async function NotifyExpiringApps(){
	const myApps = await getGlobalApps();
	const height = await getCurrentBlockHeight();

	if (height > 0) {
		myApps.forEach((checkApp) => {
			let appNotify = false;
			let message = "";
			let expireHeight = 0;
			if (checkApp.expire) {
				expireHeight = checkApp.height + checkApp.expire
			} else {
				return
			}
	
			if (expireHeight < height + 3600 && expireHeight > height + 2880) {
				appNotify = true;
				message="expiring in less than 5 days";
			}
			else if(expireHeight < height + 2160 && expireHeight > height + 1440){
				appNotify = true;
				message="expiring in less than 3 days";
			}
			else if(expireHeight < height + 1440 && expireHeight > height + 720){
				appNotify = true;
				message="expiring in less than 2 days";
			}
			else if(expireHeight < height + 720 && expireHeight > height){
				appNotify = true;
				message="expiring within 24 hours!";
			}
			else if(height > expireHeight){
				appNotify = true;
				message="expired!";
			}
	
			if (appNotify) {
				console.log(`${checkApp.name} ${message}`);
				const embed = new EmbedBuilder()
				.setTitle(`App ${message}`)
				.setColor(0xff0000)
				.addFields({ name: `App`, value: `${checkApp.name}` })
				.addFields({ name: `Expire Height:`, value: `${expireHeight}` });
	
				webhookClient.send({
						username: `FluxNode`,
						avatarURL: `https://i.imgur.com/AfFp7pu.png`,
						embeds: [embed]
				});
			}	
		});
	}	
}

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
	console.log(`#########################################`);
});

// Daily Machine Usage Every day at 4:59pm
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

// Every day at 8:07pm
cron.schedule('7 20 * * *', () => {
	if (appOwner != "" || appOwner != null) {
		NotifyExpiringApps();
	}	
});

//nvm install 16
//npm install pm2@latest -g