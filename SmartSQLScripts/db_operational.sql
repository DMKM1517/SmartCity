
----------------------------------------------------------------------
-- Create the Schemas for the Operational DB
----------------------------------------------------------------------
create schema landing;
create schema ip;
create schema twitter;

----------------------------------------------------------------------
-- interest points tables
----------------------------------------------------------------------
drop table if exists landing.ip_interest_points;
CREATE TABLE landing.ip_interest_points (
	id int4 NOT NULL,
	"type" varchar(250),
	type_detail text,
	name varchar(500),
	address text,
	postal_code varchar(100),
	commune varchar(100),
	telephone varchar(250),
	fax varchar(100),
	telephone_fax varchar(100),
	email varchar(250),
	website varchar(500),
	facebook varchar(500),
	ranking varchar(100),
	open_hours text,
	price text,
	price_min varchar(250),
	price_max varchar(250),
	producer text,
	coordinates_lat float,
	coordinates_long float,
	source_create_date varchar(250),
	source_last_update varchar(250),
	CONSTRAINT interest_points_pkey PRIMARY KEY (id)
);
CREATE INDEX landing_interest_points_coordinates_lat_coordinates_long_idx ON landing.ip_interest_points (coordinates_lat,coordinates_long);
CREATE INDEX landing_interest_points_nom_idx ON landing.ip_interest_points (name);

drop table if exists ip.interest_points_new;
CREATE TABLE ip.interest_points_new (
	id int4 NOT NULL,
	"type" varchar(250),
	type_detail text,
	name varchar(500),
	address text,
	postal_code varchar(100),
	commune varchar(100),
	telephone varchar(250),
	fax varchar(100),
	telephone_fax varchar(100),
	email varchar(250),
	website varchar(500),
	facebook varchar(500),
	ranking varchar(100),
	open_hours text,
	price text,
	price_min varchar(250),
	price_max varchar(250),
	producer text,
	coordinates_lat float,
	coordinates_long float,
	source_create_date varchar(250),
	source_last_update varchar(250),
	sentiment int4,
	in_use bool DEFAULT false,
	flag varchar(50),
	last_update_date timestamp,
	CONSTRAINT interest_points_pkey PRIMARY KEY (id)
);
CREATE INDEX interest_points_coordinates_lat_coordinates_long_idx ON ip.interest_points_new (coordinates_lat,coordinates_long);
CREATE INDEX interest_points_nom_idx ON ip.interest_points_new (name);


----------------------------------------------------------------------
-- Foursquare table
----------------------------------------------------------------------
drop table if exists landing.ip_foursquare ;
CREATE TABLE landing.ip_foursquare (
	idd int8 NOT NULL,
	"name" varchar(500),
	checkinscount int8,
	tipcount int8,
	userscount int8,
	rating float8
);
CREATE INDEX foursquare_pkey ON landing.ip_foursquare (idd);

drop table if exists ip.foursquare;
CREATE TABLE ip.foursquare (
	idd int8 NOT NULL,
	"name" varchar(500),
	checkinscount int8,
	tipcount int8,
	userscount int8,
	rating float8,
	flag varchar(100),
	last_update_date timestamp,
	CONSTRAINT foursquare_pkey PRIMARY KEY (idd),
	CONSTRAINT fk_ip_foursquare_idd FOREIGN KEY (idd) REFERENCES ip.interest_points(id)
);
CREATE INDEX foursquare_rating_idx ON ip.foursquare (rating);


----------------------------------------------------------------------
-- Yelp table
----------------------------------------------------------------------
drop table if exists landing.ip_yelp;
CREATE TABLE landing.ip_yelp (
	idd int8 NOT NULL,
	"name" varchar(500),
	rating float4,
	latitude float8,
	longitude float8,
	image_url varchar(500),
	phone varchar(100),
	review_count int8
);
CREATE INDEX yelp_pkey ON landing.ip_yelp (idd);

drop table if exists ip.yelp;
CREATE TABLE ip.yelp (
	idd int8 NOT NULL,
	"name" varchar(500),
	rating float4,
	latitude float8,
	longitude float8,
	image_url varchar(500),
	phone varchar(100),
	review_count int8,
	flag varchar(100),
	last_update_date timestamp,
	CONSTRAINT yelp_pkey PRIMARY KEY (idd),
	CONSTRAINT fk_ip_yelp_idd FOREIGN KEY (idd) REFERENCES ip.interest_points(id)
);
CREATE INDEX yelp_latitude_longitude_idx ON ip.yelp (latitude,longitude);
CREATE INDEX yelp_rating_idx ON ip.yelp (rating);


----------------------------------------------------------------------
-- Twitter tables
----------------------------------------------------------------------
drop table if exists twitter.tweets;
CREATE TABLE twitter.tweets (
	idd bigint,
	"timestamp" varchar(100),
	usert varchar(300),
	location varchar(300),
	"text" varchar(1000),
	rt varchar(100),
	lat varchar(100),
	long varchar(100),
	lang varchar(100),
	sentiment float8,
	alch_score float8,
	alch_type varchar(100),
	alch_lang varchar(100),
	local_score float8
);

CREATE INDEX ON twitter.tweets (idd);
CREATE INDEX ON twitter.tweets (sentiment);
CREATE INDEX ON twitter.tweets ("text");
CREATE INDEX ON twitter.tweets (timestamp);

