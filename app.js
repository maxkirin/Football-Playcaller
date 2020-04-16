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
}

const form = document.getElementById('situations');						//div:container 1; form: situations
form.addEventListener('submit', submitData);				//when confirm clicked show container 2

//var text = document.getElementById("txt");
var buttonw = document.getElementById("write");
var buttond = document.getElementById("data");
var head1 = document.getElementById("head1");

function ShowData(){
	//var input = text.value;
	var db = firebase.database();					//up to football-playcaller-f3ade
	var ref = db.ref();							//up to parent node that we need access to
	var count;
	//Displays how many score differentials are zero
	var testref = ref.orderByChild("AbsScoreDiff").equalTo(59);
	testref.on("value", snap=>{		
		count = 0;
		snap.forEach(function(childsnap) {
			count = count + (childsnap.child("AbsScoreDiff").val());
			console.log(childsnap.child("AbsScoreDiff").val());
		});
	
		console.log(count);
		//Run
		$("#totPR").append("\t"+count);
		$("#avgYR").append("\t"+count);
		$("#numR").append("\t"+count);
		$("#convR").append("\t"+count+"%");
		$("#lossyards").append("\t"+count+"%");
		//Pass
		$("#totPP").append("\t"+count);
		$("#comp").append("\t"+count+"%");
		$("#inter").append("\t"+count);
		$("#sack").append("\t"+count);
		$("#avgYP").append("\t"+count);
		$("#numP").append("\t"+count);
		$("#convP").append("\t"+count+"%");
		//Table
		var avgRun = count / 20;
		$("#avgrun").append("\t"+avgRun);
		var avgPass = count * 20;
		$("#avgpass").append("\t"+avgPass);
		
		
		//displays all values(15704) of "AbsScoreDiff"
	//ref.orderByChild("AbsScoreDiff").startAt(0).limitToLast(5).on("child_added", function(data){		
																			//child_added event to retrieve list of items
		//var num = data.val();
		//console.log("abs score: "+num.AbsScoreDiff);
		//var away_score = (num.AbsScoreDiff);
		//$("#totPR").append("\t"+count);
		
				
	})
}	

function WriteData(){		//when send clicked creates new child
	
	let db = firebase.database();
    let ref = db.ref("example");

    //Create new node key TEST and value TESTDATA
    ref.child("TEST").set("TESTDATA");
    console.log("Data written.")
  }




