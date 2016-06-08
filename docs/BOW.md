# Lexicon-based Bag of Words Sentiment Analysis

##Description
Bag of Words is a very naive and intuitive lexicon-based sentiment analysis model. It uses a predefined dictionary of positive and negative words and calculates the sentiment score based on the number of matches of words in text with each of the dictionaries.

##Sentiment score

Sentiment is calculated as follows:

$$\sum{positive\_matches} - \sum{negative\_matches}$$

and then normalized to the form of 1 to 5.

##Lexicon
Currently application is working with two languages - French and English. 
`SmartCity/SentimentAnalysisR/` contains the lists of positive and negative words of both languages, based on the following lexicones: 
- [English dictionary used](https://github.com/jeffreybreen/twitter-sentiment-analysis-tutorial-201107/tree/master/data/opinion-lexicon-English)
- [French dictionary used](https://github.com/fabelier/tomdesmedt/blob/master/sentiment.csv%20-%20Sheet%201.csv)

###Adding a language
Adding a language is possible, but would require adding another two dictionary files (positive and negative separately) to  `SmartCity/SentimentAnalysisR` folder and modifying the  `Sentiment_Analysis.R` script.

Add new line to separating tweets in a new language into separate data frame by this example (line 45):

	tweets_en <- df_tweets[df_tweets$lang == "en", 1:2]

Read new dictionaries into `pos.words.lang` and `neg.words.lang` variables as shown in `Read Dictionary` section of the code (line 186).

Simplest way is to create another identical `score.sentiment.lang` function and change the language of stemming to the required one.

    #Stemming
    words = wordStem(words, language = "english")

After this call the function with new parameters (line 212) and bind the results with other language results:

	print("Scoring new_language tweets")
	
	sentiment.score.new_language <- score.sentiment.en(tweets_en$idd,tweets_en$text,pos.words.lang,neg.words.lang)
	
	sentiment.score <- rbind(sentiment.score.french,sentiment.score.english, sentiment.score.new_language)

Possible languages are limited by the R SnowballC package, which is used for stemming . According to [documentation](https://cran.r-project.org/web/packages/SnowballC/SnowballC.pdf), supported languages are Danish, Dutch, English, Finnish, French, German, Hungarian, Italian, Norwegian, Portuguese, Romanian, Russian, Spanish, Swedish and Turkish.