module.change_code = 1;
'use strict';

const data = require('nba.js').data;
const stats = require('nba.js').stats;
var players = require('./players.json');
var teams = require('./teams.json');
var Alexa = require( 'alexa-app' );
var app = new Alexa.app( 'AlexaNBA' );

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

      stats.playerGamelog({ 
        PlayerID: playerId,
        Season: '2016-17',
        SeasonType: 'Regular Season' 
      })
      .then( res => {
       var pts = res.PlayerGameLog[0].pts,
           reb = res.PlayerGameLog[0].reb,
           ast = res.PlayerGameLog[0].ast,
           stl = res.PlayerGameLog[0].stl,
           blk = res.PlayerGameLog[0].blk,
           tov = res.PlayerGameLog[0].tov,
           wl  = ( 'W' === res.PlayerGameLog[0].wl ) ? 'Win' : 'Loss',
           gd  = res.PlayerGameLog[0].game_date;

        response.say( 'On ' + gd + ', in a ' + wl + ', ' + playername + ' scored ' + pts + ' points with ' + reb + ' rebounds, ' + ast + ' assists, ' + stl + ' steals, ' + blk + ' blocks and ' + tov + ' turnovers.' );
        response.send();
      })
      .catch( err => {
        response.say( 'Sorry, player not found or understood.' );
        response.send();
      } );
      return false;
  }
);


module.exports = app;