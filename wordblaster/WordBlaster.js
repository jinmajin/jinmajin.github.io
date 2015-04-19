var Audio = null;

dojo.declare('myApp', [], {
	constructor : function(words) {
		this.setVariables();
		this.setConditions();
		this.setImages();
		this.width = dojo.byId('mainCanvas').width;
		this.height = dojo.byId('mainCanvas').height;
		this.wordlist = words;
	},
	startup : function() {
		while(this.toLoad > 1){
			this.toLoad--;
			return;
		}
		this.stage = new Stage(dojo.byId('mainCanvas'));
		this.loadBitmaps();
		this.setBackgroundPositions();
		this.setPlayerPosition();
		this.splitWordList();
		this.determineCSword();
		this.loadToScreen();
		this.loadStartText();
		this.startScreen();
		this.handleKeyDown();
		this.handleKeyUp();
		setInterval(dojo.hitch(this,"tick"), 10);
		Audio.setProperty({channel: 'bkg', name: 'loop', value: 'true'})
        Audio.setProperty({channel: 'bkg', name: 'volume', value: .25})
        Audio.play({url : 'milkyway', channel: 'bkg'});
	},
	tick : function() {
		this.setSpeed();
		this.setLimit();
		this.stage.update();
		if(!this.paused){
			this.handleR();
			this.handleMotion();
			this.handleShoot();
			this.animateBeam();
			this.animateRed();
			this.animateExploding();
			this.animateExploded();
		}
	},
	setVariables: function(){
		this.level = 1;
		this.deltaR = 1.5;
		this.xdir = 2;
		this.ydir = 2;
		this.wordDX = 1;
		this.wordDY = 1;
		this.minWordSpeed = .15;
		this.wantedI = 0;
		this.score = 0;
		this.earnPoints = 60;
		this.shipBounds = 40;
		this.pausedText = new Text("PAUSED", "50px Courier", "#FFFFFF");
		this.pausedText.x = this.pausedText.text.length*this.px20size;
		this.pausedText.y = 250;
		this.px30size = 18;
		this.px20size = 12;
		this.px50size = 30;
	},
	setConditions: function(){
		this.red = true;
		this.beamOn = false;
		this.paused = true;
		this.upHeld = false;
		this.downHeld = false;
		this.rHeld = false;
		this.lHeld = false;
		this.space = false;
		this.exploding = false;
		this.exploded = false;
		this.beamOn = false;
		this.congrating = false;
		this.starting = true;
		this.happened = false;
		this.letStart = false;
		this.letWrong = false;
	},
	setImages: function(){
		this.toLoad = 6;
		this.img = new Image();
		this.img.src = "Rocketship.png";
		this.beam = new Image();
		this.beam.src = "Beam.png";
		this.star = new Image();
		this.star.src = "Star.png";
		this.planet = new Image();
		this.planet.src = "Planet.png";
		this.moon = new Image();
		this.moon.src = "Moon.png";
		this.congrats = new Image();
		this.congrats.src = "Congrats.png";
		dojo.connect(this.img, 'onload', this, 'startup');
		dojo.connect(this.beam, 'onload', this, 'startup');
		dojo.connect(this.star, 'onload', this, 'startup');
		dojo.connect(this.planet, 'onload', this, 'startup');
		dojo.connect(this.moon, 'onload', this, 'startup');
		dojo.connect(this.congrats, 'onload', this, 'startup');
	},
	loadBitmaps: function(){
		this.stars = new Array(10);
		for(i = 0; i < 10; i++){
			this.stars[i] = new Bitmap(this.star);
		}
		this.bitmapShip = new Bitmap(this.img);
		this.bitmapMoon = new Bitmap(this.moon);
		this.bitmapPlanet = new Bitmap(this.planet);
		this.bitmapBeam = new Bitmap(this.beam);
		this.bitmapCongrats = new Bitmap(this.congrats);
	},
	setBackgroundPositions: function(){
		this.stars[0].x = 25;
		this.stars[0].y = 80;
		this.stars[1].x = 100;
		this.stars[1].y = 225;
		this.stars[2].x = 75;
		this.stars[2].y = 350;
		this.stars[3].x = 250;
		this.stars[3].y = 190;
		this.stars[4].x = 225;
		this.stars[4].y = 40;
		this.stars[5].x = 350;
		this.stars[5].y = 100;
		this.stars[6].x = 420;
		this.stars[6].y = 240;
		this.stars[7].x = 480;
		this.stars[7].y = 30;
		this.stars[8].x = 275;
		this.stars[8].y = 350;
		this.stars[9].x = 520;
		this.stars[9].y = 340;
		
		this.bitmapMoon.x = 10;
		this.bitmapMoon.y = 430;
		
		this.bitmapPlanet.x = 410;
		this.bitmapPlanet.y = 405;
		
		this.scoreText = new Text("Score: " + this.score, "20px Courier",
			"#FFFFFF");
		this.scoreText.x = 25;
		this.scoreText.y = 25;
		
		this.bitmapCongrats.x = this.center(0, 600, 400);
		this.bitmapCongrats.y = 10;
		
		this.congratsText = new Text("Good Job!", " Bold 50px Courier", "#FFFFFF");
		this.congratsText.x = this.center(0, 600, this.congratsText.text.length*this.px50size);
		this.congratsText.y = 230;
		
		this.enterText = new Text("Press enter to continue.", "Bold 30px Courier",
				"#FFFFFF");
		this.enterText.x = this.center(0, 600, this.enterText.text.length*this.px30size);
		this.enterText.y = 255;
	},
	setPlayerPosition: function(){
		this.bitmapShip.regX = 50;
		this.bitmapShip.regY = 50;
		this.bitmapShip.x = 50;
		this.bitmapShip.y = 300;
		this.bitmapShip.R = 0;
		this.bitmapShip.rotation = 0;
		this.bitmapBeam.R = 0;
		this.bitmapBeam.rotation = 0;
		this.stage.update();
	},
	loadToScreen: function(){
		for(i = 0; i < 10; i++){
			this.stage.addChild(this.stars[i]);
		}
		this.stage.addChild(this.bitmapMoon);
		this.stage.addChild(this.bitmapPlanet);
		this.stage.addChild(this.bitmapShip);
		this.stage.addChild(this.scoreText);
	},
	splitWordList: function(){
		for(i = 0; i < this.wordlist.length; i++){
			this.wordlist[i] = this.wordlist[i].split("-");
		}
	},
	determineCSword: function(){
		this.currentWord = "";
		this.scrambledWord = "";
		for (count = 0; count < this.wordlist[this.level - 1].length; count++) {
			this.currentWord += this.wordlist[this.level - 1][count];
			this.scrambledWord += this.wordlist[this.level - 1][this.wordlist[this.level - 1].length - count - 1];
		}
	},
	loadStartText: function(){
		this.aniWord = new Text(this.scrambledWord, "20px Courier", "#FF0000");
		this.aniWord.x = this.width - 1.2*this.aniWord.text.length*this.px20size;
		this.aniWord.y = 100;
		this.stage.addChild(this.aniWord);
	},
	startScreen: function(){
		this.levelText = new Text("LEVEL " + this.level + ":", 
				"Bold 50px Courier", "#FFFFFF");
		this.levelText.x = this.center(0,this.width,this.levelText.text.length*this.px50size);
		this.levelText.y = 225;

		this.startText = new Text(this.currentWord.toUpperCase(),
				"Bold 50px Courier", "#FFFFFF");
		this.startText.x = this.center(0, this.width, this.startText.text.length*this.px50size);
		this.startText.y = 260;
		
		this.stage.addChild(this.levelText);
		this.stage.addChild(this.startText);
		
		this.aniWordDX = Math.random()*this.wordDX - .5*this.wordDX;
		this.aniWordDY = Math.random()*this.wordDX - .5*this.wordDY;
		
		while(Math.abs(this.aniWordDX) < this.minWordSpeed){
			this.aniWordDX = Math.random()*this.wordDX - .5*this.wordDX;
		}
		
		while(Math.abs(this.aniWordDY) < this.minWordSpeed){
			this.aniWordDY = Math.random()*this.wordDX - .5*this.wordDY;
		}
		
		this.stage.update();
		setTimeout(dojo.hitch(this, 'readWord'), 500);
		setTimeout(dojo.hitch(this,'letItStart'), 3000);
		
		dojo.connect(window, 'keydown', this, function(evt) {
			if(this.starting && this.letStart){
				this.paused = false;
				this.stage.removeChild(this.startText);
				this.stage.removeChild(this.levelText);
				this.starting = false;
			}
		}); 
	},
	readWord: function(){
		speak("Level " + this.level + ": " + this.currentWord);
	},
	letItStart: function(){
		this.letStart = true;
	},
	letItResume: function(){
		this.letResume = true;
	},
	stopLetWrong: function(){
		this.letWrong = false;
		this.bitmapShip.alpha = 1;
	},
	handleKeyDown: function(){
		dojo.connect(window, 'onkeydown', this, function(evt) {
			evt.preventDefault();
			switch (evt.keyCode) {
				case dojo.keys.UP_ARROW:
					this.upHeld = true;
					break;
				case dojo.keys.DOWN_ARROW:
					this.downHeld = true;
					break;
				case dojo.keys.RIGHT_ARROW:
					this.rHeld = true;
					break;
				case dojo.keys.LEFT_ARROW:
					this.lHeld = true;
					break;
				case dojo.keys.SPACE:
					this.space = true;
					break;
				case dojo.keys.ENTER:
					if(this.paused && this.wrong && this.letResume){
						for(i = 0; i < this.parts.length; i++){
							this.stage.removeChild(this.parts[i]);
						}
						this.happened = false;
						this.letResume = false;
						this.paused = false;
						this.letWrong = true;
						setTimeout(dojo.hitch(this, 'flash'), 500);
						setTimeout(dojo.hitch(this, 'stopLetWrong'), 4900);
						this.stage.removeChild(this.enterText);
					}
					if(this.congrating && this.level < this.wordlist.length){
						this.stage.removeChild(this.congratsText);
						this.stage.removeChild(this.bitmapCongrats);
						this.stage.removeChild(this.enterText);
						this.nextLevel();
					}
					break;
			}
		});
	},
	handleKeyUp: function(){
		dojo.connect(window, 'onkeyup', this, function(evt) {
			switch (evt.keyCode) {
				case dojo.keys.UP_ARROW:
					this.upHeld = false;
					break;
				case dojo.keys.DOWN_ARROW:
					this.downHeld = false;
					break;
				case dojo.keys.RIGHT_ARROW:
					this.rHeld = false;
					break;
				case dojo.keys.LEFT_ARROW:
					this.lHeld = false;
					break;
				case dojo.keys.SPACE:
					this.space = false;
					break;
			}
		});
	},
	setSpeed: function(){
		this.deltaY = this.ydir * Math.sin((this.bitmapShip.R - 90) * Math.PI / 180);
		this.deltaX = this.xdir * Math.cos((this.bitmapShip.R - 90) * Math.PI / 180);
	},
	setLimit: function(){
		this.limitY = this.max(28*Math.abs(Math.cos((this.bitmapShip.R)*Math.PI/180)),
				10*Math.abs(Math.cos(this.bitmapShip.R-90)*Math.PI/180));
		this.limitX = this.max(28*Math.abs(Math.sin((this.bitmapShip.R)*Math.PI/180)),
				10*Math.abs(Math.sin(this.bitmapShip.R-90)*Math.PI/180));
	},
	handleR: function(){
		this.bitmapShip.rotation = this.bitmapShip.R;
		this.bitmapBeam.R = this.bitmapShip.R;
		
		if (this.rHeld) {
			this.bitmapShip.R += this.deltaR;
		}
		if (this.lHeld) {
			this.bitmapShip.R -= this.deltaR;
		}
	},
	handleMotion: function(){
		if (this.upHeld) {
			this.bitmapShip.y += this.deltaY;
			this.bitmapShip.x += this.deltaX;
			if (this.bitmapShip.y >= this.height - (200 + this.shipBounds)
				|| this.bitmapShip.y <= this.shipBounds)
				this.bitmapShip.y -= 2 * this.deltaY;
			if (this.bitmapShip.x >= this.width - this.shipBounds 
				|| this.bitmapShip.x <= this.shipBounds)
				this.bitmapShip.x -= 2 * this.deltaX; 
		}
		if (this.downHeld) {
			this.bitmapShip.y -= this.deltaY;
			this.bitmapShip.x -= this.deltaX;

			if (this.bitmapShip.y >= this.height - (200 + this.shipBounds)
					|| (this.bitmapShip.y <= this.shipBounds))
				this.bitmapShip.y += 2 * this.deltaY;
			if ((this.bitmapShip.x >= this.width - this.shipBounds)
					|| (this.bitmapShip.x <= this.shipBounds))
				this.bitmapShip.x += 2 * this.deltaX;
		}
	},
	handleShoot: function(){
		if(this.space){
			if (!this.beamOn && !this.congrating) {
				this.bitmapBeam.regX = 50;
				this.bitmapBeam.regY = 50;
				this.bitmapBeam.x = this.bitmapShip.x + 6 * this.deltaX;
				this.bitmapBeam.y = this.bitmapShip.y + 6 * this.deltaY;
				this.bitmapBeam.rotation = this.bitmapBeam.R;
				this.stage.addChild(this.bitmapBeam);
				this.beamOn = true;
				this.beamR = this.bitmapBeam.R;
				Audio.stop({channel: 'shoot'});
	            Audio.play({url : 'lasergun_fire', channel: 'shoot'});
			}
		}
	},
	animateBeam: function(){
		if (this.beamOn) {
			this.beamDeltaY = 2*this.ydir * Math.sin((this.beamR - 90) * Math.PI / 180);
			this.beamDeltaX = 2*this.xdir * Math.cos((this.beamR - 90) * Math.PI / 180);
			
			this.bitmapBeam.x += this.beamDeltaX;
			this.bitmapBeam.y += this.beamDeltaY;
			
			if (this.bitmapBeam.x >= this.width + 25 || this.bitmapBeam.x <= -25
				|| this.bitmapBeam.y >= this.height - 175 || this.bitmapBeam.y <= -25) {
				this.stage.removeChild(this.bitmapBeam);
				this.beamOn = false;
			}
		}
	},
	animateRed: function(){
		if (this.red) {
			this.aniWord.x += this.aniWordDX;
			this.aniWord.y += this.aniWordDY;
			if (this.aniWord.x >= this.width - this.aniWord.text.length*this.px20size || this.aniWord.x <= 0)
				this.aniWordDX = -this.aniWordDX;
			if (this.aniWord.y >= this.height - 200 || this.aniWord.y <= this.px20size)
				this.aniWordDY = -this.aniWordDY;
			if (this.beamOn) {
				if ((this.bitmapBeam.x - 15 <= this.aniWord.x + this.aniWord.text.length*this.px20size && this.bitmapBeam.x + 15 >= this.aniWord.x)
					&& (this.bitmapBeam.y - 15 <= this.aniWord.y && this.bitmapBeam.y + 15 >= this.aniWord.y - this.px20size)) {
					this.red = false;
					this.stage.removeChild(this.aniWord);
					this.beamOn = !this.beamOn;
					this.stage.removeChild(this.bitmapBeam);
					this.exploding = true;
				}
			}
		}
	},
	animateExploding: function(){
		if(this.exploding){
			this.textWords = new Array(this.wordlist[this.level - 1].length);
			this.textDirs = new Array(this.wordlist[this.level - 1].length*2);
			
			for(i = 0; i < this.wordlist[this.level - 1].length; i++){
				this.textWords[i] = new Text(this.wordlist[this.level - 1][i], "20px Courier", "#FFFFFF");
			}
			
			for(i = 0; i < this.textWords.length; i ++){
				this.textWords[i].x = this.aniWord.x;
				this.textWords[i].y = this.aniWord.y;
				
				this.textDirs[2*i] = 0;
				this.textDirs[2*i + 1] = 0;
				
				while(Math.abs(this.textDirs[2*i]) < this.minWordSpeed && 
						!(this.textDirs[2*i] - .15 <= this.textDirs[2*(i - 1)] && 
								this.textDirs[2*i] + .15 >= this.textDirs[2*(i - 1)]))
					this.textDirs[2*i] = Math.random()*this.wordDX - this.wordDX / 2;
				while(Math.abs(this.textDirs[2*i + 1]) < this.minWordSpeed && 
						!(this.textDirs[2*i + 1] - .15 <= this.textDirs[2*(i - 1) + 1] && 
								this.textDirs[2*i + 1] + .15 >= this.textDirs[2*(i - 1) + 1]))
					this.textDirs[2*i + 1] = Math.random()*this.wordDY - this.wordDY / 2;
			}
			
			for(i = 0; i < this.textWords.length; i++){
				this.stage.addChild(this.textWords[i]);
			}
			this.exploding = false;
			this.exploded = true; 
		}
	},
	animateExploded: function(){
		if(this.exploded){
			for(i = 0; i < this.textWords.length; i ++){
				this.textWords[i].x += this.textDirs[2*i];
				this.textWords[i].y += this.textDirs[2*i + 1];
				
				if (this.textWords[i].x >= this.width - this.textWords[i].text.length*this.px20size || this.textWords[i].x <= 0){
					this.textDirs[2*i] = -this.textDirs[2*i];
				}
			
				if (this.textWords[i].y >= this.height - 200 || this.textWords[i].y <= this.px20size)
						this.textDirs[2*i + 1] = -this.textDirs[2*i + 1];
				
				if((this.bitmapShip.x - this.limitX <= this.textWords[i].x + this.textWords[i].text.length*this.px20size 
						&& this.bitmapShip.x + this.limitX >= this.textWords[i].x)
					&& (this.bitmapShip.y - this.limitY <= this.textWords[i].y && 
							this.bitmapShip.y + this.limitY >= this.textWords[i].y - this.px20size)) {
					if(i == this.wantedI){
						Audio.stop({channel: 'chime'});
						Audio.play({url: 'chime', channel: 'chime'});
						this.textWords[i].text = this.textWords[i].text.toUpperCase();
						if(i != 0) {
							this.textWords[i].x = this.textWords[i - 1].x + this.textWords[i - 1].text.length*this.px30size;
						}
						if(i == 0)
							this.textWords[i].x = this.center(151, 413, this.currentWord.length*this.px30size);
						this.textWords[i].font = "Bold 30px Courier";
						this.textWords[i].y = 500;
						this.textDirs[2*i] = 0;
						this.textDirs[2*i + 1] = 0; 
						this.wantedI++;
					}
					else{
						if(!this.happened && !this.letWrong){
							this.wrong = true;
							this.paused = true;
							this.happened = true;
							setTimeout(dojo.hitch(this,'letItResume'), 2500);
							this.parts = new Array(this.textWords.length);
							this.wrongText(i);
							for(z = 0; z < this.parts.length; z++){
								if(z == 0)
									this.parts[z].x = this.center(0, 600, this.startText.text.length*this.px50size);
								else{
									this.parts[z].x = this.parts[z-1].x + this.parts[z-1].text.length*this.px50size;
								}
								this.parts[z].y = 225;
								this.stage.addChild(this.parts[z]);
							}
							this.stage.addChild(this.enterText);
							if(this.score > 0)
								this.score -= 15;
							this.scoreText.text = "Score: " + this.score;
							speak(this.currentWord);
							this.stage.update();
						}
					}
				}
			}
			if(this.wantedI == this.textWords.length) {
				this.stage.removeChild(this.scoreText);
				this.score += this.earnPoints;
				this.scoreText.text = "Score: " + this.score;
				this.stage.addChild(this.scoreText);
				this.exploded = false;
				this.congratulations();
			}
		}
	},
	wrongText: function(i){
		for(k = 0; k < this.textWords.length; k++){
			this.parts[k] = new Text(this.textWords[k].text.toUpperCase(), "50px Courier",
				"#FFFFFF");
			if(k == i)
				this.parts[k].color = "#F00";
		}
	},
	congratulations: function(){
		this.congrating = true;
		if(this.letWrong)
			this.letWrong = false;
		this.stage.removeChild(this.bitmapShip);
		this.stage.addChild(this.bitmapCongrats);
		this.stage.addChild(this.congratsText);
		if(this.level < this.wordlist.length){
			this.stage.addChild(this.enterText);
			speak(this.congratsText.text);
		}
		else{
			this.doneText = "Congratulations! You got " + this.score + " points!";
			speak(this.congratsText.text + " " + this.doneText);
		}
		this.stage.addChild(this.bitmapShip);
	},
	nextLevel: function(){
		this.level += 1;
		this.wantedI = 0;
		for(i = 0; i < this.textWords.length; i++){
			this.stage.removeChild(this.textWords[i]);
		}
		if(this.beamOn)
			this.stage.removeChild(this.beam);
		this.setPlayerPosition();
		this.setConditions();
		this.determineCSword();
		this.loadStartText();
		this.paused = true;
		this.starting = true;
		this.startScreen();
	},
	flash: function(){
		if(!this.congrating)
			this.bitmapShip.alpha = .5;
		setTimeout(dojo.hitch(this, 'restoreAlpha'), 500);
	},
	restoreAlpha: function(){
		this.bitmapShip.alpha = 1;
		if(this.letWrong)
			setTimeout(dojo.hitch(this, 'flash'), 500);
	},
	max: function(num1, num2){
		if(num1 > num2)
			return num1;
		return num2;
	},
	center: function(spaceStart, spaceEnd, objectLength){
		space = spaceEnd - spaceStart;
		space -= objectLength;
		space /= 2;
		return spaceStart + space;
	}
});

