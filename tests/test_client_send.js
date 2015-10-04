
// Modules
	var vertigo = require('../lib/vertigo');

// Create client
	var client = vertigo.createClient( 8000 );

// Listen petitions
	
	var counter = 0;
	var resEnd  = 0;

	setInterval( function(){

		client.send( 'hello', 'John #'+(counter++) );
		resEnd++;

	}, 0 );

	setInterval( function(){
		console.log( resEnd, new Date() );
		resEnd = 0;
	}, 1000 );
