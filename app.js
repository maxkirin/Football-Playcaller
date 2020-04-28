//Key which allows access to the various functions of Firebase without needing user account and authentication
var config = {
	"apiKey": "AIzaSyAGyoxhLyCEyJo1Km37xvwKyAyQiR00Z_g",
	"databaseURL": "https://football-playcaller-f3ade.firebaseio.com",
	"storageBucket": "football-playcaller-f3ade.appspot.com",
	"authDomain": "football-playcaller-f3ade.firebaseapp.com",
	"projectId": "1:180449355890:web:a3b76fdf536458dab97aeb"
};
firebase.initializeApp(config);

var plays = []; 					//aray to store all key/value pairs
var db = firebase.database();			//up to football-playcaller-f3ade
var ref = db.ref();						//up to parent node that we need access to


//loads all data from datbase into an array
ref = ref.orderByKey().once("value", snap=>{		
	console.log("data grabbed");
	snap.forEach(function(childsnap) {
		plays.push(childsnap.val())
	});
	var formButton = document.getElementById("confirm"); 
	formButton.disabled = false;
	formButton.value = "Confirm";			//allows access to array
});

var test = "-1" < "+1";
console.log("prints false: "+test);
	



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
	console.log("prints 12521: "+searchplays.length);
	console.log(searchplays[50]);		//displays all key/values for one parent
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
	
	if (scoreDiff != "na"){
		searchplays = searchByScoreDiff(scoreDiff, scoreDiffNum, searchplays);
	}
	
	if (down != "na"){
		searchplays = searchByDown(down, searchplays);
	}
	
	if (distance != "na"){
		searchplays = searchByDist(distance, searchplays);
	}
	
	if (quarterNumber != "na"){
		searchplays = searchByQtr(quarterNumber, searchplays);
	}
	
	if (timeRemaining != "na"){
		searchplays = searchByTime(timeRemaining, searchplays);
	}
	
	if (timeouts != "na"){
		searchplays = searchByTimeouts(timeouts, searchplays);
	}
	
	
	//may need to filter out plays with no down or get rid of certain
	//play types as they may affect our calculations
	
	
	ShowData(searchplays);
	
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

