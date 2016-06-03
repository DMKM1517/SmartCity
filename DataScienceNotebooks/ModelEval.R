require("RPostgreSQL")
require("stringi")
library(gsubfn)
library(SnowballC)
library(plyr)
library(dplyr)
library(jsonlite)

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

# Load tweets scored my mechanical turk (ground truth)
tweets = read.csv("../tweets.csv")

# Rescale average tweets
linMap <- function(x, from, to)
  (x - min(x)) / max(x - min(x)) * (to - from) + from
tweets$rescaled = linMap(tweets$Avg, 1, 5)

# Add Index
tweets$idd = rownames(tweets)

# Load Dictionaries
pos.words.en <-read.csv('../SentimentAnalysisR/english_positive.csv',header=TRUE,sep=",",encoding='UTF-8')
pos.words.en <- pos.words.en[,2]
pos.words.en <- as.character(pos.words.en)
neg.words.en <- read.csv('/../SentimentAnalysisR/english_negative.csv',header=TRUE,sep=",",encoding='UTF-8')
neg.words.en <- neg.words.en[,2]
neg.words.en <- as.character(neg.words.en)

# BOW
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

# Score Tweets
sentiment.score <- score.sentiment.en(tweets$idd,as.character(tweets$Tweet),pos.words.en,neg.words.en)

# Rescale Scores
sentiment.score$sentiment[sentiment.score$score <= -3] <- 1;
sentiment.score$sentiment[sentiment.score$score == -2 | sentiment.score$score == -1] <- 2;
sentiment.score$sentiment[sentiment.score$score == 0] <- 3;
sentiment.score$sentiment[sentiment.score$score == 1 | sentiment.score$score == 2] <- 4;
sentiment.score$sentiment[sentiment.score$score >= 3] <- 5;

# Add bow sentiment to dataframe
tweets$bow = sentiment.score$sentiment

# Evaluate Accuracy
op =table(ceiling(tweets$rescaled),tweets$bow)
sum(diag(op))/sum(op)

# > sum(diag(op))/sum(op)
# [1] 0.5359865

# Add Columns
tweets["alch"] = 0
tweets["model"] = 0

# Rearrange Columns
tweets = tweets[,c(4,1,2,3,5,6,7)]

# DB Jazz
print("Updating tweet scores in DB")
dbSendQuery(con, "DROP TABLE IF EXISTS twitter.tweet_eval")
dbWriteTable(con, c("twitter", "tweet_eval"), tweets,row.names = FALSE)
dbCommit(con)
dbDisconnect(con)