# Database Schema

[PostgreSQL 9.5](https://www.postgresql.org/) is used as the RDBMS of the system. Below you will find the description of how to create the Database for the application along with the description of the most important relations of the database.


## Deployment

### Install PostgreSQL

Follow any guide, for example the [official one for Ubuntu](https://www.postgresql.org/download/linux/ubuntu/), or follow these steps:

 - Create the file `/etc/apt/sources.list.d/pgdg.list`, and add a line for the repository
`deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main`
 - Import the repository running
     - `wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
      sudo apt-key add -`
     - `sudo apt-get update`
 - Install postgresql
     - `sudo apt-get install postgresql-9.4`

Now, make the database accesible:

 - Change to postgres user
    `sudo su - postgres`
 - Change these config files using `vi` or any other editor
     - `vi /etc/postgresql/9.5/main/postgresql.conf`
        Change this line `listen_addresses = '*'`
     - `vi /etc/postgresql/9.5/main/pg_hba.conf`
        Change this line `host all all 0.0.0.0/0 md5`
 - Reload configuration and restart
     - `psql`
     - `SELECT pg_reload_conf();`
     - `\q`
     - `service postgresql restart`

Create a user and the database:

 - `psql`
 - `create user dmkm with password '<password>';`
 - `create database smart with owner dmkm encoding 'UTF8';`

Install the extension Unaccent (used for searching):

 - `sudo su - postgres`
 - `psql -d smart`
 - `CREATE EXTENSION unaccent;`
 - `SELECT unaccent('H�tel');`


### Run the Database Creation Script

Within the GitHub repository, the necessary scripts for the creation of the database objects can be found on     `SmartCity\SmartSQLScripts`. The scripts have to be run in the following order, inside a database connection to an empty database with enough permissions:

 1.  `db_operational.sql`: Creates the operational tables for the application.
 2.  `db_hist.sql`: Creates the staging history tables for the operational tables, along with the triggers needed in case of any change. 
 3. `db_web.sql`: Creates the tables for the web application.
 4. `db_data_warehouse.sql`: Creates the tables for the data warehouse of the application.


## Description

Below you will find the description of the main relations in the database

### Schema `IP`
This schema contains the main objects for the operational database linked to the Interest Points. The following tables and views are the most relevant:

 - `ip.interest_points`:  Main table of the application. It contains all the information of the IPs retrieved from the GrandLyon open data.
 - `ip.foursquare`:  Table that contains all the information of the IPs retrieved from Foursquare.
 - `ip.yelp`:  Table that contains all the information of the IPs retrieved from Yelp.
 - `ip.v_interest_points_agregated`:  View that aggregates the information of all the interest points, along with the information from the different sources (FourSquare, Yelp, Twitter).


### Schema  `TWITTER`
This schema contains the main objects for the operational database linked to twitter. The following tables and views are the most relevant:

 - `twitter.tweets`:  Main table of the `twitter` schema. It contains all the tweets recollected by the application.
 - `twitter.tweet_to_ip`:  Table that connects a tweet with an IP.
 - `twitter.tweet_to_ip_feedback`:  Table that recollects the feedback from the user interface about the accuracy of a tweet (sentiment and connection with IP).
 - `twitter.keywords`:  Table that contains the search keywords that are used to connect an IP with the different tweets.
 - `twitter.processed_tweets`:  Table that stores the tweets that have been processed (connected to IPs)
 - `twitter.ip_tweets_sentiment`:  View that calculates the current sentiment of the different IPs.
 - `twitter.current_tweets_of_ip`:  View that calculates the current tweets related to the interest points.

### Schema `LANDING`
This schema is used to dump the information retrieved from the data sources and then merge it with the operational data (in the `IP` schema). The following tables are the most relevant:

 - `landing.ip_interest_points`:  Landing table that contains the information of the IPs retrieved from the GrandLyon open data.
 - `landing.ip_foursquare`:  Landing table that contains all the information of the IPs retrieved from Foursquare.
 - `landing.ip_yelp`:  Landing table that contains all the information of the IPs retrieved from Yelp.

### Schema `HIST`
This schema is used to store any change in the operational data (the `IP` schema). The following tables are the most relevant:

- `hist.ip_interest_points`:  History table that contains all the records of the IPs retrieved from the GrandLyon open data.
 - `hist.ip_foursquare`:  History table that contains all the records of the IPs retrieved from Foursquare.
 - `hist.ip_yelp`:  History table that contains all the records of the IPs retrieved from Yelp.


### Schema `DATA_WAREHOUSE`
This schema is used to store the information of the data warehouse of the application. The following tables are the most relevant:

 - `data_warehouse.dim_date`:  Date dimension of the DWH. 
 - `data_warehouse.dim_location`:  Location dimension of the DWH. Contains all the information of the different locations of the application.
 - `data_warehouse.dim_interest_points`:  Interest Points Dimension. Contains all the information of the different interest points of the application.
 - `data_warehouse.fact_ratings`:  Fact table that contains the measures of the different ratings' information.

### Schema `WEB`
This schema contains the tables used specifically by the web interface of the application.  The following tables are the most relevant:

 - `web.translation_keys`:  Contains the translation keys to allow the application function in multi-language.
 - `web.translations`:  Contains the translations of the different elements of the user interface to the languages supported by the application.