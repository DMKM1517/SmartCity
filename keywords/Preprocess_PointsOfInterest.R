
library(dplyr)
library(tm)
require("RPostgreSQL")
library(stringr)
########CONNECTION##########
library(jsonlite)
login <- fromJSON("../login.json", flatten=TRUE)
drv = dbDriver("PostgreSQL")
con <- dbConnect(
  drv, dbname = login$dbname,
  host = login$host,
  port = login$port,
  user = login$user, 
  password = login$password
)
########CONNECTION##########
dbExistsTable(con, c("ip","interest_points"))

#myTable<- dbReadTable(con, c("ip","interest_points"))

#query to get tweets
query_kw <- "select id::varchar(100), name 
from ip.interest_points
where in_use = True
;"

# Retreives the table from the database
names <- dbGetQuery(con, query_kw)

###########
#Backup

#setwd("/Users/saulgarcia/Dropbox/Maestria/DMKM/Courses/Sem2/Big Data Analytics/Project")
#write.csv(myTable, "myTable.csv")
#myTable<-read.csv("myTable.csv")

unwanted_array = list(    'Š'='S', 'š'='s', 'Ž'='Z', 'ž'='z', 'À'='A', 'Á'='A', 'Â'='A', 'Ã'='A', 'Ä'='A', 'Å'='A', 'Æ'='A', 'Ç'='C', 'È'='E', 'É'='E',
                          'Ê'='E', 'Ë'='E', 'Ì'='I', 'Í'='I', 'Î'='I', 'Ï'='I', 'Ñ'='N', 'Ò'='O', 'Ó'='O', 'Ô'='O', 'Õ'='O', 'Ö'='O', 'Ø'='O', 'Ù'='U',
                          'Ú'='U', 'Û'='U', 'Ü'='U', 'Ý'='Y', 'Þ'='B', 'ß'='Ss', 'à'='a', 'á'='a', 'â'='a', 'ã'='a', 'ä'='a', 'å'='a', 'æ'='a', 'ç'='c',
                          'è'='e', 'é'='e', 'ê'='e', 'ë'='e', 'ì'='i', 'í'='i', 'î'='i', 'ï'='i', 'ð'='o', 'ñ'='n', 'ò'='o', 'ó'='o', 'ô'='o', 'õ'='o',
                          'ö'='o', 'ø'='o', 'ù'='u', 'ú'='u', 'û'='u', 'ý'='y', 'ý'='y', 'þ'='b', 'ÿ'='y' )
stopwordsFr<-stopwords(kind="french")
stopwordsEn<-stopwords(kind="en")
stopWords<- c(stopwordsEn,stopwordsFr,"lyon")

names.lower<- as.data.frame(lapply(names, tolower))
names.lower$name<- as.character(names.lower$name)
head(names.lower)

#Clean
names.lower$nom_noacc<-names.lower$name
names.lower$keyword<-names.lower$name
for(i in 1:nrow(names.lower)){
  #Get rid of punctuations
  names.lower[i,3:4]<-gsub('[[:punct:]]', " ", names.lower[i,3])
  #Get rid of symbols
  names.lower[i,3:4]<-gsub('[[:cntrl:]]', " ", names.lower[i,3])
  #Get rid of the accents
    names.lower[i,3:4]<-chartr(paste(names(unwanted_array), collapse=''),
                  paste(unwanted_array, collapse=''),
                  names.lower[i,2])
}

######## Remove StopWords #####################
'%nin%' <- Negate('%in%')
X<-lapply(names.lower[,4], function(x) {
  t <- unlist(strsplit(x, " "))
  t[t %nin% stopWords]
})



#Remove extra spaces
names.lower[,4]<- sapply(X, paste, collapse=",")
keywords = names.lower[,c(1,4)]

#Remove extra character
for(i in 1:nrow(keywords)){
  keywords[i,2]<-gsub(",-,", ",", keywords[i,2])
  }
names(keywords) = c("ip_id","keyword")

#Keywords only 
# keywords<- paste(names.lower[,4],collapse=",")
# keywords<- sapply(keywords, function(x) unique(trimws(unlist(strsplit(x, ",")))))
# keywords<- as.data.frame(keywords)
# names(keywords)<- "keywords"
# keywords_string<- as.data.frame(paste(keywords[,1],collapse=","))
# names(keywords_string)<-"keywords"

############ Prepare and Write to Database##########
dbRemoveTable(con,c("twitter","keywords") )
dbWriteTable(con, c("twitter","keywords"), keywords)
#dbRemoveTable(con,c("twitter","keywords_string") )
#dbWriteTable(con, c("twitter","keywords_string"), keywords_string)
#dbReadTable(con, "twitter.keywords")

#########Close PostgreSQL connection###############
dbDisconnect(con)


 