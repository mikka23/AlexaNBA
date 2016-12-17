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
function getPlayerName( player ){
  for ( var i = 0; i < players.length; i++ ){
    if ( players[i].personId == player ){
      return players[i].name;
    }
  }
}
function getTeamName( team ){
  for ( var i = 0; i < teams.length; i++ ){
    if ( teams[i].abbreviation == team ){
      return teams[i].teamName;
    }
  }
}
function toTitleCase( str ) {
    return str.replace(/\w\S*/g, function( txt ) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); } );
}
function getLastWord( words ) {
  var n = words.split(' ');
  return n[n.length - 1];
};

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
    var playername = request.slot( 'playername' );
    if ( playername && 'undefined' !== typeof playername ) {
      var playerId   = getPlayerId( toTitleCase( playername ) );

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

          console.log( res );
          response.say( 'On ' + gd + ', in a ' + wl + ', ' + playername + ' scored ' + pts + ' points with ' + reb + ' rebounds, ' + ast + ' assists, ' + stl + ' steals, ' + blk + ' blocks and ' + tov + ' turnovers.' );
          response.send();
        })
        .catch( err => {
          console.log( err );
          response.say( 'Sorry, player not found or understood.' );
          response.send();
        } );
      } else {
        console.log( 'found nothing' );
        response.say( 'Sorry, I did not understand the question.' );
        response.send();
      }
      return false;
  }
);

app.intent('GetUpdate',
  {
    "utterances":[ 
      "get my update"]
  },
  function ( request,response ) {
      // 201933 Blake Griffin
      // 203101 Miles Plumlee
      // 202700 Donatas Motiejunas
      // 202326 DeMarcus Cousins
      // 201988 Patty Mills
      // 203490 Otto Porter
      // 201155 Rodney Stuckey
      // 2037 Jamal Crawford
      // 1627851 Mindaugas Kuzminskas
      // 1627733 Dragan Bender
      // 203498 Shabazz Muhammad
      // 201147 Corey Brewer

      myPlayers = [ 201933, 203101, 202700, 202326, 201988, 203490, 201155, 2037, 1627851, 1627733, 203498, 201147 ];
      myPlayers.forEach( function( playerId ) {
          stats.playerGamelog({ 
            PlayerID: playerId,
            Season: '2016-17',
            SeasonType: 'Regular Season' 
          })
          .then( res => {
            if ( 'undefined' !== typeof res.PlayerGameLog[0] ) {
             var pts = res.PlayerGameLog[0].pts,
                 reb = res.PlayerGameLog[0].reb,
                 ast = res.PlayerGameLog[0].ast,
                 stl = ( '0' !== res.PlayerGameLog[0].stl ) ? res.PlayerGameLog[0].stl + ' steals, ' : '',
                 blk = ( '0' !== res.PlayerGameLog[0].blk ) ? res.PlayerGameLog[0].blk + ' blocks' : '',
                 tov = res.PlayerGameLog[0].tov,
                 wl  = ( 'W' === res.PlayerGameLog[0].wl ) ? 'Win' : 'Loss',
                 gd  = Date.parse( res.PlayerGameLog[0].game_date ) / 1000,
                 td  = new Date(),
                 mu  = getTeamName( getLastWord( res.PlayerGameLog[0].matchup ) ),
                 pn  = getPlayerName( playerId ),
                 min = res.PlayerGameLog[0].min;

                 td.setHours( 0, 0, 0, 0 );
                 yd = ( td.getTime() / 1000 ) - 86400;

              if ( gd >= yd ) {
                response.say( 'In a ' + wl + ' against, ' + mu + ', ' + pn + ' played ' + min + ' minutes.  He scored ' + pts + ' points with ' + reb + ' rebounds, ' + ast + ' assists, ' + stl + blk + ' and ' + tov + ' turnovers.' );
                response.send();
              }
            }
          })
          .catch( err => {
            console.log( err );
          } );
      });

      return false;
  }
);

module.exports = app;