function main() {
	uow.getAudio().then(function(a) { 
		Audio = a; 
	});
}


function entered() {
	var startable = true;
	var words = dojo.query('input').attr('value');
	for(i = 1; i <= words.length; i++){
		words[i - 1] = dojo.trim(words[i - 1]);
		if(words[i - 1] == ""){
			alert("Text box number " + i + " is blank! Please correct this error before continuing.");
			startable = false;
		}
		if(words[i - 1].charAt(words[i - 1].length - 1) == "-"){
			alert("You ended a word with a dash! Please correct this error before continuing.");
			startable = false;
		}
		if(words[i - 1].split("-").join("").length > 14){
			alert("The word in text box " + i + " is greater than 14 characters in length. Please correct this error before continuing.");
			startable = false;
		}
	}
	if(startable)
		start(words);
}

function defaulted() {
	start(new Array("chem-is-try", "so-di-um", "or-ga-nic", "hy-dro-ly-sis", "pho-to-syn-the-sis"));
}

function start(words){
	var app = new myApp(words);
	dojo.query('#playGame').style('display','block');
	dojo.query('#gatherWords').style('display','none');
}

function add(){
	var gatherWords = document.getElementById('wordFields');
	var newField = document.createElement('input');
	var removeButton = document.createElement('button');
	var newLine = document.createElement('br');
	removeButton.onclick = function(){
		gatherWords.removeChild(newField);
		gatherWords.removeChild(newLine);
		gatherWords.removeChild(removeButton);
		};
	removeButton.innerHTML = "x"
	newField.setAttribute("type","text");
	newField.setAttribute("name","word");
	gatherWords.appendChild(newField);
	gatherWords.appendChild(removeButton);
	gatherWords.appendChild(newLine);
}

var music = true;
function musicToggle(){
	if(music){
		Audio.stop({channel: 'bkg'});
		music = false;
	}
	else{
		Audio.play({url: 'milkyway', channel: 'bkg'});
		music = true;
	}
}

dojo.ready(main);