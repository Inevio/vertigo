
// Modules
    var net = require('net');

// Export Module
    module.exports = function( opts, ports ){

        // Variables
        var clientId   = 0;
        var clientKeys = [];
        var client     = {};
        var round      = -1;
        var counter    = 0;
        var operations = {};
        var listeners  = {};
        var result     = {};
        var secure     = null;
        var closed     = false;
        var connected  = false;

        // Local functions
        var addServer = function( opts, port ){

            function getOptions(){

                var options  = opts || {};
                options.port = options.port || port;
                options.time = parseInt( options.time ) || 100;

                if( secure ){

                    var s = require('net').Socket;
                    var sock = new s();
                    sock.connect({ port: port });
                    options.socket = sock;

                }

                return options;

            }

            function reconnect( hadError ){

                if( hadError ){
                    return;
                }

                delete client[ this.vertigoId ];

                if( this.cache ){

                    var data;

                    while( data = getOperationFromCache.call( this ) ){
                        executeOperation( data );
                    }

                }

                this.cache = '';
                clientKeys = Object.keys( client );

                if( connected ){

                    for( var cbId in operations ){

                        if( operations[ cbId ].multi ){
                            operations[ cbId ][ 1 ].apply( null, [ new Error('ECONNRESET') ] );
                        }else{
                            operations[ cbId ].apply( null, [ new Error('ECONNRESET') ] );
                        }

                        delete operations[ cbId ];

                    }

                    connected = false

                }

                if( closed ){
                    return;
                }

                setTimeout( function(){
                    addServer( opts, port );
                }, parseInt( ( opts || {} ).time ) || ( parseInt( ( opts || {} ).time ) === 0 ? 0 : 1000 ) );

            }

            function handleError(){
                reconnect.call( this );
            }

            (secure
                ? net.connect( getOptions(), function(){ console.log('connected') })
                : net.Socket().connect( getOptions() )
              ).on( 'connect', connectedServer )
               .on( 'data', doOperations )
               .on( 'error', handleError )
               .on( 'close', reconnect );

        };

        var connectedServer = function(){

            this.setNoDelay( true );

            connected                = true
            this.vertigoId           = clientId++;
            this.cache               = '';
            client[ this.vertigoId ] = this;
            clientKeys               = Object.keys( client );

        };

        var doOperations = function( data ){

            this.cache += data;

            while( data = getOperationFromCache.call( this ) ){
                executeOperation( data );
            }

        };

        var getOperationFromCache = function(){

            var cut = this.cache.indexOf('\0');

            if( cut === -1 ){
                return;
            }

            var cutted = this.cache.slice( 0, cut );
            this.cache = this.cache.slice( cut + 1 );
            return JSON.parse( cutted );

        };

        var executeOperation = function( data ){

            var cbId = data.shift();
            var end  = data.shift();

            if( operations[ cbId ] ){

                if( operations[ cbId ].multi ){

                    if( end ){
                        operations[ cbId ][ 1 ].apply( null, data );
                    }else{
                        operations[ cbId ][ 0 ].apply( null, data );
                    }

                }else{
                    operations[ cbId ].apply( null, data );
                }

                if( end ){
                    delete operations[ cbId ];
                }

            }else if( listeners[ cbId ] ){

                data.unshift( end );
                listeners[ cbId ].apply( null, data );

            }

        };

        var getClient = function( callback ){

            round = ++round % clientKeys.length || 0;

            if( client[ clientKeys[ round ] ] ){
                callback( client[ clientKeys[ round ] ] );
                return;
            }

            setImmediate( function(){
                getClient( callback );
            });

        };

        var noop = function(){};

        if( typeof setImmediate === 'undefined' ){

            var setImmediate = function( cb ){
                return setTimeout( cb, 0 );
            };

        }

        // Parse arguments
        if( arguments.length < 2 ){

            if( typeof opts !== 'object' ){
                ports = opts;
                opts = null;
            }

        }

        if( opts && opts.ssl ){
            net = require('tls');
            opts = opts.ssl;
            secure = true;
        }

        // Connect with the servers and listen events
        if( ports instanceof Array ){
            ports.forEach(function( p ){ addServer( opts, p ) });
        }else{
            addServer( opts, ports );
        }

        result = {

            request : function(){

                var args = Array.prototype.slice.call( arguments, 0 );
                var cbId = 0;

                if( typeof args[ args.length - 1 ] === 'function' ){

                    cbId                    = ++counter;
                    operations[ cbId ]      = args[ args.length - 1 ];
                    args[ args.length - 1 ] = cbId;

                }else{
                    args[ args.length ] = 0;
                }

                getClient( function( client ){
                    client.write( JSON.stringify( args ) + '\0' );
                });

                return result;

            },

            multiRequest : function(){

                var args = Array.prototype.slice.call( arguments, 0 );
                var cbId = 0;

                if( typeof args[ args.length - 1 ] === 'function' ){

                    cbId                     = ++counter;
                    operations[ cbId ]       = [ args[ args.length - 2 ], args[ args.length - 1 ] ];
                    operations[ cbId ].multi = true;
                    args[ args.length - 2 ]  = cbId;
                    args[ args.length - 1 ]  = true;

                }else{
                    args[ args.length ] = 0;
                }

                getClient( function( client ){
                    client.write( JSON.stringify( args ) + '\0' );
                });

                return result;

            },

            send : function(){

                var args = Array.prototype.slice.call( arguments, 0 );

                args[ args.length ] = 0;

                getClient( function( client ){
                    client.write( JSON.stringify( args ) + '\0' );
                });

                return result;

            },

            on : function( event, callback ){

                listeners[ event ] = callback;

                return result;

            },

            close : function(){

                closed = true;

                for( var i in client ){

                    client[ i ].destroy();
                    client[ i ].cache = '';
                    delete client[ i ];

                }

                clientKeys = Object.keys( client );

            }

        };

        return result;

    };
