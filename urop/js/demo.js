function Option(image, text){
	this.image = image;
	this.text = text;
}

function Question(question, prompt, type, options, answer){
	this.question = question;
	this.prompt = prompt;
	this.type = type;
	this.options = options;
	this.answer = answer;
}

function Section(title, image, words, definitions){
	this.title = title;
	this.image = image;
	this.words = words;
	this.definitions = definitions;
} 

var demoSection = new Section("Basic 1", "demo.jpg", ["the boy", "kicks", "the ball"], ["boy.jpg", "kick.jpg", "ball.jpg"]);
var demoSection3 = new Section("Basic 3", "demo2.jpg", ["the girl", "reads", "the book"], ["girl.jpg", "reads.jpg", "book.jpg"]);
var demoSection2 = new Section("Basic 2", "demo3.jpg", ["the girl", "kicks", "the ball"], ["girl.jpg", "kick.jpg", "ball.jpg"]);
var questions = [];
var progress = 0;
var sections = [[demoSection], [demoSection2, demoSection3]];
var section;
var question;

function clearMem(){
	for(var i = 0; i < sections.length; i++){
		for(var j = 0; j < sections[i].length; j++){
			eraseCookie(sections[i][j].title);
		}
	}
	loadStart();
}

function startScreen(){
	for(var i = 0; i < sections.length; i++){
		var divString = "<div class='section'><div id='"+i+"'class='bar'>SECTION "+(i+1)+"</div>";
		for(var j = 0; j < sections[i].length; j++){
			divString += "<span class='module' id='"+i+"_"+j+"' onclick='startSection("+i+","+j+")'><img class='img_option' src='images/"+sections[i][j].image+"'><br>"+sections[i][j].title+"</span>";
		}
		divString += "</div>";
		$("#start").append(divString);
	}
}

function startSection(i,j){
	if(completed(i)){
		questions = [];
		progress = 0;
		$("#progress").progressbar({value:0});

		section = sections[i][j];
		$("div .main").hide();
		$("#game").show();

		for(var i = 0; i < section.words.length; i++){
			questions.push(new Question("Choose the picture that matches: ", section.words[i], "pic", section.definitions, i));
		}
		for(var i = 0; i < section.words.length; i++){
			questions.push(new Question("Choose the phrase that matches: ", section.definitions[i], "phrase", section.words, i));
		}
		
		shuffle(questions);
		
		$("#progress").progressbar("option", "max", questions.length+1);
		loadNextQuestion();
	}
	else{
		vocalize("You have not finished the previous section");
	}
}

function completed(level){
	for(var i = 0; i < level; i++){
		for(var j = 0; j < sections[i].length; j++){
			if(readCookie(sections[i][j].title) != "completed")
				return false;
		}
	} 
	return true;
}


function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function loadNextQuestion(){
	if(progress == questions.length)
		question = new Question("Choose the picture that matches: ", section.words.join(" "), "pic", section.definitions.slice(0,2).concat([section.image]), section.definitions.length-1);
	else
		question = questions[progress];
	
	var html = question.question;	
	if(question.type == "pic"){
		vocalize(question.question + question.prompt);
		html += "<span class='word' id='"+question.prompt.split(" ").join("_")+"' title=''>"+question.prompt+"</span>";
	}
	else if (question.type == "phrase"){
		vocalize(question.question);
		html += "<img class='img_option' src=images/"+question.prompt+">";
	}
		
	window.scrollTo(0,0);
	$("#options").html("");	
	$("#question").html(html);
	$("#question #"+question.prompt.split(" ").join("_")).tooltip({content : "<img class='img_option' src=images/"+question.options[question.answer]+">"});

	if(question.type == "pic") {
		for(var i = 0; i < question.options.length; i++){
			$("#options").append("<span class='option'><input type='radio' name='answer' id='option"+i+"'value='"+i+"'><label for='option"+i+"'><img class='img_option' src='images/"+question.options[i]+"'></label></span>");
		}
	}
	if(question.type == "phrase") {
		for(var i = 0; i < question.options.length; i++){
			$("#options").append("<span class='option'><input type='radio' name='answer' id='option"+i+"'value='"+i+"'><label onclick=\"vocalize('"+question.options[i]+"')\" for='option"+i+"'>"+question.options[i]+"</label></span>");
		}
	}
}

function vocalize(input){
	$("body").append("<audio autoplay><source src=http://tts-api.com/tts.mp3?q=" + escape(input) + " type=audio/mpeg></audio>");
}

function checkAnswer(){
	var given = $("input[type='radio']:checked").val();
	if(given == question.answer){
		correct();
	}
	else{
		incorrect();
	}
}

function correct(){
	progress++;
	$("#progress").progressbar("option", "value", progress);
	if(progress == questions.length+1){
		congrats();
	}
	else{
		loadNextQuestion();
	}
}

function incorrect(){
	vocalize("Try again!");
	questions.push(question);
	$("#progress").progressbar("option", "max", $("#progress").progressbar("option", "max")+1);
}

function congrats(){
	vocalize("Good job!");
	console.log(section.title);
	createCookie(section.title, "completed");
	console.log(document.cookie);
	loadStart();
}

$(document).ready(function(){
	startScreen();
	loadStart();
});

function loadStart(){
	$("div .main").hide();
	$("#start").show();

	for(var i = 0; i < sections.length; i++){
		var secComp = true;
		for(var j = 0; j < sections[i].length; j++){
			if(readCookie(sections[i][j].title) == "completed"){
				$("#"+i+"_"+j).addClass("completed");
			}
			else{
				$("#"+i+"_"+j).removeClass("completed");
				secComp = false;
			}				
		}
		if(secComp)
			$("#"+i).addClass("completed");
		else	
			$("#"+i).removeClass("completed");
	}
}

//

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}