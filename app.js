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
	/*if (input.equals(ref.child("season"))){
			$("#sea").append("<tr>"+season+"</tr>");
		}*/
	ref.on("child_added", snap=>{					//child_added event to retrieve list of items
													//snap like (function(snapshot))
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
		
		
		//creates a table to add in "enterScores.html" using jquery
		$("#result").append("<tr><td>"+away_score+"</td><td>"+away_team+"</td><td>"+game_id+
						"</td><td>"+game_url+"</td><td>"+home_score+"</td><td>"+home_team+
						"</td><td>"+season+"</td><td>"+type+"</td><td>"+week+"</td></tr>");
	})
}	

function WriteData(){								//when send clicked creates new child
	
	let db = firebase.database();
    let ref = db.ref("example");

    //Create new node key TEST and value TESTDATA
    ref.child("TEST").set("TESTDATA");
    console.log("Data written.")
  }




