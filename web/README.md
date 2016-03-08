# Smart
Stack:

 - Node js
 - Sails js (server side)
 - Angular js (client side)
 - PostgreSQL

To run:

 - Install [Node js](https://nodejs.org/)
 - Install the packages:
	 - [Sails](http://sailsjs.org): `npm -g install sails` (sudo might be required)
	 - [Bower](http://bower.io/): `npm -g install bower` (sudo might be required)
 - Go to the project's folder
 - Run `npm install`
 - Run `bower install`
 - Create or edit the file `config/local.js`:
	```javascript
	module.exports = {
		connections: {
		    smartPostgresql: {
		      adapter: 'sails-postgresql',
		      host: '<localhost_or_IP>',
		      user: '<user>',
		      password: '<password>',
		      database: 'smart',
		      port: 5432
			}
		}
	} 
  ```

 - Start the server `sails lift`
 - Check on the browser [http://localhost:1337](http://localhost:1337)
