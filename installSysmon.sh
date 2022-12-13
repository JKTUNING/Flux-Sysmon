#!/bin/bash

if ! [[ -f config.json ]]; then
    touch config.json
    userWebHook=$(whiptail --inputbox "Enter your Discord Webhook URL" 8 60 3>&1 1>&2 2>&3)
    userNick=$(whiptail --inputbox "Enter your Discord USER ID" 8 60 3>&1 1>&2 2>&3)
    summaryOnly=$(whiptail --inputbox "Send only summary notifications? Enter: (0/1)" 3>&1 1>&2 2>&3)
    cat > config.json <<EOF
{
  "webhookURL" : "$userWebHook",
  "userID" : "$userNick",
  "summaryOnly" : "$summaryOnly"
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
    pm2 stop flux_sysmon
    sleep 1
    pm2 delete flux_sysmon
    sleep 1
fi

pm2 start flux_sysmon.js --watch
sleep 2
pm2 save