
-- Creates the History Schema
create schema hist;


-- Creates the history tables
CREATE TABLE hist.ip_foursquare (
	hist_date timestamp,
	hist_action_taken varchar(20),
	idd int8,
	"name" varchar(500),
	checkinscount int8,
	tipcount int8,
	userscount int8,
	rating float8,
	flag varchar(100),
	last_update_date timestamp
);
CREATE INDEX ON hist.ip_foursquare (hist_date);
CREATE INDEX ON hist.ip_foursquare (idd);
CREATE INDEX ON hist.ip_foursquare (rating);


CREATE TABLE hist.ip_interest_points (
	hist_date timestamp,
	hist_action_taken varchar(20),
	id int4,
	"type" varchar(250),
	type_detail text,
	"name" varchar(500),
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
	coordinates_lat float8,
	coordinates_long float8,
	source_create_date varchar(250),
	source_last_update varchar(250),
	sentiment int4,
	in_use bool,
	flag varchar(50),
	last_update_date timestamp
);
CREATE INDEX ON hist.ip_interest_points (hist_date);
CREATE INDEX ON hist.ip_interest_points (id);

CREATE TABLE hist.ip_yelp (
	hist_date timestamp,
	hist_action_taken varchar(20),
	idd int8,
	"name" varchar(500),
	rating float4,
	latitude float8,
	longitude float8,
	image_url varchar(500),
	phone varchar(100),
	review_count int8,
	flag varchar(100),
	last_update_date timestamp
);
CREATE INDEX ON hist.ip_yelp (hist_date);
CREATE INDEX ON hist.ip_yelp (idd);
CREATE INDEX ON hist.ip_yelp (rating);



-- CREATE FUNCTION FOR FOURSQUARE LOGS

CREATE OR REPLACE FUNCTION hist.log_foursquare()
  RETURNS trigger AS
$BODY$
BEGIN
	
	IF (TG_OP = 'UPDATE') THEN
	INSERT INTO hist.ip_foursquare
	(hist_date, hist_action_taken, idd, "name", checkinscount, tipcount, userscount, rating, flag, last_update_date)
	VALUES(now(), 'changed', NEW.idd, NEW."name", NEW.checkinscount, NEW.tipcount, NEW.userscount, NEW.rating, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	ELSEIF (TG_OP = 'DELETE') THEN
	INSERT INTO hist.ip_foursquare
	(hist_date, hist_action_taken, idd, "name", checkinscount, tipcount, userscount, rating, flag, last_update_date)
	VALUES(now(), 'deleted', OLD.idd, OLD."name", OLD.checkinscount, OLD.tipcount, OLD.userscount, OLD.rating, OLD.flag, OLD.last_update_date);
	RETURN OLD;

	ELSIF (TG_OP = 'INSERT') THEN
	INSERT INTO hist.ip_foursquare
	(hist_date, hist_action_taken, idd, "name", checkinscount, tipcount, userscount, rating, flag, last_update_date)
	VALUES(now(), 'new', NEW.idd, NEW."name", NEW.checkinscount, NEW.tipcount, NEW.userscount, NEW.rating, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	END IF;
	
END;
$BODY$
LANGUAGE plpgsql;

-- CREATE TRIGGER FOR FOURSQUARE LOGS

CREATE TRIGGER log_foursquare
  AFTER UPDATE OR DELETE OR INSERT
  ON ip.foursquare
  FOR EACH ROW
  EXECUTE PROCEDURE hist.log_foursquare();
  
 
-- CREATE FUNCTION FOR INTEREST POINTS LOGS
  
CREATE OR REPLACE FUNCTION hist.log_interest_points()
  RETURNS trigger AS
$BODY$
BEGIN

	IF (TG_OP = 'UPDATE') THEN
	INSERT INTO hist.ip_interest_points
	(hist_date, hist_action_taken, id, "type", type_detail, "name", address, postal_code, 
	commune, telephone, fax, telephone_fax, email, website, facebook, ranking, open_hours, 
	price, price_min, price_max, producer, coordinates_lat, coordinates_long, source_create_date, 
	source_last_update, sentiment, in_use, flag, last_update_date)
	VALUES(now(), 'changed', NEW.id, NEW."type", NEW.type_detail, NEW."name", NEW.address, NEW.postal_code, 
	NEW.commune, NEW.telephone, NEW.fax, NEW.telephone_fax, NEW.email, NEW.website, NEW.facebook, NEW.ranking, NEW.open_hours, 
	NEW.price, NEW.price_min, NEW.price_max, NEW.producer, NEW.coordinates_lat, NEW.coordinates_long, NEW.source_create_date, 
	NEW.source_last_update, NEW.sentiment, NEW.in_use, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	ELSIF (TG_OP = 'DELETE') THEN
	INSERT INTO hist.ip_interest_points
	(hist_date, hist_action_taken, id, "type", type_detail, "name", address, postal_code, 
	commune, telephone, fax, telephone_fax, email, website, facebook, ranking, open_hours, 
	price, price_min, price_max, producer, coordinates_lat, coordinates_long, source_create_date, 
	source_last_update, sentiment, in_use, flag, last_update_date)
	VALUES(now(), 'deleted', OLD.id, OLD."type", OLD.type_detail, OLD."name", OLD.address, OLD.postal_code, 
	OLD.commune, OLD.telephone, OLD.fax, OLD.telephone_fax, OLD.email, OLD.website, OLD.facebook, OLD.ranking, OLD.open_hours, 
	OLD.price, OLD.price_min, OLD.price_max, OLD.producer, OLD.coordinates_lat, OLD.coordinates_long, OLD.source_create_date, 
	OLD.source_last_update, OLD.sentiment, OLD.in_use, OLD.flag, OLD.last_update_date);
	RETURN OLD;

	ELSIF (TG_OP = 'INSERT') THEN
	INSERT INTO hist.ip_interest_points
	(hist_date, hist_action_taken, id, "type", type_detail, "name", address, postal_code, 
	commune, telephone, fax, telephone_fax, email, website, facebook, ranking, open_hours, 
	price, price_min, price_max, producer, coordinates_lat, coordinates_long, source_create_date, 
	source_last_update, sentiment, in_use, flag, last_update_date)
	VALUES(now(), 'new', NEW.id, NEW."type", NEW.type_detail, NEW."name", NEW.address, NEW.postal_code, 
	NEW.commune, NEW.telephone, NEW.fax, NEW.telephone_fax, NEW.email, NEW.website, NEW.facebook, NEW.ranking, NEW.open_hours, 
	NEW.price, NEW.price_min, NEW.price_max, NEW.producer, NEW.coordinates_lat, NEW.coordinates_long, NEW.source_create_date, 
	NEW.source_last_update, NEW.sentiment, NEW.in_use, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	END IF;
	
END;
$BODY$
LANGUAGE plpgsql;

-- CREATE TRIGGER FOR INTEREST POINTS LOGS

CREATE TRIGGER log_interest_points
  AFTER UPDATE OR DELETE OR INSERT
  ON ip.interest_points
  FOR EACH ROW
  EXECUTE PROCEDURE hist.log_interest_points();
  
  

-- CREATE FUNCTION FOR YELP LOGS
  
CREATE OR REPLACE FUNCTION hist.log_yelp()
  RETURNS trigger AS
$BODY$
BEGIN

	IF (TG_OP = 'UPDATE') THEN
	INSERT INTO hist.ip_yelp
	(hist_date, hist_action_taken, idd, "name", rating, latitude, longitude, image_url, 
	phone, review_count, flag, last_update_date)
	VALUES(now(), 'changed', NEW.idd, NEW."name", NEW.rating, NEW.latitude, NEW.longitude, NEW.image_url, 
	NEW.phone, NEW.review_count, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	ELSIF (TG_OP = 'DELETE') THEN
	INSERT INTO hist.ip_yelp
	(hist_date, hist_action_taken, idd, "name", rating, latitude, longitude, image_url, 
	phone, review_count, flag, last_update_date)
	VALUES(now(), 'deleted', OLD.idd, OLD."name", OLD.rating, OLD.latitude, OLD.longitude, OLD.image_url, 
	OLD.phone, OLD.review_count, OLD.flag, OLD.last_update_date);
	RETURN OLD;

	ELSIF (TG_OP = 'INSERT') THEN
	INSERT INTO hist.ip_yelp
	(hist_date, hist_action_taken, idd, "name", rating, latitude, longitude, image_url, 
	phone, review_count, flag, last_update_date)
	VALUES(now(), 'new', NEW.idd, NEW."name", NEW.rating, NEW.latitude, NEW.longitude, NEW.image_url, 
	NEW.phone, NEW.review_count, NEW.flag, NEW.last_update_date);
	RETURN NEW;
	
	END IF;
	
END;
$BODY$
LANGUAGE plpgsql;

-- CREATE TRIGGER FOR YELP LOGS

CREATE TRIGGER log_yelp
  AFTER UPDATE OR DELETE OR INSERT
  ON ip.yelp
  FOR EACH ROW
  EXECUTE PROCEDURE hist.log_yelp();
  

