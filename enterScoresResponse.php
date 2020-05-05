<?php

$teamTitle = $_GET["teamTitle"];
$fieldPosition = $_GET["fieldPosition"];
$scoreDifferential = $_GET["scoreDifferential"];
$down = $_GET["down"];
$distance = $_GET["distance"];					
$quarterNumber = $_GET["quarterNumber"];
$timeRemaining = $_GET["timeRemaining"];
$timeOuts = $_GET["timeOuts"];
?>

<html lang="en">

<head>
    <title>Football Play Calling</title>
    <meta charset="utf-8" />
    <meta name="description" content="CTE" />
	<link rel="stylesheet" type="text/css" href="fpstyle.css">

</head>
<!--
The div to be able to place our contents with respect to the CSS code
-->
<body>

	<div class = "section">
			<h3> Welcome to FootBall Play Calling</h3>
			
			<div class="video-container">
				<div class="color-overlay"></div>
				<video autoplay loop muted>
					<source src="ShortFieldVideo.mp4" type = "video/mp4">
				</video>
			</div>
		</div>
		
		<!--<div style="border:5px solid black; width=100px, ; padding-right:60px;
	padding-left:10px; float:left; size=10px;border-color: gray">-->
	


		
		
	<div class='wrapper1'>
	<form method="POST" action="help.html">
	<input style= "margin-top: 10px; margin-left:10px" type="submit" name="home" id="home" value="Help Guide">
				</form>
	  <h1>~~Play and Score Simulation~~</h1>

		

	<div class="container1">
	
	<?php
	/*Checking if the user inputed the desired info as declared*/
	
		if(isset($teamTitle))
			print_r("Team Title: $teamTitle");
		else
			print('teamTitle is not set');
	?><br/><br/>
	
	<?php
		if(isset($fieldPosition))
			print("Down fieldPosition: ".$fieldPosition);
		else
			print('fieldPosition is not set');
	?><br/><br/>
	
	<?php
		if(isset($scoreDifferential))
			print_r("scoreDifferential: ".$scoreDifferential);
		else
			print_r('scoreDifferential is not set');
		?> <br/><br/>
		
	<?php
		if(isset($down))
			print_r("down:".$down);
		else
			print('down is not set');
		?> <br/><br/>
	
	
	<?php
		if(isset($distance))
			print_r("Distance:".$distance);
		else
			print('Distance is not set');
		?> <br/><br/>
	<?php
		if(isset($quarterNumber))
			print("Quarter Number:".$quarterNumber);
		else
			print('Quarter Number is not set');
		?> <br/><br/>
	<?php
		if(isset($timeRemaining))
			print("Time Remaining:".$timeRemaining);
		else
			print('TimeRemaining is not set');
		?> <br/><br/>
	<?php
		if(isset($timeOuts))
			print("Time Outs:".$timeOuts);
		else
			print('timeOuts is not set');
		?> <br/><br/>
		
	</div>
	
	<?php 

		$rplays = $fieldPosition * 2;
		$raverageYards = $scoreDifferential*2.5;
		$rnumbers = $down* 3;
		$rconversions = $distance*3.5;
		$rloss = $quarterNumber*4;
		
		$pplays = $fieldPosition * 2.5;
		$paverageYards = $scoreDifferential*3;
		$pnumbers = $down* 3.5;
		$pconversions = $distance*4;
		$ploss = $quarterNumber*4.5;
		
		$raverageEPA = $rloss /$rplays;
		$paverageEPA = $ploss/ $pplays;
		
		
		?>
		
		<div id="container3" class="container3">
		<fieldset>
		<legend><strong>Run</strong></legend>
				  <label for="rplays">Total Plays: <?php print_r($rplays)?> </label> <br/>
				  <label for="rplays">Average Yards: <?php print_r($raverageYards)?> </label> <br/>
				  <label for="rplays">Numbers: <?php print_r($rnumbers)?> </label> <br/>
				  <label for="rplays">Conversion: <?php print_r($rconversions)?> </label> <br/>
				  <label for="rplays">Loss of Yards: <?php print_r($rloss)?> </label> <br/>
		</legend>
		</fieldset>
		
		<fieldset>
		<legend><strong>Pass</strong></legend>
				  <label for="rplays">Total Plays: <?php print_r($rplays)?> </label> <br/>
				  <label for="rplays">Average Yards: <?php print_r($raverageYards)?> </label> <br/>
				  <label for="rplays">Numbers: <?php print_r($rnumbers)?> </label> <br/>
				  <label for="rplays">Conversion: <?php print_r($distrconversions)?> </label> <br/>
				  <label for="rplays">Loss of Yards: <?php print_r($rloss)?> </label> <br/>
		</legend>
		</fieldset>
		
		
		<br/><br/>
		
		<table>
				<tr>
					<th>Ranking</th>
					<th>Average EPA</th>
				</tr>
				<tr>
					<td>Run</td>
					<td><?php print_r($raverageEPA)?> </td>
				</tr>
		  
				<tr>
					<td>Pass</td>
					<td><?php print_r($paverageEPA)?></td>
		   
				</tr>
		 
		 
			</table>

		</div>
	
		</br></br></br></br>
		</br>
		</br></br>
		</br>
		</br>
	</div>
	</div>
	
	<script src="app.js"></script>
	
</body>
</html>
