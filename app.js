function submitData(e){
e.preventDefault();
document.getElementById('container2').style.visibility = 'visible';		//container 2 is taken from enterscores.html
}

const form = document.getElementById('situations');						//div:container 1; form: situations
form.addEventListener('submit', submitData);				//when confirm clicked show container 2

var text = document.getElementById("text");
var buttonw = document.getElementById("write");
var buttond = document.getElementById("data");
var head1 = document.getElementById("head1");

function ShowData(){
	var input = text.value;
	var db = firebase.database();					//up to football-playcaller-f3ade
	var ref = db.ref().child("week2");				//up to parent node that we need access to
	
	//ref.orderByValue() - will print the whole table and the number nodes
	//the way it is now will display the away score in order; only showing the highest value
	ref.orderByChild("away_score").limitToLast(1).on("child_added", snap=>{		
																			//child_added event to retrieve list of items
													
		var away_score = snap.child("away_score").val();		//each value of child key stored
		var away_team = snap.child("away_team").val();
		var game_id = snap.child("game_id").val();
		var game_url = snap.child("game_url").val();
		var home_score = snap.child("home_score").val();
		var home_team = snap.child("home_team").val();
		var season = snap.child("season").val();
		var state_of_game = snap.child("state_of_game").val();
		var type = snap.child("type").val();
		var week = snap.child("week").val();
		
		
		$("#awayS").append("\t"+away_score);
		$("#awayT").append("\t"+away_team);
		$("#gameI").append("\t"+game_id);
		$("#gameU").append("\t"+game_url);
		$("#homeS").append("\t"+home_score);
		$("#homeT").append("\t"+home_team);
		$("#seaS").append("\t"+season);
		$("#stateG").append("\t"+state_of_game);
		$("#typE").append("\t"+type);
		$("#weeK").append("\t"+week);
				
	})
}	

function WriteData(){		//when send clicked creates new child
	
	let db = firebase.database();
    let ref = db.ref("example");

    //Create new node key TEST and value TESTDATA
    ref.child("TEST").set("TESTDATA");
    console.log("Data written.")
  }




