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
    import os
    from sklearn.externals import joblib
<<<<<<< HEAD
    clf = joblib.load('ModelObjects/modelrf2804.pkl') 
    vectorizer = joblib.load('ModelObjects/tfidf.pkl') 
=======
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ModelObjects')
    clf = joblib.load(os.path.join(path, 'svm.pkl')) 
    vectorizer = joblib.load(os.path.join(path, 'tfidf.pkl')) 
>>>>>>> 683d5671a44fc1b0cbb5c3dec0e1139bedede06e
    dataframe =  pd.Series([text])
    dataframe['text']= dataframe.apply(lambda x : processTweet(x))
    test_vectors = vectorizer.transform(dataframe['text'])
    predict = clf.predict(test_vectors)
    return predict

print SmartModel(sys.argv[1])[0]
