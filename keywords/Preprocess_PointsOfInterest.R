install.packages("RPostgreSQL")
install.packages("tm")
library(dplyr)
library(tm)
require("RPostgreSQL")
########CONNECTION##########
#create connection
#save password
pw<- {"dmkm1234"}

#load the PostgreSQL driver
drv<- dbDriver("PostgreSQL")
con<- dbConnect(drv, dbname= "smart",
                host = "25.145.132.49", port=5432,
                user = "dmkm", password=pw)
rm(pw) #removes the password
########CONNECTION##########
dbExistsTable(con, c("ip","interest_points"))

myTable<- dbReadTable(con, c("ip","interest_points"))


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
stopWords<- c(stopwordsEn,stopwordsFr)

names<- myTable %>% filter(in_use == 1) %>% select(id, nom)
#LowerCase and convert to Data.Frame
names.lower<- as.data.frame(lapply(names, tolower))
names.lower$nom<- as.character(names.lower$nom)
head(names.lower)

#Clean
names.lower$nom_noacc<-names.lower$nom
names.lower$keyword<-names.lower$nom
for(i in 1:nrow(names.lower)){
  #Get rid of punctuations
  names.lower[i,3:4]<-gsub('[[:punct:]]', " ", names.lower[i,3])
  #Get rid of the accents
   names.lower[i,3:4]<-chartr(paste(names(unwanted_array), collapse=''),
                 paste(unwanted_array, collapse=''),
                 names.lower[i,3])
   #names.lower[i,4]<- gsub('d ', "", names.lower[i,4])
}

######## Remove StopWords #####################
'%nin%' <- Negate('%in%')
X<-lapply(names.lower[,4], function(x) {
  t <- unlist(strsplit(x, " "))
  t[t %nin% stopWords]
})

#Remove extra spaces
names.lower[,4]<- sapply(X, paste, collapse=",")

#Keywords
keywords<- paste(names.lower[,4],collapse=",")
keywords<- sapply(keywords, function(x) unique(trimws(unlist(strsplit(x, ",")))))
keywords<- as.data.frame(keywords)
names(keywords)<- "keywords"
keywords_string<- as.data.frame(paste(keywords[,1],collapse=","))
names(keywords_string)<-"keywords"

############ Prepare and Write to Database##########
names.lower$id<-as.integer(names.lower$id)
dbRemoveTable(con,c("twitter","keywords") )
dbWriteTable(con, c("twitter","keywords"), keywords)
dbRemoveTable(con,c("twitter","keywords_string") )
dbWriteTable(con, c("twitter","keywords_string"), keywords_string)
#dbReadTable(con, "twitter.keywords")

#########Close PostgreSQL connection###############
dbDisconnect(con)

 