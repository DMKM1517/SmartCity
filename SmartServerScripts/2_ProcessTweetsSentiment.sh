#!/bin/bash

#Move to the scripts folder
cd "${0%/*}"

echo "####################################################################################################" >> 2_ProcessTweetsSentiment.log 2>&1

#Start Scoring Tweets BOW
now=$(date)
echo "Starting Scoring Tweets BOW: $now"
echo "Starting Scoring Tweets BOW: $now" >> 2_ProcessTweetsSentiment.log 2>&1

# Score Tweets BOW
Rscript ../SentimentAnalysisR/Sentiment_Analysis.R >> 2_ProcessTweetsSentiment.log 2>&1

#End Scoring Tweets BOW
now=$(date)
echo "End Scoring Tweets BOW: $now"
echo "End Scoring Tweets BOW: $now" >> 2_ProcessTweetsSentiment.log 2>&1 


echo "####################################################################################################" >> 2_ProcessTweetsSentiment.log 2>&1

#Start Scoring Tweets Python
now=$(date)
echo "Starting Scoring Tweets Python: $now"
echo "Starting Scoring Tweets Python: $now" >> 2_ProcessTweetsSentiment.log 2>&1

# Score Tweets Python
python ../DataScienceNotebooks/ScoreData.py >> 2_ProcessTweetsSentiment.log 2>&1

#End Scoring Tweets Python
now=$(date)
echo "End Scoring Tweets Python: $now"
echo "End Scoring Tweets Python: $now" >> 2_ProcessTweetsSentiment.log 2>&1

echo "####################################################################################################" >> 2_ProcessTweetsSentiment.log 2>&1
