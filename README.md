
# Vertigo

Blazing fast communication between Node.js processes

## How to install Vertigo
You can install Vertigo using Node Package Manager (npm):
```
npm install vertigo
```

## Features
* Supports Request/Reply communication.
* Supports Send without Reply communication.
* Supports multiple server using round robin.
* Fault tolerant: clients will reconnect to servers even if server goes down and comes back later.
* Extremely fast (disables TCP Nagle's algorithm).
* Zero dependencies on other libraries.
* Block non-desired IPs.

## Examples
### Request/Reply: Server with one client
#### Server
```js
// Modules
  var vertigo = require('vertigo');

// Create server
  var server = vertigo.createServer( 8000 );

// Listen petitions
  server.on( 'hello', function( name, callback ){
    callback( null, 'Hi ' + name + ', I am the server' );
  });

```
#### Client
```js
// Modules
  var vertigo = require('vertigo');

// Create client
  var client = vertigo.createClient( 8000 );

// Make a petition
  client.request( 'hello', 'John', function( error, response ){
    console.log( 'Server says', response );
  });
```

### Request/Reply: 2 server with one client (Round robin)
#### Server 1
```js
// Modules
  var vertigo = require('vertigo');

// Create server
  var server = vertigo.createServer( 8000 );

// Listen petitions
  server.on( 'hello', function( name, callback ){
    callback( null, 'Hi ' + name + ', I am the server 1' );
  });

```
#### Server 2
```js
// Modules
  var vertigo = require('vertigo');

// Create server
  var server = vertigo.createServer( 8001 );

// Listen petitions
  server.on( 'hello', function( name, callback ){
    callback( null, 'Hi ' + name + ', I am the server 2' );
  });

```
#### Client
```js
// Modules
  var vertigo = require('vertigo');

// Create client
  var client = vertigo.createClient( 8000, 8001 );

// Make a petition
  client.request( 'hello', 'John', function( error, response ){
    console.log( 'Server says', response );
  });
```

### Send: Server with one client
#### Server
```js
// Modules
  var vertigo = require('vertigo');

// Create server
  var server = vertigo.createServer( 8000 );

// Listen petitions
  server.on( 'hello', function( name ){
    console.log( 'I received a message from ' + name );
  });

```
#### Client
```js
// Modules
  var vertigo = require('vertigo');

// Create client
  var client = vertigo.createClient( 8000 );

// Make a petition
  client.send( 'hello', 'John' );
```

### Block non-desired connections from unknown IPs
#### Server
```js
// Modules
  var vertigo = require('vertigo');

// Create server
  var server = vertigo.createServer(

    8000,
    null, // Host definition, use falsy values for autoconfiguration
    [ '127.0.0.1', '192.168.1.42' ] // Accepted IPs. If it isn't defined all IPs are accepted.

  );

// Listen petitions
  server.on( 'hello', function( name ){
    console.log( 'I received a message from ' + name );
  });

```

## Migrating from vertigo
You can use Vertigo safely, currently the API is the same in both libraries.

## Changelog
* 0.0.6 ( 2015/10/04 ): Support multirequests. Improved message transmission. Renamed from Hermod to Vertigo.
* 0.0.5 ( 2014/06/26 ): Limit connections for specific IPs. Support host definition in server.
* 0.0.4 ( 2014/04/02 ): Optimized and `send()` method support.
* 0.0.3 ( 2014/04/02 ): Optimized and better documentation.
* 0.0.2 ( 2014/04/02 ): Optimized and prevent chuncked commands.
* 0.0.1 ( 2014/03/20 ): First version.

## To Do List
* Support encrypted communications
* `shout()` client method
* `close()` client method
* Authentication support
* Middleware support
