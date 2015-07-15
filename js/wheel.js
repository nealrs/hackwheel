(function() {
	var colours = {
			bgColour: [
				"#B8D430",
				"#3AB745",
				"#029990",
				"#3501CB",
				"#2E2C75",
				"#673A7E",
				"#CC0071",
				"#F80120",
				"#F35B20",
				"#FB9A00",
				"#FFCC00",
				"#FEF200"
			],
			fontColour: [
				"#333",
				"#333",
				"#333",
				"#FFF",
				"#FFF",
				"#FFF",
				"#FFF",
				"#333",
				"#333",
				"#333",
				"#333",
				"#333"
			]
		},
		width = 600,
		height = 600,
		halfWidth = width / 2,
		halfHeight = width / 2,

		startAngle = 0,
		arc = Math.PI / (hackathons.length / 2),
		spinTimeout = null,

		isSpinning = false,

		spinArcStart = 10,
		spinTime = 0,
		spinTimeTotal = 0,

		spinVelocity = 2000,

		easeOut = function(t, b, c, d) {
			var ts = (t/=d)*t,
				tc = ts*t;
			return b+c*(tc + -3*ts + 3*t);
		},
		ctx,
		rouletteWheel = {};

	rouletteWheel.draw = function() {
		var canvas = document.getElementById("wheel"),
			outsideRadius = 250,
			textRadius = 194,
			insideRadius = 150,
			angle,
			text;

		if (!canvas.getContext) {
			return;
		}
		
		ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,width,height);
		
		ctx.strokeStyle = "black";
		ctx.font = "12px Helvetica, Arial";
		
		arc = Math.PI / (hackathons.length / 2);
		
		//Write words on arc path
		var str = "Click and Drag Mouse Clockwise!";

		//Draw circle
		hackathons.forEach(function(hack, i) {
			angle = startAngle + i * arc;
			ctx.fillStyle = colours.bgColour[i];
			
			ctx.beginPath();
			ctx.arc(halfWidth, halfHeight, outsideRadius, angle, angle + arc, false);
			ctx.arc(halfWidth, halfHeight, insideRadius, angle + arc, angle, true);
			ctx.fill();
			
			ctx.save();

			//Render text
			ctx.fillStyle = colours.fontColour[i];
			ctx.translate(halfWidth + Math.cos(angle + arc / 2) * textRadius, 
						halfHeight + Math.sin(angle + arc / 2) * textRadius);
			ctx.rotate(angle + arc / 2 + Math.PI / 2);
			text = hack.name;
			//ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
			rouletteWheel.printAt(ctx, text, -ctx.measureText(text).width / 2, 0, 14, ((2 * Math.PI * textRadius) / hackathons.length) - 10);
			ctx.restore();
		});
		
		//Arrow
		ctx.fillStyle = "#333";
		ctx.beginPath();
		ctx.moveTo(halfWidth - 4, halfHeight - (outsideRadius + 25));
		ctx.lineTo(halfWidth + 4, halfHeight - (outsideRadius + 25));
		ctx.lineTo(halfWidth + 4, halfHeight - (outsideRadius + 15));
		ctx.lineTo(halfWidth + 9, halfHeight - (outsideRadius + 15));
		ctx.lineTo(halfWidth + 0, halfHeight - (outsideRadius - 0));
		ctx.lineTo(halfWidth - 9, halfHeight - (outsideRadius + 15));
		ctx.lineTo(halfWidth - 4, halfHeight - (outsideRadius + 15));
		ctx.lineTo(halfWidth - 4, halfHeight - (outsideRadius + 25));
		ctx.fill();
	};

	rouletteWheel.spin = function(isForward) {	
		spinAngleStart = Math.random() * 10 + 10;
		spinTime = 0;
		spinTimeTotal = Math.random() * 3 + 4 * spinVelocity;
		closeSettings();
		if(isSpinning === false && isForward) {
			isSpinning = true;
			rouletteWheel.rotate(true);
		} else if (isSpinning === false && !isForward) {
			isSpinning = true;
			rouletteWheel.rotate(false);
		}
	};

	rouletteWheel.retIsSpinning = function() {
		return isSpinning;
	};

	rouletteWheel.addToStartAngle = function(angle) {
		startAngle += angle;
	};	

	rouletteWheel.rotate = function(isForward) {
		spinTime += 30;
		if(spinTime >= spinTimeTotal) {
			rouletteWheel.stopRotate();
			isSpinning = false;
			return;
		}
		var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
		if(isForward) {
			startAngle += (spinAngle * Math.PI / 180);
		} else {
			startAngle -= (spinAngle * Math.PI / 180);
		}
		rouletteWheel.draw();
		spinTimeout = setTimeout(function() { 
			rouletteWheel.rotate(isForward);	
		}, 30);
	};
	
	rouletteWheel.stopRotate = function() {
		clearTimeout(spinTimeout);
		var degrees = startAngle * 180 / Math.PI + 90,
			arcd = arc * 180 / Math.PI,
			index = Math.floor((360 - degrees % 360) / arcd);
		ctx.save();
				
		if(degrees < 0) {
			degrees = Math.abs(degrees);
			index = Math.floor((degrees % 360) / arcd);
		}

///// POPULATE POPUP WITH HACKATHON INFO HERE 
		var resultName = hackathons[index].name.split(' ').join('+');
		
		//Display Result
		var $result = $('.result');
		$result.find('.fullname').html(hackathons[index].fullname);
		$result.find('.img').attr("src", hackathons[index].img);
		//$result.find('.img').html(hackathons[index].img);
		$result.find('.tagline').html(hackathons[index].tagline);
		$result.find('.prizes').html(hackathons[index].prizes);
		$result.find('.deadline').html(hackathons[index].deadline);
		$result.find('.link').attr("href", hackathons[index].link);

//////		
		ctx.restore();
		
		//Start confetti
		$result.show();
		blurBackground();
		$('#confetti-world').show();
	};

	rouletteWheel.printAt = function(context, text, x, y, lineHeight, fitWidth) {
		fitWidth = fitWidth || 0;
		
		if (fitWidth <= 0) {
			context.fillText( text, x, y );
			return;
		}
		
		var str, splitDash, headText, tailText, idx;

		for (idx = 1; idx <= text.length; idx++) {
			str = text.substr(0, idx);
			
			if (context.measureText(str).width > fitWidth) {
				splitDash = (text.charAt(idx-2) != " ") ? "-" : "";
				headText = text.substr(0, idx-1) + splitDash;
				tailText = text.substr(idx-1);
				context.fillText( headText, -context.measureText(headText).width / 2, y - lineHeight);
				rouletteWheel.printAt(context, tailText, -context.measureText(tailText).width / 2, y + lineHeight, lineHeight,  fitWidth - 10);
				return;
			}
		}
		
		context.fillText(text, x, (y ? y - lineHeight : y));
	};

	window.rouletteWheel = rouletteWheel;
})();