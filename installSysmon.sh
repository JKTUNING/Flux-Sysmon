#!/bin/bash

#switch to dev branch
#git checkout dev


if ! [[ -f config.json ]]; then
    sudo touch config.json
    userWebHook=$(whiptail --inputbox "Enter your Discord Webhook URL" 8 60 3>&1 1>&2 2>&3)
    userNick=$(whiptail --inputbox "Enter your Discord USER ID" 8 60 3>&1 1>&2 2>&3)
sudo bash -c cat > config.json <<EOF
{
  "webhookURL" : "$userWebHook",
  "userID" : "$userNick"
}
EOF
else
    echo -e "config file found - not entry needed"
fi

#npm install

#pm2 start flux_sysmon.js --watch