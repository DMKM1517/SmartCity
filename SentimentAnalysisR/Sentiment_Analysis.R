#install.packages("stringi")
#install.packages("gsubfn")
#install.packages("dplyr")
#install.packages("RPostgreSQL")
#install.packages("SnowballC")
#install.packages("jsonlite")

require("RPostgreSQL")
require("stringi")
library(gsubfn)
library(SnowballC)
library(plyr)
library(dplyr)
library(jsonlite)

# ######### CONNECTION TO DB ###############


login <- fromJSON("../login.json", flatten=TRUE)

# loads the PostgreSQL driver
drv <- dbDriver("PostgreSQL")
con <- dbConnect(
  drv, dbname = login$dbname,
  host = login$host,
  port = login$port,
  user = login$user,
  password = login$password
)


# query to get tweets
query_kw <- "SELECT idd::varchar(100), text, lang
FROM twitter.tweets
WHERE local_score IS NULL 
limit 2000
;"

# Retreives the table from the database
df_tweets <-
  dbGetQuery(con, query_kw)
  
print(paste(length(df_tweets[,1]), " tweets retrieved"))

tweets_en <- df_tweets[df_tweets$lang == "en", 1:2]
tweets_fr <- df_tweets[df_tweets$lang == "fr", 1:2]

# df_tweets <- unlist(df_tweets)
# names(df_tweets) = NULL


# ######### CONNECTION TO DB ###############



########    FUNCTION    ############

