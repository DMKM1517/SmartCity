install.packages("stringi")
install.packages("gsubfn")
install.packages("dplyr")
install.packages("RPostgreSQL")
install.packages("SnowballC")
require("RPostgreSQL")
require("stringi")
library(gsubfn)
library(SnowballC)
library(dplyr)


# ######### CONNECTION TO DB ###############



# loads the PostgreSQL driver
drv <- dbDriver("PostgreSQL")
con <- dbConnect(
  drv, dbname = "smart",
  host = "50.16.139.89",
  port = 5432,
  user = "dmkm", 
  password = "dmkm1234"
)


#query to get tweets
query_kw <- "SELECT idd::varchar(100), text
FROM tweets.tweets
WHERE alch_score != 0 AND lang = 'fr' AND local_score IS NULL
limit 10
;"

# Retreives the table from the database
df_tweets <-
  dbGetQuery(con, query_kw)

# df_tweets <- unlist(df_tweets)
# names(df_tweets) = NULL


# ######### CONNECTION TO DB ###############



########    FUNCTION    ############
score.sentiment = function(idd, sentences, pos.words, neg.words, .progress='none')
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

# Function to update the database

update <- function(i, con, towrite) {
#  dbGetQuery(con, "BEGIN TRANSACTION")
#  browser()
  txt <- paste("UPDATE tweets.tweets SET local_score=",towrite$sentiment[i],"WHERE idd=",towrite$id[i],"::bigint;")
#  print(towrite$id[i])
  dbGetQuery(con, txt)
#  dbCommit(con)
}

########    FUNCTION    ############
###########################################


###########################################
########    Read Dictionary    ############
french <-read.csv('french_sentiment.csv',header=TRUE,sep=",",encoding='UTF-8')
head(french)
french <- french[, c(1,2,3)]

#Remove accents
french$ADJECTIVE <- stri_trans_general(french$ADJECTIVE,"Latin-ASCII")

#Stemming
french$ADJECTIVE = wordStem(french$ADJECTIVE, language = "french")

#Unique
french = french %>% select(ADJECTIVE, POS.FREQ, NEG.FREQ) %>% distinct(ADJECTIVE)



french$pos <- french$POS.FREQ >= .5


pos.words <- rep(NA,583)
neg.words <- rep(NA,583)

pos.words <- french[french$pos == "TRUE", 1:2]
neg.words <- french[french$pos == "FALSE", 1:2]

pos.words <-pos.words[,1]
neg.words <- neg.words[,1]

########    Read Dictionary    ############
###########################################



sentiment.score <- score.sentiment(df_tweets$idd,df_tweets$text,pos.words,neg.words)
sentiment.score


sentiment.score$sentiment[sentiment.score$score <= -3] <- 1;
sentiment.score$sentiment[sentiment.score$score == -2 | sentiment.score$score == -1] <- 2;
sentiment.score$sentiment[sentiment.score$score == 0] <- 3;
sentiment.score$sentiment[sentiment.score$score == 1 | sentiment.score$score == 2] <- 4;
sentiment.score$sentiment[sentiment.score$score >= 3] <- 5;

# what to write in the table

towrite <- sentiment.score[,c("id", "sentiment")]


for (i in 1:length(sentiment.score$id)){
  update(i, con, towrite)
}



dbDisconnect(con)







