const config = {
  webhookURL: "<yourDiscordWebHook>",
  userID: "<yourDiscorduserID",
  summaryOnly: "<DailySummary>", // Either 0 or 1
  appOwner: "<zelID>", // zelid you want to monitor for expiring apps
  blockedApps: ["monestry", "go-socks5-proxy", "fabreeze"], // lis of blocked repositories
};

export default config;
