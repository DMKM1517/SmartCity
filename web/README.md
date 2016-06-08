# Smart
Stack:

 - Node js
 - Sails js (server side)
 - PostgreSQL
 - Redis
 - Angular js (client side)

To run:

 - Install [Node js](https://nodejs.org/)
 - Install the packages:
	 - [Sails](http://sailsjs.org): `npm -g install sails` (sudo might be required)
	 - [Bower](http://bower.io/): `npm -g install bower` (sudo might be required)
 - Go to the project's folder
 - Run `npm install`
 - Run `bower install`
 - Create the file (above this web folder) `../login.json`:
 ```javascript
    {
	  "dbname": "",
	  "host" : "",
      "port" : ,
      "user" : "",
      "password" : ""
}
  ```
  
 - For using Redis as sessions and sockets store, create the file `config/local.js`:
 ```javascript
    module.exports = {
      session: {
       adapter: 'redis'
      },
      sockets: {
       adapter: 'socket.io-redis'
      }
};
  ```
 
 - Start the server `sails lift`
 - Check on the browser [http://localhost:1337](http://localhost:1337)

