library("RPostgreSQL")
library(tm)
library(e1071)
# loads the PostgreSQL driver
drv <- dbDriver("PostgreSQL")



#query to get tweets
query_kw <- "SELECT idd, text, local_score, alch_score
FROM twitter.tweets WHERE alch_score is not null limit 3000;"

# Retreives the table from the database
df_tweets <-dbGetQuery(con, query_kw)
# Split into 5 bins
df_tweets$alch_score_normal =  cut(df_tweets$alch_score, breaks=seq(-1,1,by = .4),labels = c(1:5))
# Average Value
df_tweets$avg_score = as.numeric(df_tweets$alch_score_normal) + df_tweets$local_score

getMatrix <- function(chrVect){
  testsource <- VectorSource(chrVect)
  testcorpus <- Corpus(testsource)
  testcorpus <- tm_map(testcorpus,stripWhitespace)
  testcorpus <- tm_map(testcorpus, removeWords, stopwords('french'))
  testcorpus <- tm_map(testcorpus, removeWords, stopwords('english'))
  testcorpus <- tm_map(testcorpus, content_transformer(tolower))
  testcorpus <- tm_map(testcorpus, removePunctuation)
  testcorpus <- tm_map(testcorpus, removeNumbers)
  testcorpus <- tm_map(testcorpus, PlainTextDocument)

  return(DocumentTermMatrix(testcorpus))
}

sparseText =getMatrix(df_tweets$text)
classifier = naiveBayes(as.matrix(sparseText), 
                        as.factor(df_tweets$avg_score))

dataPrediction = predict(classifier,as.matrix(sparseText))
table(rs,df_tweets$alch_score_normal)
