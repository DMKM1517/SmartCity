#!/usr/bin/env python
import sys

def processTweet(tweet):
    import re
    tweet = tweet.lower()
    tweet = re.sub('((www\.[^\s]+)|(https?://[^\s]+))','URL',tweet)
    tweet = re.sub('@[^\s]+',' ',tweet)
    tweet = re.sub('[\s]+', ' ', tweet)
    tweet = re.sub(r'#([^\s]+)', r'\1', tweet)
    tweet = tweet.strip('\'"')
    return tweet

def SmartModel(text):
    import pandas as pd
    from sklearn.externals import joblib
    clf = joblib.load('ModelObjects/svm.pkl') 
    vectorizer = joblib.load('ModelObjects/tfidf.pkl') 
    dataframe =  pd.Series([text])
    dataframe['text']= dataframe.apply(lambda x : processTweet(x))
    test_vectors = vectorizer.transform(dataframe['text'])
    predict = clf.predict(test_vectors)
    return predict
print SmartModel(sys.argv[1])
