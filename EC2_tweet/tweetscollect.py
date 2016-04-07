
# coding: utf-8

# In[1]:

from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream


# In[2]:

import io 
import json
with io.open('config_secret.json') as cred:   
    creds = json.load(cred)
    #Variables that contains the user credentials to access Twitter API 
    access_token = creds['access_token']
    access_token_secret = creds['access_token_secret']
    consumer_key = creds['consumer_key']
    consumer_secret = creds['consumer_secret']


# In[3]:

import psycopg2
import sys
import pprint
#cursor.execute("SELECT * FROM tweets.tweets")
#records = cursor.fetchall()
#print(records)


# In[4]:

#This is a basic listener that just prints received tweets to stdout.
class StdOutListener(StreamListener):

    def on_data(self, data):
        conn = psycopg2.connect(database="smart", user="dmkm", password="dmkm1234", host="50.16.139.89", port="5432")
        cursor = conn.cursor()
        tweet = json.loads(data)
        idd = tweet['id']
        user = tweet['user']['name']
        location = tweet['user']['location']
        text = tweet['text']
        rt = tweet['retweeted']
        lat = 0
        long = 0
        lang = tweet['lang']
        sentiment = 0
        timestamp = tweet['created_at']
        query = "INSERT INTO tweets.tweets2 (idd, usert, location, text,rt ,lat, long, lang, sentiment, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        data = (idd, user, location, text,rt ,lat, long, lang, sentiment, timestamp)
        cursor.execute(query,data)
        conn.commit()
        conn.close()
        print(tweet['id'])
        return True

    def on_error(self, status):
        print(status)


if __name__ == '__main__':

    #This handles Twitter authetification and the connection to Twitter Streaming API
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    stream = Stream(auth, l)

    #This line filter Twitter Streams to capture data by the keywords: 'python', 'javascript', 'ruby'
    stream.filter(track=['lyon'])


# In[ ]:



