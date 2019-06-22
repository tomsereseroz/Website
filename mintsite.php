<!DOCTYPE html>
<html>
<head>
	<title>Mint_Robot</title>
	<link href="mint.css" rel="stylesheet" type="text/css" />
	<link rel="icon" href="Logo000.png"/>
</head>
<body>
	<!-- Top navigation bar -->
	<div class="header">
		<h1><a href="#">Mint_Robot</a></h1>
		<ul class="trans_box">
			<li><a href="#">blog</a></li>
			<li><a href="#">podcast</a></li>
			<li><a href="#">products</a></li>
			<li><a href="#">music</a></li>
			<li><a href="#">gallery</a></li>
			<li><a href="favsites.html">about</a></li>
		</ul>
	</div>
	<!-- empty box so content doesn't go under header -->
	<div style="height: 100px;"></div>
<main>
	<div class="content">
		<pre><?php echo"<div>"; include('text/overview.txt'); echo "</div><div><h1>Hello World</h1>blahblahblah</div>"; ?>
		</pre>
	</div>
</main>
</body>