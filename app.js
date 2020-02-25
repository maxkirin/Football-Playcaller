function submitData(e){
	e.preventDefault();
	document.getElementById('container2').style.visibility = 'visible';
}
	
const form = document.getElementById('situations');
form.addEventListener('submit', submitData);