function ShowData(data){
	
	var runplays = 0;
	var rungain = 0;
	var runconv = 0;
	var runydsneg = 0;
	var runepa = 0;
	
	var passplays = 0;
	var passcomp = 0;
	var interception = 0;
	var sacks = 0;
	var passgain = 0;
	var passattempt = 0;
	var passconv = 0;
	var passepa = 0;
	
	for (var i = 0; i < data.length; i++){
		//console.log("prints searchplays: "+searchplays[i].posteam_timeouts_pre);
		//console.log("prints epa: "+data[i].epa);
		if (data[i].play_type == "Run")
		{ //run play
			runplays = runplays + 1;
			rungain = rungain + data[i].Yards_Gained;
			runconv = runconv + data[i].FirstDown;
				
				if(data[i].Yards_Gained < 0)
				{
					runydsneg = runydsneg + 1;
				}
				if(data[i].epa != undefined)
				{
					runepa = runepa + data[i].epa;
				}
				
		}
		else if (data[i].play_type == "Pass")
		{
			passplays = passplays + 1;		//pass play
			passgain = passgain + data[i].Yards_Gained;
			passconv = passconv + data[i].FirstDown;
			interception = interception + data[i].InterceptionThrown;
			
				if (data[i].PassOutcome == "Complete")
				{
					passcomp = passcomp + 1;
				}
				if(data[i].epa != undefined)
				{
					passepa = passepa + data[i].epa;
				}
		}
		else if (data[i].play_type == "Sack")  //if under pass displays 0
		{
			passplays = passplays + 1;
			sacks = sacks + 1;
		}
		
	}
	console.log(runepa);
	
	//Run
	$("#totPR").html("Total Plays: \t"+runplays);
	var ravgyards = (rungain/runplays);
	$("#avgYR").html("Average Yards: \t"+ravgyards.toFixed(3));
	//$("#numR").append("\t"+count);
	var ravgconv = (runconv/passplays) * 100;
	$("#convR").html("Conversion %: \t"+ravgconv.toFixed(2)+"%");
	var negydsperc = (runydsneg/runplays) * 100;
	$("#lossyards").html("Loss of yards %: \t"+negydsperc.toFixed(2)+"%");
		
	//Pass
	$("#totPP").html("Total Plays: \t"+passplays);
	var passcompperc = (passcomp / passplays) * 100;
	$("#comp").html("Completion %: \t"+passcompperc.toFixed(2)+"%");
	$("#inter").html("Interceptions: \t"+interception);
	$("#sack").html("Sacks: \t"+sacks);
	var pavgyards = (passgain/passplays);
	$("#avgYP").html("Average Yards: \t"+pavgyards.toFixed(3));
	var avgconv = (passconv/passplays) * 100;
	$("#convP").html("Conversion %: \t"+avgconv.toFixed(2)+"%");
	
	//Table
	var avgRun = (runepa/runplays);
	console.log(avgRun);
	console.log(runepa);
	console.log(runplays);
	$("#avgrun").html("\t"+avgRun.toFixed(3));
	var avgPass = (passepa/passplays);
	$("#avgpass").html("\t"+avgPass.toFixed(3));
	
	console.log("total run: "+runplays);
	console.log("total pass: "+passplays);
	
	console.log("total of div1 search: "+data.length);
	
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
	if (fp == 1){			//1/# - value given in html
		begin = 0;			//meaning of 1/#
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

	for (var i = 0; i < arr.length; i++){
		if (arr[i].yrdline100 < begin || arr[i].yrdline100 > end){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	//console.log("arr: "+arr[10]) //prints object object
	return arr;
}	

//searching for ScoreDiff
//using combination of scoreDiff type and num from form
//tied = 0
//winning = +
//losing = -
//for winning and losing, add on scoreDiff num range from form
// 1 - 1-3
// 2 - 4-6 
// 3 - 7-8
// 4 - 9-13
// 5 - 14-16
// 6 - 17-20
// 7 - 21 and up
function searchByScoreDiff(type, num, arr){
	//if tied, look for scoreDiff == 0
	if (type == "tied"){
		for (var i = 0; i < arr.length; i++){
			if (arr[i].ScoreDiff != 0){
				//remove element that doesn't match
				arr.splice(i, 1);
				//backtrack due to removing an element
				i--;
			}
		}
	}
	else{
		var begin;
		var end;
		
		//creating ranges for begin and end
		//assuming winning is selected
		if (num == 1){
			begin = 1;
			end = 3;
		}
		else if (num == 2){
			begin = 4;
			end = 6;
		}
		else if (num == 3){
			begin = 7;
			end = 8;
		}
		else if (num == 4){
			begin = 9;
			end = 13;
		}
		else if (num == 5){
			begin = 14;
			end = 16;
		}
		else if (num == 6){
			begin = 17;
			end = 20;
		}
		else if (num == 7){
			//no end needed, but made very large
			begin = 21;
			end = 100;
		}
		else{
			//no range specified, so either all pos or neg diffs
			begin = 0;
			end = 100;
		}
		
		//if losing selected, much make negative, and switch begin and end
		if(type == "losing"){
			begin = begin*-1;
			end = end*-1;
			
			var temp = begin;
			begin = end;
			end = temp;
		}
		
		for (var i = 0; i < arr.length; i++){
			if (arr[i].ScoreDiff < begin || arr[i].ScoreDiff > end){
				//remove element that doesn't match
				arr.splice(i, 1);
				//backtrack due to removing an element
				i--;
			}
		}		
	}
	return arr;
}

//searching for down
//value represents number of down (1,2,3,4)
function searchByDown(d, arr){
	for (var i = 0; i < arr.length; i++){
		if (arr[i].down != d){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	return arr;
}	

//searching for ydstogo
//value represents range
//short = 1-2
//medium = 3-6
//long = 7-10
//extra_long = 11+
function searchByDist(dist, arr){
	var begin;
	var end;
	//checking distance type to set range
	if (dist == "short"){
		//no distance less than 1 in dataset
		begin = 1;
		end = 2;
	}
	else if (dist == "medium"){
		begin = 3;
		end = 6;
	}
	else if (dist == "long"){
		begin = 7;
		end = 10;
	}
	else{
		begin = 11;
		end = 100;
	}
	
	//go through array and find plays that are in this range
	for (var i = 0; i < arr.length; i++){
		if (arr[i].ydstogo < begin || arr[i].ydstogo > end){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	return arr;
}
//searching for qtr
//value represents number of qtr (1,2,3,4)
function searchByQtr(q, arr){
	for (var i = 0; i < arr.length; i++){
		if (arr[i].qtr != q){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	return arr;
}

//searching by TimeUnder
//mainly will be used in qtrs 2 and 4
//value corresponds to value of TimeUnder column (4,2)
function searchByTime(t, arr){
	//only keep plays that are under the time
	for (var i = 0; i < arr.length; i++){
		if (arr[i].TimeUnder > t){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	return arr;
}

//searching by posteam_timeouts_pre
//value represents number of timeouts we are looking for (3,2,1,0)
function searchByTimeouts(timeouts, arr){
	for (var i = 0; i < arr.length; i++){
		if (arr[i].posteam_timeouts_pre != timeouts){
			//remove element that doesn't match
			arr.splice(i, 1);
			//backtrack due to removing an element
			i--;
		}
	}
	return arr;
}
