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
	ip.sentiment,
	fs.rating as fs_rating,
	fs.checkinscount as fs_checkinscount,
	fs.tipcount as fs_tipcount,
	fs.userscount as fs_userscount,
	y.rating as y_rating,
	y.review_count as y_reviewcount,
	(SELECT AVG(rating)
        FROM   (VALUES(abs(ip.sentiment)),
                      (fs.rating / 2),
                      (y.rating)) T (rating)) AS averagerating
from
	ip.interest_points ip
	left join ip.foursquare fs on ip.id = fs.idd
	left join ip.yelp y on ip.id = y.idd
where
	ip.in_use is true;

