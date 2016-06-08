
# Web User Interface

The Web User Interface is built on [NodeJS](https://nodejs.org/) using the framework [SailsJS](http://sailsjs.org/) on the server side and [AngularJS](https://angular.io/) on the client side. It is connected to [PostgreSQL](https://www.postgresql.org/) for managing the data and to [Redis](http://redis.io/) for managing sessions.

The versions are:

 - NodeJS: 4.4.1
 - PostgreSQL: 9.4
 - Redis: 2.8.4
 - For the frameworks and other libraries, check the files `package.json` and `bower.json`

## Structure

The folder is called 	`web` and its structure is the following:
```
web
|___ .tmp
	|	...
|___ api
	|___ controllers
		|   FeedbackController.js
		|   PointsController.js
		|   RatingsController.js
		|   TranslationsController.js
	|___ models
		|   Points.js
		|   Ratings.js
		|   SentimentFeedback.js
		|   TranslationKeys.js
		|   Translations.js
	|___ policies
		|   ...
	|___ responses
		|   ...
	|___ services
		|   PointsService.js
		|   RatingsService.js
		|   SentimentFeedbackService.js
		|   TranslationsService.js
|___ assets
	|___ bower
		|   ...
	|___ images
		|   ...
	|___ js
		|___ controllers
			|   HomeController.js
			|   PointController.js
		|___ dependencies
			| sails.io.js
		|___ services
			|   ChartFactory.js
			|   GoogleMapsFactory.js
			|   PointsService.js
			|   RatingFactory.js
		|   app.js
		|   directives.js
		|   removeDiacritics.js
	|___ styles
		|   styles.less
		|   ...
	|___ templates
		|   home.html
		|   infowindow.html
		|   menubar.html
		|   point.html
		|   typeahead.html
	|   favicon.ico
	|   robots.txt
|___ config
	|___ env
		|   development.js
		|   production.js
	|   autoreaload.js
	|   bootstrap.js
	|   connections.js
	|   models.js
	|   ...
|___ tasks
	|   pipeline.js
	|   ...
|___ tests
	|   ...
|___ views
	|   homepage.ejs
	|   layout.ejs
	|   ...
|   .bowerrc
|   bower.json
|   package.json
|   README.md
|   ...
```

Some comments about the structure:

 - The `.tmp` folder contains the public files, which are automatically generated from a Grunt task of Sails.
 - The `api` folder is the server side logic, which contains the controllers, models and services.
 - The `assets` folder is the client side logic.
	 - The `bower` folder contains the third-party libraries, which are automatically copied from `bower_sources` using a Grunt task.
	 - Mainly Angular code resides inside the `js` folder
		 - The `app.js` file contains the definition of the angular module and some configurations. At the end of the file, there are some parameters that can be modified, for example, the initial latitude and longitude, the original language, the available languages, the options for the markers clusters, etc.
		 - The directives are in the file `directives.js`, the controllers are inside the folder `controllers` and the services inside the folder `services`.
	 - The templates are unified into a single file, as well as the js and css scripts (only in production)
 - About the `config` folder, here are listed the files that were modified
 - In the `tasks` folder there are the Grunt tasks. Some of them were modified to customize the development.
 - The `tests` folder contains the tests for the application, but they are still under develpment.



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
	 - `vi /etc/postgresql/9.4/main/postgresql.conf`
		Change this line `listen_addresses = '*'`
	 - `vi /etc/postgresql/9.1/main/pg_hba.conf`
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
 - `SELECT unaccent('Hôtel');`



### Install Redis

Install Redis and start the service.

 - On Centos, follow this [guide](http://sharadchhetri.com/2014/10/04/install-redis-server-centos-7-rhel-7/)
	 - `yum install wget`
	 - `wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/e/`
	 - `rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-*.rpm`
	 - `yum install redis`
	 - `systemctl start redis.service`
	 - `systemctl enable redis.service`

 - On Ubuntu
	 - `sudo apt-get install redis-server`
	 - `sudo service redis-server`

### Install NodeJS

Install NodeJS downloading from its [site](https://nodejs.org/en/download/) or:

 - On Ubuntu
	 - `curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -`
	 - `sudo apt-get install -y nodejs`
 - On Centos (as root)
	 - `curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -`
	 - `yum -y install nodejs`

Install SailsJS

 - `sudo npm -g install sails`

Install Bower

 - `sudo npm -g install bower`

Install PM2

 - `sudo npm -g install pm2`


### Initialize the application

 - Clone the github repository https://github.com/DMKM1517/SmartCity.git
 - On this directory create the file `login.json` with the content:
```
{
  "dbname": "smart",
  "host" : "<host>",
  "port" : 5432,
  "user" : "dmkm",
  "password" : "<password>"
}
```
 - If using Redis, create a file `web/config/local.js` with the content:
```
module.exports = {
  session: {
    adapter: 'redis'
  },
  sockets: {
    adapter: 'socket.io-redis'
  }
};
```
 - Install the dependencies for the web
	 - `cd web`
	 - `npm install --prod`
	 - `bower install`
 - Run the server using PM2
	 - `pm2 start app.js --name web -x -- --prod`
 - Save the process to startup
	 - `pm2 startup`
	 - (copy and execute the output line)
	 - `pm2 save`
 - The default port is `1337`. To change it, modify the file `config/env/production.js` and uncomment or update the property `port: 80`


### Update the application

 - On the github directory
	 - `git pull`
	 - (make any modifications if needed)
 - Restart the server
	`pm2 restart web`
	 - Check the logs
		`pm2 logs web`
