CREATE TABLE ip.yelp (
	name varchar(500) NULL,
	rating float4 NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	image_url varchar(500) NULL,
	phone varchar(100) NULL,
	review_count int8 NULL,
	idd int8 NULL
)
;

CREATE TABLE ip.foursquare (
	idd int8 NULL,
	name varchar(500) NULL,
	checkinsCount int8 NULL,
	tipCount int8 NULL,
	usersCount int8 NULL,
	rating float8 NULL	
)
;