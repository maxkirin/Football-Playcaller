//Key which allows access to the various functions of Firebase without needing user account and authentication
var config = {
	"apiKey": "AIzaSyAGyoxhLyCEyJo1Km37xvwKyAyQiR00Z_g",
	"databaseURL": "https://football-playcaller-f3ade.firebaseio.com",
	"storageBucket": "football-playcaller-f3ade.appspot.com",
	"authDomain": "football-playcaller-f3ade.firebaseapp.com",
	"projectId": "1:180449355890:web:a3b76fdf536458dab97aeb"
};
firebase.initializeApp(config);

const scoreDiffBox = document.getElementById('scoreDiff');
scoreDiffBox.addEventListener('change', (event) => {
	const scoreDiffNumBox = document.getElementById('scoreDiffNum');
	//two options that require second box
	if (event.target.value === "winning" || event.target.value === "losing"){
		scoreDiffNumBox.disabled = false;
	}
	else{
		scoreDiffNumBox.value = "na";
		scoreDiffNumBox.disabled = true;		
	}
})

const form = document.getElementById('situations');						//div:container 1; form: situations
form.addEventListener('submit', submitData);				//when confirm clicked show container 2

function submitData(e){
	e.preventDefault();
	document.getElementById('container2').style.visibility = 'visible';		//container 2 is taken from enterscores.html

	//teamTitle, fieldPosition, scoreDifferential, down, distance, quarterNumber, timeRemaining, timeouts
	var fieldPosition = document.getElementById('fieldPosition').value;
	var scoreDiff = document.getElementById('scoreDiff').value;
	var scoreDiffNum = document.getElementById('scoreDiffNum').value;
	var down = document.getElementById('down').value;
	var distance = document.getElementById('distance').value;
	var quarterNumber = document.getElementById('quarterNumber').value;
	var timeRemaining = document.getElementById('timeRemaining').value;
	var timeouts = document.getElementById('timeouts').value;
}


//var text = document.getElementById("txt");
var buttond = document.getElementById("data");
var head1 = document.getElementById("head1");


function ShowData(){
	//var input = text.value;
	var db = firebase.database();					//up to football-playcaller-f3ade
	var ref = db.ref();							//up to parent node that we need access to
	var count;
	//Displays how many score differentials are zero
	var testref = ref.orderByChild("AbsScoreDiff").equalTo(7);
	testref.on("value", snap=>{		
		count = 0;
		down = 0;
		downtotal = 0;
		interception = 0;
		passplays = 0;
		passcomp = 0;
		passgain = 0;
		passattempt = 0;
		passconv = 0;
		runplays = 0;
		sacks = 0;
		snap.forEach(function(childsnap) {
			//adds all values of "AbsScoreDiff"
			count = count + (childsnap.child("AbsScoreDiff").val());
			//console.log(childsnap.child("AbsScoreDiff").val());
			downtotal = downtotal + (childsnap.child("down").val());
			interception = interception + (childsnap.child("InterceptionThrown").val());
			sacks = sacks + (childsnap.child("Sack").val());
			if(childsnap.child("down").val()===3)
			{
				down = down + 1;  //downs == 3
				
			}
			if (childsnap.child("play_type").val()==="Pass")
			{
				passplays = passplays + 1;		//run play
				
				if (childsnap.child("PassOutcome").val()==="Complete")
				{
					passcomp = passcomp + 1;
					passgain = passgain + (childsnap.child("Yards_Gained").val());
					passattempt = passattempt + (childsnap.child("PassAttempt").val());
					passconv = passconv + (childsnap.child("two_point_conversion_prob").val());
					
				}
			}
			
			if (childsnap.child("play_type").val()==="Run")
			{
				runplays = runplays + 1;
				
			}
		});
	
		console.log(count);
		console.log("downs val 3: "+down);
		
		
		//Run
		console.log("run plays: "+runplays);
		
		$("#totPR").append("\t"+runplays);
		$("#avgYR").append("\t"+downtotal);
		$("#numR").append("\t"+count);
		$("#convR").append("\t"+count+"%");
		$("#lossyards").append("\t"+count+"%");
		
		//Pass
		console.log("pass plays: "+passplays);
		console.log("completed pass: "+passcomp);
		console.log("completed yards gained: "+passgain);
		console.log("completed attempt: "+passattempt);
		console.log("interceptions: "+interception);
		
		$("#totPP").append("\t"+passplays);
		var passcompperc = (passcomp / passplays) * 100;
		$("#comp").append("\t"+passcompperc+"%");
		$("#inter").append("\t"+interception);
		$("#sack").append("\t"+sacks);
		var avgyards = (passgain/passplays) * 100;
		$("#avgYP").append("\t"+avgyards);
		$("#numP").append("\t"+"what do you mean");
		//var avgconv = (passconv/passplays) * 100;
		$("#convP").append("\t"+passconv+"%");
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




