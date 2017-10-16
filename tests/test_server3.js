
// Modules
	var vertigo = require('../lib/vertigo');

// Create server
	var server = vertigo.createServer( 8002 );

// Listen petitions
	server.on( 'hello', function( name, callback ){

		//console.log( name + ' says hello!' );

		callback( null, 'Hi ' + name + ', I am the server' );

	});
