//Key which allows access to the various functions of Firebase without needing user account and authentication
var config = {
	"apiKey": "AIzaSyAGyoxhLyCEyJo1Km37xvwKyAyQiR00Z_g",
	"databaseURL": "https://football-playcaller-f3ade.firebaseio.com",
	"storageBucket": "football-playcaller-f3ade.appspot.com",
	"authDomain": "football-playcaller-f3ade.firebaseapp.com",
	"projectId": "1:180449355890:web:a3b76fdf536458dab97aeb"
};
firebase.initializeApp(config);

var plays = [];
var db = firebase.database();					//up to football-playcaller-f3ade
var ref = db.ref();	
ref = ref.orderByKey().once("value", snap=>{		
	console.log("data grabbed");
	snap.forEach(function(childsnap) {
		plays.push(childsnap.val())
	});
	var formButton = document.getElementById("confirm");
	formButton.disabled = false;
	formButton.value = "Confirm";
});

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
	
	//from line 12, creating deep copy of array
	var searchplays = [...plays];
	console.log(fieldPosition);
	
	//boolean defaults
	//will be adjusted based on user selections
	var fieldPosTest = true;
	var scoreDiffTest = true;
	var downTest = true;
	var distTest = true;
	var qtrTest = true;
	var timeRemTest = true;
	var timeoutTest = true;
	
	//find which values have been selected to be searched
	if (fieldPosition != "na"){
		searchplays = searchByFieldPosition(fieldPosition, searchplays);
	}
	
	if (down != "na"){
		searchplays = searchByDown(down, searchplays);
	}
	
	for (var i = 0; i < searchplays.length; i++){
		console.log(searchplays[i].yrdline100);
	}
	console.log(searchplays.length);
	//console.log(plays[0].val());
	
	//print to screen when finished
	//#awayS = id we are appending to
	$("#awayS").append("\tDONE!!!!!!!!!!!!!!");
	
}

const form = document.getElementById('situations');						//div:container 1; form: situations
form.addEventListener('submit', submitData);				//when confirm clicked show container 2

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

var text = document.getElementById("text");
var buttonw = document.getElementById("write");
var buttond = document.getElementById("data");
var head1 = document.getElementById("head1");

function ShowData(){
	//var input = text.value;
	//
	
	//ref.orderByValue() - will print the whole table and the number nodes
	//the way it is now will display the away score in order; only showing the highest value
	//child_added event to retrieve list of items
	var testref = ref.orderByChild("AbsScoreDiff").startAt(1).endAt(3);
	testref.on("value", snap=>{		
		var count = 0;
		snap.forEach(function(childsnap) {
			count = count + 1;
			console.log(childsnap.child("AbsScoreDiff").val());
		});
		
		console.log(count);
				
	});
}	

//searching for yrdline100
//possible values are
//fp = 1 -> 0 - 10
//2 -> 10 - 25
//3 -> 25 - 50
//4 -> 50 - 75
//5 -> 75 - 90
//6 -> 90 - 97
//7 -> 97 - 100
function searchByFieldPosition(fp, arr){
	var begin;
	var end;
	if (fp == 1){
		begin = 0;
		end = 10;
	}
	else if (fp == 2){
		begin = 10;
		end = 25;
	}
	else if (fp == 3){
		begin = 25;
		end = 50;
	}
	else if (fp == 4){
		begin = 50;
		end = 75;
	}
	else if (fp == 5){
		begin = 75;
		end = 90;
	}
	else if (fp == 6){
		begin = 90;
		end = 97;
	}
	else {
		begin = 97;
		end = 100;
	}
	console.log(begin)
	console.log(end);

	for (var i = 0; i < arr.length; i++){
		if (arr[i].yrdline100 < begin || arr[i].yrdline100 > end){
			arr.splice(i, 1);
			i--;
		}
	}
	
	return arr;
}	

//searching for down
//value represents nuber of down
function searchByDown(d, arr){
	for (var i = 0; i < arr.length; i++){
		if (arr[i].down != d){
			arr.splice(i, 1);
			i--;
		}
	}
	return arr;
}	

function WriteData(){		//when send clicked creates new child
	
	let db = firebase.database();
    let ref = db.ref("example");

    //Create new node key TEST and value TESTDATA
    ref.child("TEST").set("TESTDATA");
    console.log("Data written.")
  }



