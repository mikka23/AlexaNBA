module.change_code = 1;
'use strict';

const data = require('nba.js').data;
const stats = require('nba.js').stats;
var players = require('./players.json');
var teams = require('./teams.json');
var express = require('express');
var bodyParser = require('body-parser');
var Alexa = require( 'alexa-app' );
var app = new Alexa.app( 'AlexaNBA2' );
var nba = require('nba').default;

app.launch( function( request, response ) {
  response.say( 'Welcome to your test skill' ).reprompt( 'Way to go. You got it to run. Bad ass.' ).shouldEndSession( false );
} );

function getPlayerId( player ){
  for ( var i = 0; i < players.length; i++ ){
    if ( players[i].name == player ){
      return players[i].personId;
    }
  }
}

app.error = function( exception, request, response ) {
  console.log(exception)
  console.log(request);
  console.log(response);  
  response.say( 'Sorry an error occured ' + error.message);
};

app.intent('GetPoints',
  {
    "slots":{ 'playername' : 'Athlete' },
    "utterances":[ 
      "get points for {playername}"]
  },
  function ( request,response ) {
    var playername = request.slot( 'playername' ),
        playerId   = getPlayerId( playername );

        data.standings((err, res) => {
          if (err) {
            response.say( playername + playerId );
            return;
          }

          response.say( playername + playerId );
        })
  }
);

module.exports = app;