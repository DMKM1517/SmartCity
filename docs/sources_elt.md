# Retreival From Sources - ELT

The module for retrieving the source data from the available sources has been developed mainly using [Python](https://www.python.org/) to connect to the sources and [Pentaho's Kettle](http://wiki.pentaho.com/display/ServerDoc2x/Kettle) to perform the synchronization process with the operational database. Below there is a description each of the sources used in the application.

## GrandLyon Open Data
For the application developed the [GrandLyon Open Data](http://data.grandlyon.com/), more specifically the [Touristic Interest Points](http://data.grandlyon.com/culture/point-dintfrft-touristique/) (Point d'intérêt touristique) available online, is exploited. With the given REST API, a simple python script (that can be found in `SmartCity\SmartSourceETL\GrandLyon.py`) was developed.

This script recollects the necessary information from the open data and then populates the table `landing.ip_interest_points`. After this a synchronization kettle job is performed by calling the job `ETL_Kettle_Editables\ETL_Smart_1_IP.ktr`, which checks what new information was retrieved (by performing a delta compare between the current information in the operational database and the information in the landing table), and inserts or updates if necessary.

## Yelp
Using the [Yelp Python library](https://github.com/Yelp/yelp-python), we search in Yelp for the interest points we already retrieved from the GrandLyon Open Data and bring the information of them when a match occurs. For this a simple python script (that can be found in `SmartCity\SmartSourceETL\Yelp.py`) was developed.

This script recollects the necessary information from Foursquare and then populates the table `landing.ip_yelp`. After this a synchronization kettle job is performed by calling the job `ETL_Kettle_Editables\ETL_Smart_2_Yelp.ktr`, which checks what new information was retrieved (by performing a delta compare between the current information in the operational database and the information in the landing table), and inserts or updates if necessary.

## Foursquare

By connecting to the [Foursquare REST API](https://developer.foursquare.com/), we search in Foursquare for the interest points we already retrieved from the GrandLyon Open Data and bring the information of them when a match occurs. For this a simple python script (that can be found in `SmartCity\SmartSourceETL\Foursquare.py`) was developed.

This script recollects the necessary information from Foursquare and then populates the table `landing.ip_foursquare`. After this a synchronization kettle job is performed by calling the job `ETL_Kettle_Editables\ETL_Smart_3_Foursquare.ktr`, which checks what new information was retrieved (by performing a delta compare between the current information in the operational database and the information in the landing table), and inserts or updates if necessary.


## Twitter

The Twitter data source was queried using a real time 24/7 ELT job using the [tweetpy](http://www.tweepy.org/) Python library. Credential secrets must be provided as a file called `config_secret.json` and with content: 

```
{
  "access_token" : "<token>",
  "access_token_secret" : "<secret>",
  "consumer_key" : "<key>",
  "consumer_secret" : "<secret>"
}
```
The script `EC2_tweet\tweetscollect.py` runs an event listener with the following keyword filter: 

```
    stream.filter(track=['lyon','villeurbanne','bron','priest','bellecour','fourviere','gerland','lyonnais','lyoneon','venissieux'])
```

You may need to change line 72 to include more or less keywords. The script writes to the table `twitter.tweets`. The script `EC2_tweet\tweetscollect.py` is monitored by PM2, in case of exception PM2 will restart the tweet collection and also will loadbalance the action listener to maximize tweet collection. It's sufficient to add this script to PM2 using: 

```
pm2 start EC2_tweet\tweetscollect.py --name tweets
```

in the root of the repository. 
