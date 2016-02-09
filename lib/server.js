
// Modules
	var net = require('net');

// Export module
	module.exports = function( opts, port, host, restrict ){

		// Variables
		var operations	    = {};
		var result			= {};
		var server          = null;
		var restrictEnabled = restrict instanceof Array && !!restrict.length;
		var clients         = [];

		// Parse arguments
		if( arguments.length < 3 ){
			restrict = host;
			host = port;
			port = opts;
			opts = null;
		}

		if( opts && opts.ssl ){
			net = require('tls');
			if( !opts.ssl.rejectUnauthorized ){
				opts.ssl.rejectUnauthorized = true;
			}
			opts = opts.ssl;
		}

		// Create server
		server = net.createServer( opts || {}, function( socket ){

			if(
				restrictEnabled &&
				restrict.indexOf( socket.remoteAddress ) === -1
			){
				socket.end();
				return;
			}

			clients.push( socket );

			var cache = '';

			// Local functions
			var doOperations = function( data ){
				cache += data;

				while( data = getOperationFromCache() ){
					executeOperation( data );
				}

			};

			var getOperationFromCache = function(){

				var cut = cache.indexOf('\0');

				if( cut === -1 ){
					return;
				}

				var cutted = cache.slice( 0, cut );
				cache      = cache.slice( cut + 1 );

				return JSON.parse( cutted );

			};

			var endOfOperation = function( args, cbId ){

				args = Array.prototype.slice.call( args, 0 );

				args.unshift( 1 );
				args.unshift( cbId );
				socket.write( JSON.stringify( args ) + '\0' );

			};

			var multiOperation = function( args, cbId ){

				args = Array.prototype.slice.call( args, 0 );

				args.unshift( 0 );
				args.unshift( cbId );
				socket.write( JSON.stringify( args ) + '\0' );

			};

			var executeOperation = function( data ){

				var name  = data.shift();
				var cbId  = data.pop();
				var multi = false;

				if( typeof cbId !== 'number' ){

					multi = !!cbId;
					cbId  = data.pop();

				}

				if( operations[ name ] ){

					if( multi ){

						data.push( function(){
							multiOperation( arguments, cbId );
						});

					}

					data.push( function(){
						endOfOperation( arguments, cbId );
					});

					operations[ name ].apply( null, data );

				}

				// To Do -> What has to happen if it is undefined?

			};

			// Listen Events
			socket.on( 'data', doOperations );
			socket.on( 'error', function(){});
			socket.on( 'close', function(){
				
				clients = clients.filter(function( item ){
					return item !== socket;
				});

			});

		});
	
		server.listen( port, host );

		result = {

			on : function( event, callback ){

				operations[ event ] = callback;

				return result;

			},

			onMulti : function( event, callback ){

				operations[ event ] = callback;

				return result;

			},

			broadcast : function(){


				var args = Array.prototype.slice.call( arguments, 0 );
				
				clients.forEach( function( socket ){
					socket.write( JSON.stringify( args ) + '\0' );
				});

				return result;

			}

		};

		return result;

	};
