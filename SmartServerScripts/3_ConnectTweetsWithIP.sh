#!/bin/bash

#Move to the scripts folder
cd "${0%/*}"


echo "####################################################################################################" >> 3_ConnectTweetsWithIP.log 2>&1

#Start Connecting Tweets with IPs
now=$(date)
echo "Starting Connecting Tweets with IPs: $now"
echo "Starting Connecting Tweets with IPs: $now" >> 3_ConnectTweetsWithIP.log 2>&1

# Score Tweets
Rscript ../TweetsToIP/FM_Keywords_Tweets_to_IP_DT.R >> 3_ConnectTweetsWithIP.log 2>&1

#End Connecting Tweets with IPs
now=$(date)
echo "End Connecting Tweets with IPs: $now"
echo "End Connecting Tweets with IPs: $now" >> 3_ConnectTweetsWithIP.log 2>&1


echo "####################################################################################################" >> 3_ConnectTweetsWithIP.log 2>&1
