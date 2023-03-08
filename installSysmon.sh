#!/bin/bash

if ! [[ -f config.json ]]; then
    touch config.json
    userWebHook=$(whiptail --inputbox "Enter your Discord Webhook URL" 8 60 3>&1 1>&2 2>&3)
    userNick=$(whiptail --inputbox "Enter your Discord USER ID" 8 60 3>&1 1>&2 2>&3)
    summaryOnly=$(whiptail --inputbox "Send only summary notifications? Enter: (0/1)" 8 60 3>&1 1>&2 2>&3)
    appOwner=$(whiptail --inputbox "Enter ZelID for app monitoring (blank to skip)" 8 60 3>&1 1>&2 2>&3)

    cat > config.json <<EOF
{
  "webhookURL" : "$userWebHook",
  "userID" : "$userNick",
  "summaryOnly" : "$summaryOnly",
  "appOwner" : "$appOwner"
}
EOF
else
    echo -e "config file found - not entry needed"
fi

if [ ! -d "node_modules" ]; then
    echo -e "installing node modules ..."
    npm install
else
    echo -e "packages aleady exist .. npm install skipped"
fi

#check to see if flux_sysmon is already running and stop/delete it from pm2
if [[ $(pm2 info flux_sysmon 2>&1 | grep status) != "" ]]; then 
    echo -e "sysmon already running ... stopping and deleting sysmon from pm2"
    pm2 reload flux_sysmon --watch
else
    echo -e "sysmon not already running ... starting sysmon service"
    pm2 start flux_sysmon.js --watch
    sleep 2
    pm2 save
fi