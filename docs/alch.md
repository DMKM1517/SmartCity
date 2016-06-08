# Alchemy API
AlchemyAPI is a company that uses machine learning (specifically, deep learning) to do natural language processing (specifically, semantic text analysis, including sentiment analysis) and computer vision (specifically, face detection and recognition) for its clients both over the cloud and on-premises.As of February 2014, it claims to have clients in 36 countries and process over 3 billion documents a month. ProgrammableWeb added AlchemyAPI to its API Billionaires Club in September 2011.

Register for an Alchey API key [here](http://www.alchemyapi.com/api/register.html).

The folder `alchemyapi_python` is **only** present in the AWS server. Currently we can make 1500 API calls per day. 
API keys should be updated `api_key.txt` which can be found under `alchemyapi_python` folder.
The script in `score.py` scores all tweets by making calls to Alchemy API and stores the score into the database.
A cron job calls `score.py` every day at `00:00` hrs which can be updated/modified by editing `crontab`.
Logs can be found in the home folder in the file `cron.log`. 
