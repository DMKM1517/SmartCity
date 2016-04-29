#!/usr/bin/env python
import psycopg2
from sklearn import svm
import pandas.io.sql as psql
import re
from sklearn.cross_validation import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import confusion_matrix
from sklearn import grid_search
from sklearn.externals import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report, confusion_matrix
import json
from pprint import pprint
from time import gmtime, strftime

print("###################")
timeNow = strftime("%Y-%m-%d %H:%M:%S", gmtime())
print(timeNow)

with open('/home/dmkm/SmartCity/login.json') as data_file:
    db = json.load(data_file)


conn = psycopg2.connect(database=db['dbname'], user=db['user'], password=db['password'], host=db['host'], port=db['port'])

cursor = conn.cursor()
dataframe = psql.read_sql("select * from twitter.tweets where sentiment is null order by timestamp::timestamp desc limit 700;", conn)



def processTweet(tweet):
    # process the tweets

    #Convert to lower case
    tweet = tweet.lower()
    #Convert www.* or https?://* to URL
    tweet = re.sub('((www\.[^\s]+)|(https?://[^\s]+))','URL',tweet)
    #Convert @username to AT_USER
    tweet = re.sub('@[^\s]+',' ',tweet)
    #Remove additional white spaces
    tweet = re.sub('[\s]+', ' ', tweet)
    #Replace #word with word
    tweet = re.sub(r'#([^\s]+)', r'\1', tweet)
    #trim
    tweet = tweet.strip('\'"')
    return tweet



clf = joblib.load('/home/dmkm/SmartCity/DataScienceNotebooks/ModelObjects/modelrfsvm.pkl') 
vectorizer = joblib.load('/home/dmkm/SmartCity/DataScienceNotebooks/ModelObjects/tfidf1500.pkl') 



dataframe['text']= dataframe['text'].apply(lambda x : processTweet(x))
test_vectors = vectorizer.transform(dataframe['text'])



predict = clf.predict(test_vectors)
rows_inserted = 0
for i in zip(predict,dataframe['idd'].as_matrix(columns=None)):
    idd =  i[1]
    sentiment = i[0]
    try:
        cursor.execute('update twitter.tweets set sentiment=%s where idd=%s', (sentiment,idd))
        #print idd,sentiment
        rows_inserted += 1
    except KeyError, e:
        print "not inserted"
conn.commit() 



conn.close()



print "Inserted Records ",rows_inserted
