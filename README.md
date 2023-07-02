# Flux-Sysmon

```Requires config.js file with webhookurl and userID```
```
const config = {
  webhookURL: "<yourWebhook>",
  userID: "<yourID>",
  summaryOnly: "(0/1)",
  appOwner: "yourZelID",
};

export default config;
```
## To install the packages you need to run this inside the Flux-Sysmon Folder
```npm install```

## To run the flux-sysmon service you can use PM2
This will run the code every 15 mins and ping discord webhook if disk usage is > 90% or memory usage is > 90%

```pm2 start flux_sysmon.js --watch```

## Requirements
```
Node version 16.9
Discord.js version 14.5
```
