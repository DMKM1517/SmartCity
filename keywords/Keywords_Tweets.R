library(RPostgreSQL)
library(stringdist)
library(plyr)
library(stringr)
library(tm)
library(stringi)

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


# Query to retrieve combinations of Tweets - Kewyords
query_kw <- " select t.idd, t.text, k.id, k.keyword
              from twitter.tweets t,
	             twitter.keywords k 
              limit 20000;"

# Retreives the table from the database
df <- dbGetQuery(con, query_kw)

# ######### CONNECTION TO DB ###############


############# FUNCTIONS   ##################

jaccard_distance<- function(data,var1,var2){
  x<-stringdist(data[,var1], data[,var2], method= "jaccard")
  x[which(x==Inf)] <- 1 
  as.numeric(x)
}

cosine_distance<- function(data,var1,var2){
  x<-stringdist(data[,var1], data[,var2], method= "cosine")
  x[which(x==Inf)] <- 1 
  as.numeric(x)
}

clean_text<- function(text)
  {
  text = laply(text, function(text)
    {
    # clean up sentences with R's regex-driven global substitute, gsub():
    text = gsub("[\']", " ", text)
    text = gsub('[[:punct:]]', '', text)
    text = gsub('[[:cntrl:]]', '', text)
    text = gsub('\\d+', '', text)
    text = stri_trans_general(text ,"Latin-ASCII")
    text = gsub('http\\S+\\s*', '', text)
    
    #Clean emojis
    text <- sapply(text, function(row) iconv(row, "latin1", "ASCII", sub=" "))
    names(text) <- NULL
    
    # replace al \n
    text <- gsub("[\n]", " ", text)
    
    # convert to lower case:
    text = tolower(text)
    
   return(text)
    })
  ###Remove Stopwords
  stopWords<-stopwords(kind="french")
  '%nin%' <- Negate('%in%')
  text <-lapply(text, function(x) {
    t <- unlist(strsplit(x, " "))
    t[t %nin% stopWords]
  })
  
  text <- sapply(text, paste, collapse=" ")
  
  return(text)
}

# Counts the amount of keywords presented in the tweet
count_substring = function(text,keywords) {
  subcount = function(text,keywords){
    kw = unlist(strsplit(keywords, ","))
    c=0
    for(i in length(kw)){
      if(grepl(kw[i],text)){
        c=c+1
      } else {c}
    }
    return(c/length(kw))
  }
  mapply(subcount, text, keywords, USE.NAMES = FALSE)
}
############# FUNCTIONS   ##################
############################################


############# MODEL   ##################

df$text_clean = clean_text(df$text)
df$count = count_substring(df$text_clean, df$keyword)
df$dist_jaccard = jaccard_distance(df,"text","keyword")
df$dist_cosine =cosine_distance(df,"text", "keyword")
# summary(df$dist_jaccard)
# summary(df$dist_cosine)
# summary(df$count) #We could filter above a value.
tweet_to_ip = df %>% filter(count > 0) %>% select(idd, id)
names(tweet_to_ip) = c("twitter_id","ip_id")
tweet_to_ip<- tweet_to_ip[,c(2,1)]

dbRemoveTable(con,c("twitter","tweet_to_ip") )
dbWriteTable(con, c("twitter","ip_to_tweet"), tweet_to_ip) #Meanwhile we find out how to update

#########Close PostgreSQL connection###############
dbDisconnect(con)


