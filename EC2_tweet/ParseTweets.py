
# coding: utf-8

# In[1]:

import io
import json
tweets = io.open('tweet.txt')


# In[2]:

import psycopg2
import sys
import pprint

conn = psycopg2.connect(database="smart", user="dmkm", password="dmkm1234", host="50.16.139.89", port="5432")
cursor = conn.cursor()
#cursor.execute("SELECT * FROM tweets.tweets")
#records = cursor.fetchall()
#print(records)


# In[3]:

i=0
for line in tweets:
    try:
        tweet = json.loads(line)
    except ValueError:
        pass # invalid json
    else:
        if 'id' in tweet:
            i = i+1
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
            query = "INSERT INTO tweets.tweets (idd, usert, location, text,rt ,lat, long, lang, sentiment, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            data = (idd, user, location, text,rt ,lat, long, lang, sentiment, timestamp)
            cursor.execute(query,data)
            conn.commit()
            print(i)
conn.close()


# In[ ]:
# In[ ]:
