
-- ========================== Creates the data_warehouse Schema ============================
create schema data_warehouse;


-- ========================== Creates the date dimension ============================
drop table if exists data_warehouse.dim_date;
SELECT
	datum AS date_id,
	EXTRACT(YEAR FROM datum) AS YEAR,
	EXTRACT(MONTH FROM datum) AS MONTH,
	-- Localized month name
	to_char(datum, 'TMMonth') AS MonthName,
	EXTRACT(DAY FROM datum) AS DAY,
	EXTRACT(doy FROM datum) AS DayOfYear,
	-- Localized weekday
	to_char(datum, 'TMDay') AS WeekdayName,
	-- ISO calendar week
	EXTRACT(week FROM datum) AS CalendarWeek,
	to_char(datum, 'dd. mm. yyyy') AS FormattedDate,
	'Q' || to_char(datum, 'Q') AS Quartal,
	to_char(datum, 'yyyy/"Q"Q') AS YearQuartal,
	to_char(datum, 'yyyy/mm') AS YearMonth,
	-- ISO calendar year and week
	to_char(datum, 'iyyy/IW') AS YearCalendarWeek,
	-- Weekend
	CASE WHEN EXTRACT(isodow FROM datum) IN (6, 7) THEN 'Weekend' ELSE 'Weekday' END AS Weekend
INTO data_warehouse.dim_date
FROM (
	-- There are 3 leap years in this range, so calculate 365 * 10 + 3 records
	SELECT '2016-01-01'::DATE + SEQUENCE.DAY AS datum
	FROM generate_series(0,3652) AS SEQUENCE(DAY)
	GROUP BY SEQUENCE.DAY
     ) DQ
ORDER BY 1;

alter table data_warehouse.dim_date add primary key (date_id);
create index on data_warehouse.dim_date (YEAR);
create index on data_warehouse.dim_date (MONTH);
create index on data_warehouse.dim_date (MonthName);
create index on data_warehouse.dim_date (DAY);
create index on data_warehouse.dim_date (DayOfYear);
create index on data_warehouse.dim_date (WeekdayName);
create index on data_warehouse.dim_date (CalendarWeek);
create index on data_warehouse.dim_date (Quartal);
create index on data_warehouse.dim_date (YearQuartal);
create index on data_warehouse.dim_date (YearMonth);
create index on data_warehouse.dim_date (YearCalendarWeek);
create index on data_warehouse.dim_date (Weekend);


-- ========================== Creates the location dimension ============================
--drop table and secuence if exists
drop table if exists data_warehouse.dim_location;
drop sequence if exists location_seq;

--Create the sequence
create sequence location_seq;

select
	nextval('location_seq') as location_id,
	commune,
	postal_code,
	avg(coordinates_lat) as coordinates_lat,
	avg(coordinates_long) as coordinates_long
into data_warehouse.dim_location
from ip.interest_points
group by commune, postal_code;

alter table data_warehouse.dim_location alter column location_id set default nextval('location_seq');
alter table data_warehouse.dim_location add primary key (location_id);
create index on data_warehouse.dim_location (commune);
create index on data_warehouse.dim_location (postal_code);

-- ========================== Creates the interest points dimension ============================

drop table if exists data_warehouse.dim_interest_points;
SELECT
	interest_points.id as ip_id,
	interest_points.type,
	interest_points.name
into data_warehouse.dim_interest_points
FROM ip.interest_points;
alter table data_warehouse.dim_interest_points add primary key (ip_id);
create index on data_warehouse.dim_interest_points (type);
create index on data_warehouse.dim_interest_points (name);


-- ========================== Creates the Fact Table ============================

drop table if exists data_warehouse.fact_ratings;
select 
	*,
	(
		case when twitter_sentiment is null and fs_rating is null and yelp_rating is null then null
		else (
			(
				case when twitter_sentiment is null then 0 else twitter_sentiment * 4 end
				+ case when fs_rating is null then 0 else (fs_rating / 2) * 3 end
				+ case when yelp_rating is null then 0 else yelp_rating * 3 end)
			/ (
				case when twitter_sentiment is null then 0 else 4 end
				+ case when fs_rating is null then 0 else 3 end
				+ case when yelp_rating is null then 0 else 3 end)
		) end
    ) AS average_rating
