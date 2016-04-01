require("RPostgreSQL")
#install.packages("stringi")
require("stringi")
#install.packages("gsubfn")
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
query_kw <- "select text 
from tweets.tweets
where lang = 'fr'
limit 20000
;"

# Retreives the table from the database
df_tweets <-
  dbGetQuery(con, query_kw)

df_tweets <- unlist(df_tweets)
names(df_tweets) = NULL


# ######### CONNECTION TO DB ###############



########    FUNCTION    ############
score.sentiment = function(sentences, pos.words, neg.words, .progress='none')
{
  require(plyr)
  require(stringr)
  
  # we got a vector of sentences. plyr will handle a list or a vector as an "l" for us
  # we want a simple array of scores back, so we use "l" + "a" + "ply" = laply:
  scores = laply(sentences, function(sentence, pos.words, neg.words) {
    
    # clean up sentences with R's regex-driven global substitute, gsub():
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
  
  scores.df = data.frame(score=scores, text=sentences)
  return(scores.df)
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





#############################################
#############    FAKE DATASET  ##############
tw <- NULL

tw[1] <- "aime aime aime aime"
tw[2] <- "aime aime"
tw[3] <- "decoratif decoratif"
tw[4] <- "Je suis sûr qu'en écrivant ce genre de chose, on ne se rend même pas compte que c'est terrible. Bonne conscience... "
tw[5] <- "J'ai detesté Le Paris Lyon à Paris. Garçon de café exécrable. Lieu a éviter http://dismoiou.fr/p/bMIHdb"
tw[6] <- "Je me balade 15 minutes dans Lyon je reviens chez moi avec du café, du chocolat et un sac gratuit ... J'aime cette ville"
tw[7] = "#Hidalgo :Il reste dans la loi travail des choses que je n'approuve pas ... COUAC COUAC #PS Qu'en pense @jccambadelis ?"
tw[8] = "#FF moi parce que je suis drôle, jolie, intelligente, modeste et j'aime les bananes."
tw[9] = "Lyon, meilleure ville pour entreprendre en France d’après"
Encoding(tw) <- "UTF-8"

#############    FAKE DATASET  ##############
############################################


sentiment.score <- score.sentiment(df_tweets,pos.words,neg.words)
sentiment.score
# summary(sentiment.score)
# hist(sentiment.score$sentiment)

sentiment.score$sentiment[sentiment.score$score <= -3] <- 1
sentiment.score$sentiment[sentiment.score$score == -2 | sentiment.score$score == -1] <- 2
sentiment.score$sentiment[sentiment.score$score == 0] <- 3
sentiment.score$sentiment[sentiment.score$score == 1 | sentiment.score$score == 2] <- 4
sentiment.score$sentiment[sentiment.score$score >= 3] <- 5
