const nba = require('nba.js').default;

nba.data.players({
  year: 2016
}).then(function(res) {
  //console.log(res);

  for(var i = 0; i < res.league.standard.length; i++){
  	console.log(res.league.standard[i].firstName + " " + res.league.standard[i].lastName);
  }


}).catch(function(err) {
  console.error(err);
});

  