from __future__ import print_function
from alchemyapi import AlchemyAPI
import json

import psycopg2
import sys
import pprint

conn = psycopg2.connect(database="smart", user="dmkm", password="dmkm1234", host="localhost", port="5432")
cursor = conn.cursor()
cursor.execute("SELECT * FROM tweets.tweets limit 10")
records = cursor.fetchall()

alchemyapi = AlchemyAPI()

for tweet in records:
#demo_text = 'Yesterday dumb Bob destroyed my fancy iPhone in beautiful Denver, Colorado. I guess I will have to head over to the Apple Store and buy a new one.'
#demo_text1 = 'Lyon, meilleure ville pour entreprendre en France dapres'
# Create the AlchemyAPI Object
    response = alchemyapi.sentiment('text', tweet['text'])
    print(response['docSentiment']['score'])