drop table if exists twitter.tweet_to_ip;
CREATE TABLE twitter.tweet_to_ip (
	ip_id int,	
	twitter_id bigint);
CREATE INDEX ON twitter.tweet_to_ip (ip_id);
CREATE INDEX ON twitter.tweet_to_ip (twitter_id);

drop table if exists twitter.tweet_to_ip_feedback;
CREATE TABLE twitter.tweet_to_ip_feedback (
	ip_id int,	
	twitter_id bigint,
	feedback int,
	timestamp timestamp,
	session_id varchar(200));
CREATE INDEX ON twitter.tweet_to_ip_feedback (ip_id);
CREATE INDEX ON twitter.tweet_to_ip_feedback (twitter_id);


drop table if exists twitter.processed_tweets;
CREATE TABLE twitter.processed_tweets (
	tweet_id bigint,
	processed_date timestamp
);
CREATE INDEX ON twitter.processed_tweets (tweet_id);

drop table if exists twitter.keywords;
CREATE TABLE twitter.keywords (
	ip_id int,
	keyword text
);
CREATE INDEX ON twitter.keywords (ip_id);


----------------------------------------------------------------------
-- View with twitter sentiment of each point
----------------------------------------------------------------------

drop view if exists twitter.ip_tweets_sentiment;
CREATE VIEW twitter.ip_tweets_sentiment AS
SELECT
	tip.ip_id,
	avg(t.sentiment) as sentiment
FROM
	twitter.tweet_to_ip tip
	JOIN twitter.tweets t ON tip.twitter_id = t.idd
	JOIN (
		SELECT
			tip2.ip_id,
			max((t2."timestamp")::timestamp without time zone) AS max_timestamp
		FROM 
			twitter.tweets t2
			JOIN twitter.tweet_to_ip tip2 ON tip2.twitter_id = t2.idd
		GROUP BY tip2.ip_id
		) lastt ON tip.ip_id = lastt.ip_id
WHERE 
	(t."timestamp")::timestamp > (lastt.max_timestamp - '1 day'::interval)
GROUP BY tip.ip_id
--having avg(t.sentiment) is not null;
  
----------------------------------------------------------------------
-- View with the current tweets of an IP
----------------------------------------------------------------------

drop view if exists twitter.current_tweets_of_ip;
CREATE VIEW twitter.current_tweets_of_ip AS
SELECT
	tip.ip_id,
	t.idd,
	t."timestamp"::timestamp,
	t.usert, location, 
	t."text", 
	t.rt, 
	t.lat, 
	t.long, 
	t.lang, 
	t.sentiment
FROM
	twitter.tweet_to_ip tip
	JOIN twitter.tweets t ON tip.twitter_id = t.idd
	JOIN (
		SELECT
			tip2.ip_id,
			max((t2."timestamp")::timestamp without time zone) AS max_timestamp
		FROM 
			twitter.tweets t2
			JOIN twitter.tweet_to_ip tip2 ON tip2.twitter_id = t2.idd
		GROUP BY tip2.ip_id
		) lastt ON tip.ip_id = lastt.ip_id
WHERE 
	(t."timestamp")::timestamp > (lastt.max_timestamp - '1 day'::interval)
order by tip.ip_id, (t."timestamp")::timestamp desc;


----------------------------------------------------------------------
-- Aggregation View
----------------------------------------------------------------------
drop view if exists ip.v_interest_points_agregated;
CREATE VIEW ip.v_interest_points_agregated AS
select
	ip.id,
	ip.type,
	ip.type_detail,
	case when ip.name is not null then ip.name
		when fs.name is not null then fs.name
		else y.name END as name,
	ip.address,
	ip.postal_code,
	ip.commune,
	case when ip.telephone is not null then ip.telephone
		else y.phone end as telephone,
	ip.fax,
	ip.telephone_fax,
	ip.email,
	ip.website,
	ip.facebook,
	ip.ranking,
	ip.open_hours,
	ip.price,
	ip.price_min,
	ip.price_max,
	ip.producer,
	case when ip.coordinates_lat is not null then ip.coordinates_lat
		else y.latitude end as coordinates_lat,
	case when ip.coordinates_long is not null then ip.coordinates_long
		else y.longitude end as coordinates_long,
	ip.source_create_date,
	ip.source_last_update,
	ip.flag,
	ip.last_update_date,
	y.image_url,
	ts.sentiment, 
	fs.rating as fs_rating,
	fs.checkinscount as fs_checkinscount,
	fs.tipcount as fs_tipcount,
	fs.userscount as fs_userscount,
	y.rating as y_rating,
	y.review_count as y_reviewcount,
	(
		case when ts.sentiment is null and fs.rating is null and y.rating is null then null
		else (
			(
				case when ts.sentiment is null then 0 else ts.sentiment * 4 end
				+ case when fs.rating is null then 0 else (fs.rating / 2) * 3 end
				+ case when y.rating is null then 0 else y.rating * 3 end)
			/ (
				case when ts.sentiment is null then 0 else 4 end
				+ case when fs.rating is null then 0 else 3 end
				+ case when y.rating is null then 0 else 3 end)
		) end
    ) AS average_rating
from
	ip.interest_points ip
	left join ip.foursquare fs on ip.id = fs.idd
	left join ip.yelp y on ip.id = y.idd
	left join twitter.ip_tweets_sentiment ts on ip.id = ts.ip_id
where
	ip.in_use is true;
	
