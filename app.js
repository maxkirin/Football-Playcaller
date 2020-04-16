//Key which allows access to the various functions of Firebase without needing user account and authentication
var config = {
	"apiKey": "AIzaSyAGyoxhLyCEyJo1Km37xvwKyAyQiR00Z_g",
	"databaseURL": "https://football-playcaller-f3ade.firebaseio.com",
	"storageBucket": "football-playcaller-f3ade.appspot.com",
	"authDomain": "football-playcaller-f3ade.firebaseapp.com",
	"projectId": "1:180449355890:web:a3b76fdf536458dab97aeb"
};
firebase.initializeApp(config);

function submitData(e){
	e.preventDefault();
	document.getElementById('container2').style.visibility = 'visible';		//container 2 is taken from enterscores.html

	//teamTitle, fieldPosition, scoreDifferential, down, distance, quarterNumber, timeRemaining, timeouts
	console.log(document.getElementById('fieldPosition').value);
	console.log(document.getElementById('scoreDifferential').value);
	console.log(document.getElementById('down').value);
	console.log(document.getElementById('distance').value);
	console.log(document.getElementById('quarterNumber').value);
	console.log(document.getElementById('timeRemaining').value);
	console.log(document.getElementById('timeouts').value);
}

const form = document.getElementById('situations');						//div:container 1; form: situations
form.addEventListener('submit', submitData);				//when confirm clicked show container 2

var text = document.getElementById("text");
var buttonw = document.getElementById("write");
var buttond = document.getElementById("data");
var head1 = document.getElementById("head1");

function ShowData(){
	//var input = text.value;
	var db = firebase.database();					//up to football-playcaller-f3ade
	var ref = db.ref();			//up to parent node that we need access to
	
	//ref.orderByValue() - will print the whole table and the number nodes
	//the way it is now will display the away score in order; only showing the highest value
	//child_added event to retrieve list of items
	var testref = ref.orderByChild("AbsScoreDiff").equalTo(0);
	testref.on("value", snap=>{		
		var count = 0;
		snap.forEach(function(childsnap) {
			count = count + 1;
			console.log(childsnap.child("AbsScoreDiff").val());
		});
		
		console.log(count);
			
		//var testkey = snap.key;

		//console.log(testkey);
		//console.log(snap.child().val());
		//console.log(snap.val());
		//console.log(snap.val().key);
													
													
		//var away_score = snap.child("away_score").val();		//each value of child key stored
		//var away_team = snap.child("away_team").val();
		//var game_id = snap.child("game_id").val();
		//var game_url = snap.child("game_url").val();
		//var home_score = snap.child("home_score").val();
		//var home_team = snap.child("home_team").val();
		//var season = snap.child("season").val();
		//var state_of_game = snap.child("state_of_game").val();
		//var type = snap.child("type").val();
		//var week = snap.child("week").val();
		
		
		//$("#awayS").append("\t"+away_score);
		//$("#awayT").append("\t"+away_team);
		//$("#gameI").append("\t"+game_id);
		//$("#gameU").append("\t"+game_url);
		//$("#homeS").append("\t"+home_score);
		//$("#homeT").append("\t"+home_team);
		//$("#seaS").append("\t"+season);
		//$("#stateG").append("\t"+state_of_game);
		//$("#typE").append("\t"+type);
		//$("#weeK").append("\t"+week);
				
	});
}	

function WriteData(){		//when send clicked creates new child
	
	let db = firebase.database();
    let ref = db.ref("example");

    //Create new node key TEST and value TESTDATA
    ref.child("TEST").set("TESTDATA");
    console.log("Data written.")
  }

