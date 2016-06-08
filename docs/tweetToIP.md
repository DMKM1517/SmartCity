# Relate Tweets to Interest Points

In order to relate Tweets with each Interest Point a the script `TweetsToIP.R` is excecuted in the following cronjob: [3_ConnectTweetsWithIP.sh](https://github.com/DMKM1517/SmartCity/blob/master/SmartServerScripts/3_ConnectTweetsWithIP.sh)

## Methodology
The objective is to compare the text of each tweet with the keywords assign to each Interest Point in order to assign tweets to their respective Interest Point.

## Create and Assign Keywords
The scripts makes a SQL scan on the table of Interest Points, `ip.interest_points`, and compares if there is any new existing instance. If there exists new Interest Points, or it is the first time the script is run, then it creates and assign a set of keywords for each record, storing them in the table `ip_id.keywords`.
To create a keywords, the interest points followed this process:

- Remove Punctuation
- Lowercase
- Remove stopwords (English or French)

## Relate Keywords to Tweets
The Tweets are retrieved from table `twitter.tweets` by selecting specifically the ones which have not been processed. Then they go through the same preprocessing steps as the Interest Points, then each set of keywords of the Interest Points is compared with the text of the tweet in order to determine a containing proportion of kewyords in the tweet.
In this way the table `twitter.tweets_to_ip` is updated.

After updating, the tweets are stored in a table `twitter.processed_tweets` to mark as processed.
