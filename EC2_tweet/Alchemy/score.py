#!/usr/bin/env python
from __future__ import print_function
from alchemyapi import AlchemyAPI
import json,re
from time import gmtime, strftime
import psycopg2
import sys
import pprint
count = 0
bad = 0
table_data = {}
conn = psycopg2.connect(<details>)
cursor = conn.cursor()
cursor.execute("SELECT * FROM twitter.tweets where alch_score is null limit 1500")
records = cursor.fetchall()
alchemyapi = AlchemyAPI()


for tweet in records:
	key = long(tweet[0])
	text = tweet[3]
	text_clean = ' '.join(re.sub("\'|@|#|http\S+|:"," ",str(text)).split())	
	#text_clean = ' '.join(re.sub('(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)'," ",str(text)).split())
	table_data[key]=text_clean


values = map(lambda key: ((key),alchemyapi.sentiment('text',table_data[key])), table_data.keys())

for key_idd, value_tweet in values:
	try:
		count += 1
		alch_score = (value_tweet['docSentiment']['score'])
		alch_type = (value_tweet['docSentiment']['type'])
		alch_lang = (value_tweet['language'])
		cursor.execute('update twitter.tweets set alch_score=%s, alch_type=%s, alch_lang=%s where idd=%s', (alch_score,alch_type,alch_lang,key_idd))
	except KeyError, e:
    		bad +=1
		new_score = 0
		cursor.execute('update twitter.tweets set alch_score= %s where idd = %s', (new_score,key_idd))

#score = dict(map(lambda (k,v): (k, alchemyapi.sentiment('text',(v)), table_data.iteritems()))
conn.commit()
print("Total Rows",count)
print("bad",bad)
print("Inserted",count-bad)
print("###################")
conn.close()
