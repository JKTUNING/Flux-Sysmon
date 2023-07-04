# Flux-Sysmon

```Requires config.js file with webhookurl and userID```
```
const config = {
  webhookURL: "<yourWebhook>",
  userID: "<yourID>",
  summaryOnly: "(0/1)",
  appOwner: "yourZelID",
  blockedApps: ["repo1", "repo2", "etc"],
};

export default config;
```
## Auto generate config and start the service
```helpers/installSysmon.sh```

If running the installSysmon script, you don't need to run the following 2 commands as they are done automatically after the config generation.

## To install the packages you need to run this inside the Flux-Sysmon Folder
```npm install```

## To run the flux-sysmon service you can use PM2
This will run the code every 15 mins and ping discord webhook if disk usage is > 90% or memory usage is > 90%

If appOwner is defined in the config.js file then it will also check for any apps that are close to expiring for that owner.

If blockedApps is defined in the config.js file then it will check for blocked repositories and remove them from running containers.

If summaryOnly is 1 then it will only send 1 discord notification per day with system stats and number of blocked apps removed.

```pm2 start src/flux_sysmon.js --watch```

## Requirements
```
Node version 16.9
Discord.js version 14.5
```
