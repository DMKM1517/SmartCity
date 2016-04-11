library("RPostgreSQL")
library(tm)
library(e1071)
# loads the PostgreSQL driver
drv <- dbDriver("PostgreSQL")



#query to get tweets
query_kw <- "SELECT idd, text, local_score
FROM tweets.testing;"

#query_kw1 <- "SELECT idd, text FROM tweets.training;"

# Retreives the table from the database
datasenti <-dbGetQuery(con, query_kw)
spl = sample.split(datasenti$local_score,SplitRatio = 0.5)
dataTrain = subset(datasenti, spl==TRUE)
dataTest = subset(datasenti,spl==FALSE)
dim(dataTrain)
dim(dataTest)


# Split into 5 bins
df_tweets$alch_score_normal =  cut(df_tweets$alch_score, breaks=seq(-1,1,by = .4),labels = c(1:5))
# Average Value
df_tweets$avg_score = as.numeric(df_tweets$alch_score_normal) + df_tweets$local_score

getMatrix <- function(chrVect){
  sentence = gsub('http\\S+\\s*', '', chrVect)
  testsource <- VectorSource(sentence)
  testcorpus <- Corpus(testsource)
  testcorpus <- tm_map(testcorpus,stripWhitespace)
  testcorpus <- tm_map(testcorpus, content_transformer(tolower))
  testcorpus <- tm_map(testcorpus, removePunctuation)
  testcorpus <- tm_map(testcorpus, removeNumbers)
  testcorpus <- tm_map(testcorpus, PlainTextDocument)
  output = (DocumentTermMatrix(testcorpus , control =  list(weighting = function(x) weightTfIdf(x, normalize =TRUE)) ))
  #output = DocumentTermMatrix(testcorpus)
  return(output)
}

sparseTrain =getMatrix(dataTrain$text)
sparseTest =getMatrix(dataTest$text)

classifier_svm = svm(as.factor(dataTrain$local_score) ~ as.matrix(sparseTrain) )

dataPrediction = predict(classifier_svm,as.matrix(sparseTest))

acc =table(dataTrain$local_score,dataPrediction)
acc
sum(diag(acc))
sum(diag(acc))

dataPrediction


###########

classifier = naiveBayes(as.matrix(sparseText), 
                        as.factor(df_tweets$avg_score))


sparseText =getMatrix(df_test$text)
sparseText


classifier = naiveBayes(as.matrix(sparseText), 
                        as.factor(df_tweets$local_score))
classifier_svm = svm(as.factor(df_tweets$local_score) ~ as.matrix(sparseText) )

dataPrediction = predict(classifier_svm,as.matrix(sparseText))
acc =table(dataPrediction,df_tweets$local_score)
acc
sum(diag(acc))
str(dataPrediction)

