<!DOCTYPE html>
<html>
<head>
	<title>Minty Robot</title>
	<link href="../mint.css" rel="stylesheet" type="text/css" />
	<link href="glfun.css" rel="stylesheet" type="text/css" />
	<link rel="icon" href="../Logo000.png"/>
</head>
<body>
	<!-- Top navigation bar -->
	<div class="header">
		<a href="../mintsite.php"><h1>Minty Robot</h1></a>
		<ul class="trans_box">
			<li><a href="#">blog</a></li>
			<li><a href="#">podcast</a></li>
			<li><a href="../game/game.php">game</a></li>
			<li><a href="#">music</a></li>
			<li><a href="#">gallery</a></li>
			<li><a href="../favsites.html">about</a></li>
		</ul>
	</div>
	<!-- empty box so content doesn't go under header -->
	<div style="height: 120px;"></div>
<main>
	<canvas id="glcanvas"></canvas>
	<script src="gl.js"></script>
	<script>
		var gl;
		window.addEventListener("load",function(){
			//............................................				
			//Get our extended GL Context Object
			gl = GLInstance("glcanvas").fSetSize(500,500).fClear();

			//............................................
			//SHADER STEPS
			// 1. Get Vertex and Fragment Shader Text
			var vs	= document.getElementById("vertex_shader").textContent,
				fs	= document.getElementById("fragment_shader").textContent;
				// 2. Compile text and validate
			vShader		= ShaderUtil.createShader(gl,vs,gl.VERTEX_SHADER),
			fShader		= ShaderUtil.createShader(gl,fs,gl.FRAGMENT_SHADER),
			// 3. Link the shaders together as a program.
			shaderProg	= ShaderUtil.createProgram(gl,vShader,fShader,true);
			// var program = webglUtils.createProgramFromSources(gl, [vs,fs]);
			// 4. Get Location of Uniforms and Attributes.
			gl.useProgram(shaderProg);
			var aPositionLoc	= gl.getAttribLocation(shaderProg,"a_position"),
				uPointSizeLoc	= gl.getUniformLocation(shaderProg,"uPointSize");
			gl.useProgram(null);

			//............................................
			//Set Up Data Buffers
			var aryVerts = new Float32Array([
					-1, -1,  // first triangle
					1, -1,
					-1,  1,
					-1,  1,  // second triangle
					1, -1,
					1,  1,
				]),
				bufVerts = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER,bufVerts);
			gl.bufferData(gl.ARRAY_BUFFER, aryVerts, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER,null);

			//............................................
			//Set Up For Drawing
			gl.useProgram(shaderProg);				//Activate the Shader
			gl.uniform1f(uPointSizeLoc,50.0);		//Store data to the shader's uniform variable uPointSize

			//how its down without VAOs
			gl.bindBuffer(gl.ARRAY_BUFFER,bufVerts);					//Tell gl which buffer we want to use at the moment
			gl.enableVertexAttribArray(aPositionLoc);					//Enable the position attribute in the shader
			gl.vertexAttribPointer(aPositionLoc,3,gl.FLOAT,false,0,0);	//Set which buffer the attribute will pull its data from
			gl.bindBuffer(gl.ARRAY_BUFFER,null);						//Done setting up the buffer
			
			this.gl.drawArrays(gl.POINT, 0, 2);						//Draw the points
		});
	</script>
	<script id="vertex_shader" type="x-shader/x-vertex">#version 300 es
		in vec3 a_position;

		uniform float uPointSize;

		void main(void){
			gl_PointSize = uPointSize;
			gl_Position = vec4(a_position, 1.0);
		}
	</script>

	<script id="fragment_shader" type="x-shader/x-fragment">#version 300 es
		precision mediump float;

		out vec4 finalColor;

		void main(void){
			finalColor = vec4(fract(gl_FragCoord.xy / 50.0), 1.0, 1.0);
		}
	</script>
	<script src="shaders.js"></script>
</main>
</body>