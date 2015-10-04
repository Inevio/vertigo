
// Modules
	var vertigo = require('../lib/vertigo');

// Create server
	var server = vertigo.createServer( 8000 );

// Listen petitions
	server.on( 'hello', function( name, callback ){
		
		callback( null, 'Hi ' + name + ', I am the server' );

	});
