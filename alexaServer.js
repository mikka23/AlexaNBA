const nba = require('nba.js').default;
var players = require('./players.json');
var teams = require('./teams.json');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//console.log(players);

// this also works
/*nba.stats.allPlayers(function(err, res) {
  if (err) {
    console.error(err);
    return;
  }

  //console.log(res);
});*/

var verifier = require('alexa-verifier');
 
 
var app = express();
 
// the alexa API calls specify an HTTPS certificate that must be validated. 
// the validation uses the request's raw POST body which isn't available from 
// the body parser module. so we look for any requests that include a 
// signaturecertchainurlg HTTP request header, parse out the entire body as a 
// text string, and set a flag on the request object so other body parser 
// middlewares don't try to parse the body again 
app.use(function(req, res, next) {
  if (!req.headers.signaturecertchainurl) {
    return next();
  }
 
  // mark the request body as already having been parsed so it's ignored by 
  // other body parser middlewares 
  req._body = true;
  req.rawBody = '';
  req.on('data', function(data) {
    return req.rawBody += data;
  });
  req.on('end', function() {
    var cert_url, er, error, requestBody, signature;
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (error) {
      er = error;
      req.body = {};
    }
    cert_url = req.headers.signaturecertchainurl;
    signature = req.headers.signature;
    requestBody = req.rawBody;
    verifier(cert_url, signature, requestBody, function(er) {
      if (er) {
        console.error('error validating the alexa cert:', er);
        res.status(401).json({ status: 'failure', reason: er });
      } else {
        next();
      }
    });
  });
});

function getPlayerId(player){
	for(var i = 0; i < players.length; i++){
		if(players[i].name == player){
			return players[i].personId;
		}
	}
}

function getTeamName(teamcode){
	for(var i = 0; i < teams.length; i++){
		if(teams[i].abbreviation == teamcode){
			return teams[i].teamName;
		}
	}
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
}

function getSecondPart(str) {
    return str.split('/')[1];
}


app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send("hello");
})

app.post('/', function(req, res){

	//sample data to make alexa return a response
	var data = {
		"version": "1.0",
		"response": {
			"outputSpeech": {
				"type": "PlainText",
				"text": "Please work!"
			},
			"shouldEndSession": true
		},
		"sessionAttributes": {}
	}

	var info = req.body.request;



    //handle different types of requests
    if(info.type == 'LaunchRequest'){
        data.response.outputSpeech.text = "Hello. Ask me how many points any NBA player has scored and I'll tell you the stats from their most recent game."
        data.response.shouldEndSession = false;
        res.send(data);
    }

    else if(info.type=='SessionEndedRequest'){}

    else if(info.type=='IntentRequest'){


    if(info.intent.name == "AMAZON.HelpIntent"){
        console.log("help intent");
        data.response.outputSpeech.text = "You can ask me how many points any NBA player has scored in their most recent game."
        data.response.shouldEndSession = false;
        res.send(data);
    }

    else if(info.intent.name == "AMAZON.CancelIntent" || info.intent.name == "AMAZON.StopIntent"){
        console.log("cancel intent");
        data.response.outputSpeech.text = "Good-bye."
        data.response.shouldEndSession = true;
        res.send(data);
    }

    else if(info.intent.name = "GetPoints"){

	   	var player = info.intent.slots.player.value;
	   	if(player == null || player == "" || player == undefined){
	   		data.response.outputSpeech.text = "Sorry, I didn't understand which player you meant. Which player did you mean?"
	   		data.response.shouldEndSession = false;
	   		res.send(data);
	   	}
	   	else{
	   	console.log(player);
	   	console.log(player + " => " + toTitleCase(player));

	   	if(toTitleCase(player).substr(0,2) == "De" && player.charAt(2) == " "){
	   		player = player.slice(0,2) + player.slice(3);
	   		console.log(player);
	   	}
	   	player = (toTitleCase(player) == "Karl Anthony Towns" ? "Karl-Anthony Towns" : player);

		var playerId = getPlayerId(toTitleCase(player));
		console.log(playerId);

		nba.data.playerGamelog({
		  year: 2016,
		  personId: playerId
		}).then(function(resp) {
			//console.log(resp.league.standard[0]);
			var gameURLcode = resp.league.standard[0].gameUrlCode;
			console.log("gameurlcode", gameURLcode);
			var secondPart = getSecondPart(gameURLcode);
			var teamCode;
			if(resp.league.standard[0].isHomeGame){
				teamCode = secondPart.substr(0, 3);
			}
			else{
				teamCode = secondPart.substr(3,5);
			}
			console.log(teamCode);
			var tn = getTeamName(teamCode);
		  	console.log(resp.league.standard[0].stats.points);
		    data.response.outputSpeech.text = player + " scored " + resp.league.standard[0].stats.points + " points against the " + tn ;
        	data.response.shouldEndSession = true;
        	res.send(data);

		}).catch(function(err) {
		  	console.error(err);
        	data.response.outputSpeech.text = "Sorry, I misheard the player. Say it again please";
        	data.response.shouldEndSession = false;
        	res.send(data);
		});

    } //if its an intent request

}

} //if somehow its actually what our skill was supposed to do

})
var port = process.env.PORT || 3000;
app.listen(port, function () {

    console.log('NBA Server is up!');

});