<!DOCTYPE html>
<html>
<head>
	<title>Minty Robot</title>
	<link href="mint.css" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" href="carousel/carousel.css">
	<link rel="icon" href="Logo000.png"/>
</head>
<body>
	<!-- Top navigation bar -->
	<div class="header">
		<a href="#"><h1>Minty Robot</h1></a>
		<ul class="trans_box">
			<li><a href="#">blog</a></li>
			<li><a href="#">podcast</a></li>
			<li><a href="game/game.php">game</a></li>
			<li><a href="#">music</a></li>
			<li><a href="webglfun/main.php">gallery</a></li>
			<li><a href="about.html">about</a></li>
		</ul>
	</div>
	<!-- empty box so content doesn't go under header -->
	<div style="height: 120px;"></div>
<main>
	<div class="carousel">    
		<div class="carousel_track_container">
			<ul class="carousel_track">
				<li class="carousel_slide current-slide"><img class="carousel_img" src="carousel/img/kastra.jpg"></li>
				<li class="carousel_slide"><img class="carousel_img" src="carousel/img/piggy.jpg"></li>
				<li class="carousel_slide"><img class="carousel_img" src="carousel/img/Titans.jpg"></li>
			</ul>
		</div>
		<button class="carousel_button carousel_button--left" onclick="this.blur();">&#8249;</button>
		<button class="carousel_button carousel_button--right" onclick="this.blur();">&#8250;</button>
		<div class="carousel_nav">
			<button class="carousel_indicator current-slide" onclick="this.blur();"></button>
			<button class="carousel_indicator" onclick="this.blur();"></button>
			<button class="carousel_indicator" onclick="this.blur();"></button>
		</div>
	</div>
	<script src="carousel/carousel.js"></script>
	<div class="container">
		<div class="content">
			<pre><?php echo"<div>"; include('text/Overview.txt'); echo "</div><div><h1>Hello World</h1>blahblahblah</div>"; ?>
			</pre>
		</div>
		<div class="extra"><div><?php include('text/Overview.txt'); ?></div></div>
	</div>
</main>
</body>