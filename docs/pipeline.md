# Data Pipeline

The data pipeline consists of three steps  
1. Reading raw data from database  
2. Preprocessing raw data  
3. Scoring  

### Data Pipeline
`ScoreData.py` is the master script  which scores all the tweets in the `twitter.tweets` table. Top 700 tweets are read based ontheir recent timestamp, followed by pre-procssing steps. The pickled model is loaded from disk to score the pre-processed data. 

### Machine Learning
All notbooks and scripts related to machine learning can be found in `SmartCity/DataScienceNotebook`.  
After training a scikit-learn model, it is desirable to have a way to persist the model for future use without having to retrain. They can be found in `ModelObjects`.  

### Smart Labs 
Script for smart labs can be found in `SmartModel.py`. They contain the following products:
1. Sentiment Analysis
2. Word Embedding
