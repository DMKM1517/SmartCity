
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

select * 
from data_warehouse.dim_location
limit 500;

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
select * 
into data_warehouse.fact_ratings
from (
	select 
		ip.id as ip_id,
		d.date_id,
		l.location_id,
		first_value(y.rating) over (partition by y.rating_partition order by  y.idd, d.date_id) as yelp_rating,
		first_value(y.review_count) over (partition by y.review_count_partition order by y.idd, d.date_id) as yelp_review_count,
		first_value(fs.rating) over (partition by fs.rating_partition order by fs.idd) as fs_rating,
		first_value(fs.checkinscount) over (partition by fs.checkinscount_partition order by fs.idd, d.date_id) as fs_checkinscount,
		first_value(fs.tipcount) over (partition by fs.tipcount_partition order by fs.idd, d.date_id) as fs_tipcount,
		first_value(fs.userscount) over (partition by fs.userscount_partition order by fs.idd, d.date_id) as fs_userscount,
		ts.twitter_sentiment,
		ts.twitter_count
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
				d2.date_id between now() - '1 month'::interval and now() + '3 days'
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
				d2.date_id between now() - '1 month'::interval and now() + '3 days'
			group by d2.date_id, fsall.idd
		) fs on fs.hist_date = d.date_id and ip.id = fs.idd
		left join ( -- all the measures from twitter
			SELECT
				date_ip.date_id as hist_date,
				date_ip.ip_id,
				CASE
					WHEN (avg(t.local_score) IS NULL) --TODO: Replace local_score by sentiment 
						THEN (0)::double precision
				        ELSE avg(t.local_score)
				    END AS twitter_sentiment,
			    count(distinct t.idd) as twitter_count
			FROM
				(
					select
						ip2.ip_id,
						d2.date_id
					from 
						data_warehouse.dim_interest_points ip2,
						data_warehouse.dim_date d2
					where
						d2.date_id between now() - '1 month'::interval and now() + '3 days'
				) date_ip
				left JOIN (
					SELECT
						d3.date_id,
						tip2.ip_id,
						max((t2."timestamp")::date) AS max_timestamp
					FROM
						data_warehouse.dim_date d3
						left join twitter.tweets t2 on true
						left JOIN twitter.tweet_to_ip tip2 ON tip2.twitter_id = t2.idd
					where
						d3.date_id between now() - '1 month'::interval and now() + '3 days'
						and (t2."timestamp")::date <= d3.date_id
						--and tip2.ip_id  = 190578 -- delete!
					GROUP BY d3.date_id, tip2.ip_id
					) lastt ON date_ip.date_id = lastt.date_id and date_ip.ip_id = lastt.ip_id
				left JOIN twitter.tweet_to_ip tip on tip.ip_id = date_ip.ip_id
				left JOIN twitter.tweets t ON tip.twitter_id = t.idd --and (t."timestamp")::date between (lastt.max_timestamp - '1 day'::interval) and lastt.max_timestamp
			WHERE
				(t."timestamp")::date between (lastt.max_timestamp - '1 day'::interval) and lastt.max_timestamp
	--			and date_ip.ip_id = 190578
			GROUP BY date_ip.date_id, date_ip.ip_id
	--		order by 1, 2 --delete!
		) ts on ts.hist_date = d.date_id and ip.id = ts.ip_id
	where
		d.date_id between now() - '1 month'::interval and now()  + '3 days'
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

--tests
select count(*)
from data_warehouse.fact_ratings;

select * 
from data_warehouse.fact_ratings
where
--	yelp_rating is not null
--	or yelp_review_count is not null
--	or fs_rating is not null
--	or fs_checkinscount is not null
	ip_id = 190022
order by date_id 
	

select
	ip.ip_id, d.date_id,
	avg(f.twitter_sentiment) as twitter_sentiment, -- change this to bring the measure you need
	sum(f.twitter_count) as twitter_count
from
	data_warehouse.fact_ratings f
	join data_warehouse.dim_interest_points ip on f.ip_id = ip.ip_id
	join data_warehouse.dim_date d on f.date_id = d.date_id
where
	ip.ip_id in (67140)  --replace this with the ID of the IP
	and d.date_id between now() - '30 days'::interval and now()
group by (d.date_id, ip.ip_id)
order by 1,2;



select
	d.date_id,
	l.commune,
	avg(f.fs_rating)
from
	data_warehouse.fact_ratings f
	join data_warehouse.dim_date d on f.date_id = d.date_id
	join data_warehouse.dim_location l on f.location_id = l.location_id
where d.date_id between  now() - '30 day'::interval and now() and f.yelp_rating is not null and l.commune like 'Lyon%'
group by (d.date_id, l.commune)
order by d.date_id, l.commune;


