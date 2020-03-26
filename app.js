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
	var db = firebase.database();
	var ref = db.ref("example");
	ref.on('value',gotData, noData);   	//on event value call data
}	

function gotData(data){
	console.log(data.val());			//shows arrays of data
	var Example = data.val()
	var keys = Object.keys(Example);
	//head1.innerText = keys;
	console.log(keys);					//displays list of data
	for (var i = 0; i < keys.length; i++){
		var k = keys[i];
		var test1 = Example[k].test1;
		var test2 = Example[k].test2;
		head1.innerText = (test1+ " : " +test2);	//displays last child of parent node data
		console.log(test1,test2);		//displays last children of parent node data
		
		//var li = createElement("li", test1 + ":" + test2);
		//li.parent("scorelist");
	}
}

function noData(error){
	console.log("Error!!!");
	console.log(error);
}

function WriteData(){								//when send clicked creates new child
	//var val = text.value;
	var db = firebase.database();
	var ref = db.ref("Example");		//title of category
	var data = {
			test1: "yes3",
			test2: "no"
	}
	ref.push(data);
	//ref.child("mytest").set(val);			//child is subcategory; set inserts items to subcategory
}

