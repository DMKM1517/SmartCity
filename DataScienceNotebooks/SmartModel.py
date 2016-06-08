#!/usr/bin/env python
import sys
import os

inputStringArg1 = sys.argv[1]
inputStringArg2 = sys.argv[2]

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
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ModelObjects')
    clf = joblib.load(os.path.join(path, 'modelsvm07June.pkl')) 
    vectorizer = joblib.load(os.path.join(path, 'tfidf07June.pkl')) 
    dataframe =  pd.Series([text])
    dataframe['text']= dataframe.apply(lambda x : processTweet(x))
    test_vectors = vectorizer.transform(dataframe['text'])
    predict = clf.predict(test_vectors)
    return predict

def Word2Vec(text):
    from gensim.models.word2vec import Word2Vec
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tweetW2V')
    model = Word2Vec.load(path)
    most_similar = model.most_similar(text)
    return most_similar

if inputStringArg1 == 'senti':
    print SmartModel(inputStringArg2)[0]
if inputStringArg1 == 'word2vec':
    print Word2Vec(inputStringArg2)
