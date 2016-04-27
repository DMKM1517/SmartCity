#!/bin/bash

#Move to the scripts folder
cd "${0%/*}"


echo "####################################################################################################" >> 2_ProcessTweetsSentiment.log 2>&1

#Start Scoring Tweets
now=$(date)
echo "Starting Scoring Tweets: $now"
echo "Starting Scoring Tweets: $now" >> 2_ProcessTweetsSentiment.log 2>&1

# Score Tweets
python ../DataScienceNotebooks/ScoreData.py >> 2_ProcessTweetsSentiment.log 2>&1

#End Scoring Tweets
now=$(date)
echo "End Scoring Tweets: $now"
echo "End Scoring Tweets: $now" >> 2_ProcessTweetsSentiment.log 2>&1

echo "####################################################################################################" >> 2_ProcessTweetsSentiment.log 2>&1
