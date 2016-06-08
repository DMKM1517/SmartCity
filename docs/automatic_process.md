# Automated Information Process

In order to automate the processes of the different modules, a set of scripts have been automated on the server to run at specific moments. These scripts and how are they automated will be described bellow.

## Bash Scripts
The following scripts (can be found in `SmartCity\SmartServerScripts`) were created to automate the tasks of the different operations of the application:

 - `0_RestartWebServer.sh`:  This script restarts (or starts if it hasn't been initialized) the web server of the application. Since this process runs continuously it has to be started only once (only if the server restarts).
 - `0_StartTweetRetreiving.sh`: This script starts the automatic process of recollecting tweets. Since this process runs continuously it has to be started only once (only if the server restarts).
 - `1_RetreiveFromSources.sh`:  This script has the responsibility of running the different Python scripts from the module in charge of retrieval of the sources.
 - `2_ProcessTweetsSentiment.sh`:  This script launches the processes for evaluating the sentiment of the tweets.
 - `3_ConnectTweetsWithIP.sh`:  This script launches the process of connecting tweets to IPs.
 - `4_UpdateDataWarehouse.sh`:  This script launches the process of updating the data warehouse of the application.

## Automation

The scripts were automated in the server using [`cron`](http://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html). The following is the configuration used to run them.

    ############################################################
    ############# Smart City CronSchedule ######################
    
    # 1 Retreive from Sources (runs at 10:30, 14:30 and 18) 
    30  10  *  *  *  bash ~/SmartCity/SmartServerScripts/1_RetreiveFromSources.sh
    30  14  *  *  *  bash ~/SmartCity/SmartServerScripts/1_RetreiveFromSources.sh
    0  18  *  *  *  bash ~/SmartCity/SmartServerScripts/1_RetreiveFromSources.sh
    
    # 2 Process Tweets Sentiment (Every 30 mins)
    */30 * * * * bash ~/SmartCity/SmartServerScripts/2_ProcessTweetsSentiment.sh
    
    # 3 Connect Tweets With IP (Every 15 mins)
    */15 * * * * bash ~/SmartCity/SmartServerScripts/3_ConnectTweetsWithIP.sh
    
    # 4 Update Data Warehouse (runs at 11:30, 15:30 and 19)
    30  11  *  *  *  bash ~/SmartCity/SmartServerScripts/4_UpdateDataWarehouse.sh
    30  15  *  *  *  bash ~/SmartCity/SmartServerScripts/4_UpdateDataWarehouse.sh
    0  19  *  *  *  bash ~/SmartCity/SmartServerScripts/4_UpdateDataWarehouse.sh

