/**
 * The Server namespace
 */
var Server = (function(){

    var clients = [];
    var PORT = process.env.PORT || 3000,
        START_MSG = "start",

        express = require('express'),
        app = express(),
        http = require('http').Server(app),
        io = require('socket.io')(http),

        server = undefined,
        socket = undefined,
        player1 = undefined,
        player2 = undefined,


        /**
         * Connection server answer
         */
        serverAnswer = function(req, res) {
            // Send HTML headers and message
            res.header("Access-Control-Allow-Origin", "*")
            res.sendFile(__dirname + '/index.html');
        },


        /**
         * Callback of messages sent by players
         */
        msgFromPlayer = function(message, player) {
            /* Send start message for all players */
            if (message === START_MSG) {
                sendAll(message);
            } else {
                sendAll(message, [player]);
            }
        },


        /*
         * Broadcast message to all clients
         */
        sendAll = function (msg, except){
            if (typeof except === "undefined") {
                except = [];
            }

            clients.filter(function(client) {
                return except.indexOf(client) === -1
            }).forEach(function(client) {
                client.send(msg);
            });
        },

        /**
         * Client connection callback
         */
        onConnectionCallback = function (client) {
            clients.push(client);

            // If not exists a player 1, create it
            if (!player1) {
                player1 = client;
                console.log("player 1 Connected");

            // If not exists player 2, create it
            } else if (!player2) {
                player2 = client;
                console.log( "player 2 connected");

            // Otherwise, notify client that there are too many user to play
            } else {
                client.send({erro:'Too many Users :/'});
            }

            client.on('message', msgFromPlayer);
            client.on('disconnect', function() {
                var i = clients.indexOf(client);
                if (i !== -1) {
                    clients.splice(i, 1);
                }

                // TODO remove
                if (player1 === client) {
                    delete player1;
                }

                if (player2 === client) {
                    delete player2;
                }
            });
        };

        /**
         * Initialization method. Bind the server and socket events
         */
        (function() {

            // Start the server
            //server = http.createServer(serverAnswer);
            app.get("/", serverAnswer);
            app.use(express.static(__dirname + "/"));

            //server.listen(PORT); // Define socket port to listen
            http.listen(PORT, function () {
                console.log([
                    "Node-Pong listening on port ", PORT,
                    "\nOpen two different tabs or browsers at ",
                    "localhost:", PORT, " and connect players",
                    "\n\nEnjoy the game : )"
                ].join(""));
            });

            // Instantiate socket.io using the created server
            //socket = io.listen(http);
            io.on('connection', onConnectionCallback);
        })();


        /* NameSpace Public Methods */
        return {
            server: http
        }
})();