into data_warehouse.fact_ratings
from (
	select 
		ip.id as ip_id,
		d.date_id,
		l.location_id,
		first_value(y.rating) over (partition by y.rating_partition, y.idd order by d.date_id) as yelp_rating,
		first_value(y.review_count) over (partition by y.review_count_partition, y.idd order by d.date_id) as yelp_review_count,
		first_value(fs.rating) over (partition by fs.rating_partition, fs.idd order by d.date_id) as fs_rating,
		first_value(fs.checkinscount) over (partition by fs.checkinscount_partition, fs.idd order by d.date_id) as fs_checkinscount,
		first_value(fs.tipcount) over (partition by fs.tipcount_partition, fs.idd order by d.date_id) as fs_tipcount,
		first_value(fs.userscount) over (partition by fs.userscount_partition, fs.idd order by d.date_id) as fs_userscount,
		first_value(ts.twitter_sentiment) over (partition by ts.twitter_sentiment_partition, ts.ip_id order by d.date_id) as twitter_sentiment,
		first_value(ts.twitter_count) over (partition by ts.twitter_count_partition, ts.ip_id order by d.date_id) as twitter_count
--		ts.twitter_sentiment,
--		ts.twitter_count
	from 
		data_warehouse.dim_date d
		join ip.interest_points ip on true
		left join data_warehouse.dim_location l on ip.postal_code = l.postal_code and ip.commune = l.commune
		left join ( -- all the measures from Yelp
			select 
				d2.date_id as hist_date,
				yall.idd,
				avg(y2.rating) as rating,
				sum(case when avg(y2.rating) is null then 0 else 1 end) over (order by yall.idd, d2.date_id) as rating_partition,
				avg(y2.review_count) as review_count,
				sum(case when avg(y2.review_count) is null then 0 else 1 end) over (order by yall.idd, d2.date_id) as review_count_partition
			from
				data_warehouse.dim_date d2
				join (select distinct idd from hist.ip_yelp) yall on true
				left join hist.ip_yelp y2 on y2.hist_date::date = d2.date_id and yall.idd = y2.idd
			where
				d2.date_id between now() - '3 month'::interval and now() + '3 days'
				--and yall.idd = 190022
			group by d2.date_id, yall.idd
			order by d2.date_id, yall.idd
		) y on y.hist_date = d.date_id and  ip.id = y.idd 
		left join ( -- all the measures from Foursquare
			select 
				d2.date_id as hist_date,
				fsall.idd,
				avg(fs2.rating) as rating,
				sum(case when avg(fs2.rating) is null then 0 else 1 end) over (order by fsall.idd, d2.date_id) as rating_partition,
				avg(fs2.checkinscount) as checkinscount,
				sum(case when avg(fs2.checkinscount) is null then 0 else 1 end) over (order by fsall.idd, d2.date_id) as checkinscount_partition,
				avg(fs2.tipcount) as tipcount,
				sum(case when avg(fs2.tipcount) is null then 0 else 1 end) over (order by fsall.idd, d2.date_id) as tipcount_partition,
				avg(fs2.userscount) as userscount,
				sum(case when avg(fs2.userscount) is null then 0 else 1 end) over (order by fsall.idd, d2.date_id) as userscount_partition
			from
				data_warehouse.dim_date d2
				join (select distinct idd from hist.ip_foursquare) fsall on true
				left join hist.ip_foursquare fs2 on fs2.hist_date::date = d2.date_id and fsall.idd = fs2.idd
			where
				d2.date_id between now() - '3 month'::interval and now() + '3 days'
			group by d2.date_id, fsall.idd
		) fs on fs.hist_date = d.date_id and ip.id = fs.idd
		left join ( -- all the measures from twitter
			select 
				d2.date_id as hist_date,
				tall.ip_id,
				avg(t3.twitter_sentiment) as twitter_sentiment,
				sum(case when avg(t3.twitter_sentiment) is null then 0 else 1 end) over (order by tall.ip_id, d2.date_id) as twitter_sentiment_partition,
				sum(t3.twitter_count) as twitter_count,
				sum(case when sum(t3.twitter_count) is null then 0 else 1 end) over (order by tall.ip_id, d2.date_id) as twitter_count_partition
			from
				data_warehouse.dim_date d2
				join (select distinct ip_id from twitter.tweet_to_ip) tall on true
				left join (
					select "timestamp"::date as hist_date, tip2.ip_id, avg(t2.sentiment) as twitter_sentiment, count(t2.idd) as twitter_count
					from 
						twitter.tweets t2
						JOIN twitter.tweet_to_ip tip2 ON tip2.twitter_id = t2.idd
					group by "timestamp"::date, tip2.ip_id
				)t3 on t3.hist_date = d2.date_id and tall.ip_id = t3.ip_id
			where
				d2.date_id between now() - '3 month'::interval and now() + '3 days'
			group by d2.date_id, tall.ip_id
			--limit 500
		) ts on ts.hist_date = d.date_id and ip.id = ts.ip_id
	where
		d.date_id between now() - '3 month'::interval and now()  + '3 days'
	) full_table
where
	full_table.yelp_rating is not null 
	or full_table.yelp_review_count is not null 
	or full_table.fs_rating is not null 
	or full_table.fs_checkinscount is not null 
	or full_table.fs_tipcount is not null 
	or full_table.fs_userscount is not null 
	or full_table.twitter_sentiment is not null 
	or full_table.twitter_count is not null
order by full_table.date_id, full_table.ip_id, full_table.location_id;

alter table data_warehouse.fact_ratings add primary key (ip_id, date_id, location_id);
create index on data_warehouse.fact_ratings (yelp_rating);
create index on data_warehouse.fact_ratings (yelp_review_count);
create index on data_warehouse.fact_ratings (fs_rating);
create index on data_warehouse.fact_ratings (fs_checkinscount);
create index on data_warehouse.fact_ratings (fs_tipcount);
create index on data_warehouse.fact_ratings (fs_userscount);
create index on data_warehouse.fact_ratings (twitter_sentiment);
create index on data_warehouse.fact_ratings (twitter_count);

