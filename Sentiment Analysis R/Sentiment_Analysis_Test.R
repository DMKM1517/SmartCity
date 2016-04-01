require("RPostgreSQL")
require(dplyr)
require(stringr)
library(SnowballC)

#############################
#####  DB CONNECTION  #######
drv <- dbDriver("PostgreSQL")
con <- dbConnect(
  drv, dbname = "smart",
  host = "50.16.139.89",
  port = 5432,
  user = "dmkm", 
  password = "dmkm1234"
)
#####  DB CONNECTION  #######
#############################

###### LOAD FRENCH DICTIONARY  ########
setwd("/Users/saulgarcia/Desktop/Github/SmartCity/Sentiment Analysis R")
french <-read.csv("clean_dictionary_sentiment_UTF.csv")

#Remove accents
french$word_clean = stri_trans_general(french$word_clean,"Latin-ASCII")
#Stem
french$word_stem = wordStem(french$word_clean, language = "french")
french_unique = french %>% select(word_stem, score, word_clean) %>% distinct(word_stem)

head(french_unique)

###### LOAD FRENCH DICTIONARY  ########
#######################################

score.sentiment = function(sentences, pos.words, neg.words, .progress='none')
{
  require(plyr)
  require(stringr)
  
  # we got a vector of sentences. plyr will handle a list or a vector as an "l" for us
  # we want a simple array of scores back, so we use "l" + "a" + "ply" = laply:
  scores = laply(sentences, function(sentence, pos.words, neg.words) {
    
    # clean up sentences with R's regex-driven global substitute, gsub():
    sentence = gsub('[[:punct:]]', '', sentence)
    sentence = gsub('[[:cntrl:]]', '', sentence)
    sentence = gsub('\\d+', '', sentence)
    sentence = stri_trans_general(sentence ,"Latin-ASCII")
    
    # and convert to lower case:
    sentence = tolower(sentence)
    
    # Clean text to remove emojies
    sentence <- sapply(sentence, function(row) iconv(row, "latin1", "ASCII", sub=""))
    names(sentence) <- NULL
    
    # replace al \n
    sentence <- gsub("[\n]", " ", sentence)
    
    # split into words. str_split is in the stringr package
    word.list = str_split(sentence, '\\s+')
    # sometimes a list() is one level of hierarchy too much
    words = unlist(word.list)
    
    # compare our words to the dictionaries of positive & negative terms
    pos.matches = match(words, pos.words)
    neg.matches = match(words, neg.words)
    
    # match() returns the position of the matched term or NA
    # we just want a TRUE/FALSE:
    pos.matches = !is.na(pos.matches)
    neg.matches = !is.na(neg.matches)
    
    # and conveniently enough, TRUE/FALSE will be treated as 1/0 by sum():
    score = sum(pos.matches) - sum(neg.matches)
    
    return(score)
  }, pos.words, neg.words, .progress=.progress )
  
  scores.df = data.frame(score=scores, text=sentences)
  return(scores.df)
}


french$pos <- french$POS.FREQ >= .6

pos.words <- rep(NA,583)
neg.words <- rep(NA,583)

pos.words <- french[french$pos == "TRUE", 1:2]
neg.words <- french[french$pos == "FALSE", 1:2]

pos.words <-pos.words[,1]
neg.words <- neg.words[,1]


tw <- "aime aime aime aime"

sentiment.score <- score.sentiment(tw,pos.words,neg.words)
sentiment.score

