drop table tweets.tweets;
CREATE TABLE tweets.tweets  as (
/*	idd varchar(100) NULL,
	"timestamp" varchar(100) NULL,
	usert varchar(300) NULL,
	location varchar(300) NULL,
	"text" varchar(1000) NULL,
	rt varchar(100) NULL,
	lat varchar(100) NULL,
	long varchar(100) NULL,
	lang varchar(100) NULL,
	sentiment float8 NULL,
	alch_score float8 NULL,
	alch_type varchar(100) NULL,
	alch_lang varchar(100) NULL,
	local_score float8 NULL*/
select * from twitter.tweets
);

CREATE INDEX tweets_v2_idd_idx ON tweets.tweets (idd);

CREATE INDEX tweets_v2_sentiment_idx ON tweets.tweets (sentiment);

CREATE INDEX tweets_v2_text_idx ON tweets.tweets (text);

/*insert into tweets.tweets
SELECT * FROM twitter.tweets;*/





SELECT * FROM pg_stat_activity ORDER BY client_addr ASC, query_start ASC

SELECT DATE, COUNT(DATE) FROM (
select CAST(timestamp AS DATE) AS DATE
from twitter.tweets
)A
GROUP BY DATE
;

select count(*) from twitter.tweets;

select * 
from tweets.tweets
where cast(timestamp AS DATE) = '20160408'
order by timestamp desc
limit 10
;

select lang, count(lang) 
from twitter.tweets
group by lang
order by count(lang) desc
;

select count(*)
from tweets.tweets
where alch_score != 0
LIMIT 10;



select max(alch_score),min(alch_score), avg(alch_score)
from twitter.tweets
where alch_score != 0;

select * 
from twitter.tweets
where alch_score != 0
limit 10;


select t.idd, t.text, k.id, split_part(k.keyword,',',1),  levenshtein(t.text,split_part(k.keyword,',',1))
from twitter.tweets t,
	twitter.keywords k 
where  levenshtein(t.text,split_part(k.keyword,',',1)) < 10
limit 1000
	;


select id, "name" 
from ip.interest_points
where in_use = True;

SELECT idd, text
FROM tweets.tweets
WHERE alch_score != 0 AND lang = 'fr' AND local_score IS not NULL
;
/*
update tweets.tweets
set local_score = null
where local_score is not null; 
*/
select avg(2*alch_score+3- local_score) , stddev(2*alch_score+3- local_score) 
from twitter.tweets 
where local_score is not null 
limit 100;

select idd, text, 2*alch_score+3 as alch_score_norm, local_score
from twitter.tweets
where 2*alch_score+3 > 3 and local_score > 3
limit 100
;

select idd, text, 2*alch_score+3 as alch_score_norm, local_score
from twitter.tweets
where 2*alch_score+3 < 2 and local_score < 2
limit 100
;

create table tweets.training as (
select idd, text, alch_score, local_score
from twitter.tweets
where round(2*alch_score+3) - local_score = 0
)
;

select count(*)
from tweets.training
;

select /*idd, text, round(2*alch_score+3) as alch_score_norm, local_score*/ count(*)
from twitter.tweets
where 2*alch_score+3 - local_score < .5 and 2*alch_score+3 - local_score > - .5
limit 100
;

create table tweets.testing as (
select idd, text, alch_score, local_score
from twitter.tweets
where cast(timestamp AS DATE) = '20160324' and local_score is not null
)
;

select count(*)
select idd, text, alch_score, local_score
from twitter.tweets
where cast(timestamp AS DATE) = '20160325' and local_score is not null;

select lang, count(*)
from twitter.tweets
group by lang
order by count(*) desc
;