# for french tweets
score.sentiment.fr = function(idd, sentences, pos.words, neg.words, .progress='none')
{
  require(plyr)
  require(stringr)
  
  # we got a vector of sentences. plyr will handle a list or a vector as an "l" for us
  # we want a simple array of scores back, so we use "l" + "a" + "ply" = laply:
  scores = laply(sentences, function(sentence, pos.words, neg.words) {
    
    Encoding(sentence) <- "UTF-8"
    # clean up sentences with R's regex-driven global substitute, gsub():
    sentence = gsub('http\\S+\\s*', '', sentence)
    sentence = gsub("[\']", " ", sentence)
    sentence = gsub('[[:punct:]]', '', sentence)
    sentence = gsub('[[:cntrl:]]', '', sentence)
    sentence = gsub('\\d+', '', sentence)
    sentence = stri_trans_general(sentence ,"Latin-ASCII")
    
    #Clean emojis
    sentence <- sapply(sentence, function(row) iconv(row, "latin1", "ASCII", sub=""))
    names(sentence) <- NULL
    
    # replace al \n
    sentence <- gsub("[\n]", " ", sentence)
    
    # convert to lower case:
    sentence = tolower(sentence)
    
    # split into words. str_split is in the stringr package
    word.list = str_split(sentence, '\\s+')
    # sometimes a list() is one level of hierarchy too much
    words = unlist(word.list)
    
    #Stemming
    words = wordStem(words, language = "french")
    
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
  
  scores.df = data.frame(id=idd, score=scores, text=sentences)
  return(scores.df)
}

# for english tweets

score.sentiment.en = function(idd, sentences, pos.words, neg.words, .progress='none')
{
  require(plyr)
  require(stringr)
  
  # we got a vector of sentences. plyr will handle a list or a vector as an "l" for us
  # we want a simple array of scores back, so we use "l" + "a" + "ply" = laply:
  scores = laply(sentences, function(sentence, pos.words, neg.words) {
    Encoding(sentence) <- "UTF-8"
    # clean up sentences with R's regex-driven global substitute, gsub():
    sentence = gsub('http\\S+\\s*', '', sentence)
    sentence = gsub("[\']", " ", sentence)
    sentence = gsub('[[:punct:]]', '', sentence)
    sentence = gsub('[[:cntrl:]]', '', sentence)
    sentence = gsub('\\d+', '', sentence)
    sentence = stri_trans_general(sentence ,"Latin-ASCII")
    
    #Clean emojis
    sentence <- sapply(sentence, function(row) iconv(row, "latin1", "ASCII", sub=""))
    names(sentence) <- NULL
    
    # replace al \n
    sentence <- gsub("[\n]", " ", sentence)
    
    # convert to lower case:
    sentence = tolower(sentence)
    
    # split into words. str_split is in the stringr package
    word.list = str_split(sentence, '\\s+')
    # sometimes a list() is one level of hierarchy too much
    words = unlist(word.list)
    
    #Stemming
    words = wordStem(words, language = "english")
    
    # compare our words to the dictionaries of positive & negative terms
    pos.matches = match(words, pos.words.en)
    neg.matches = match(words, neg.words.en)
    
    # match() returns the position of the matched term or NA
    # we just want a TRUE/FALSE:
    pos.matches = !is.na(pos.matches)
    neg.matches = !is.na(neg.matches)
    
    # and conveniently enough, TRUE/FALSE will be treated as 1/0 by sum():
    score = sum(pos.matches) - sum(neg.matches)
    
    return(score)
  }, pos.words, neg.words, .progress=.progress )
  
  scores.df = data.frame(id=idd, score=scores, text=sentences)
  return(scores.df)
}


# Function to update the database

#update <- function(i, con, towrite) {
#  #  dbGetQuery(con, "BEGIN TRANSACTION")
#  #  browser()
#  txt <- paste("UPDATE twitter.tweets SET local_score=",towrite$sentiment[i],"WHERE idd=",towrite$id[i],"::bigint;")
#  #  print(towrite$id[i])
#  dbGetQuery(con, txt)
#  #  dbCommit(con)
#}

########    FUNCTION    ############
###########################################


###########################################
########    Read Dictionary    ############

pos.words.fr <- read.csv('../SentimentAnalysisR/french_positive.csv',header=TRUE,sep=",",encoding='UTF-8')
pos.words.fr <- pos.words.fr[,2]
pos.words.fr <- as.character(pos.words.fr)
neg.words.fr <- read.csv('../SentimentAnalysisR/french_negative.csv',header=TRUE,sep=",",encoding='UTF-8')
neg.words.fr <- neg.words.fr[,2]
neg.words.fr <- as.character(neg.words.fr)

pos.words.en <-read.csv('../SentimentAnalysisR/english_positive.csv',header=TRUE,sep=",",encoding='UTF-8')
pos.words.en <- pos.words.en[,2]
pos.words.en <- as.character(pos.words.en)
neg.words.en <- read.csv('../SentimentAnalysisR/english_negative.csv',header=TRUE,sep=",",encoding='UTF-8')
neg.words.en <- neg.words.en[,2]
neg.words.en <- as.character(neg.words.en)

########    Read Dictionary    ############
###########################################

# different functions due to different stemming in 2 languages

print("Scoring french tweets")

sentiment.score.french <- score.sentiment.fr(tweets_fr$idd,tweets_fr$text,pos.words.fr,neg.words.fr)

print("Scoring english tweets")

sentiment.score.english <- score.sentiment.en(tweets_en$idd,tweets_en$text,pos.words.en,neg.words.en)

sentiment.score <- rbind(sentiment.score.french,sentiment.score.english)


sentiment.score$sentiment[sentiment.score$score <= -3] <- 1;
sentiment.score$sentiment[sentiment.score$score == -2 | sentiment.score$score == -1] <- 2;
sentiment.score$sentiment[sentiment.score$score == 0] <- 3;
sentiment.score$sentiment[sentiment.score$score == 1 | sentiment.score$score == 2] <- 4;
sentiment.score$sentiment[sentiment.score$score >= 3] <- 5;

# what to write in the table

towrite <- sentiment.score[,c("id", "sentiment")]

print("Updating tweet scores in DB")


dbSendQuery(con, "DROP TABLE IF EXISTS twitter.temp_local_score")
dbWriteTable(con,  c("twitter", "temp_local_score"), value = towrite, row.names = FALSE)
dbSendQuery(con, "CREATE index ON twitter.temp_local_score (id)")

dbSendQuery(con, "UPDATE twitter.tweets t
                  SET local_score = ls.sentiment
                  FROM twitter.temp_local_score ls
                  WHERE ls.id::bigint = t.idd
                  ;")

dbSendQuery(con, "DROP TABLE IF EXISTS twitter.temp_local_score")

print(paste(length(towrite[,1]), " tweets updated"))

dbDisconnect(con)
dbUnloadDriver(drv)
rm(list=ls())
