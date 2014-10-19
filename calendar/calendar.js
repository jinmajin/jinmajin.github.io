
/** documentation terminology: events will be split into "levels", where 
* a level is an array of non-colliding events. The levels array
* contains all the events from the original data, but with 
* non-colliding subgroups of events occupying their own level.  
**/

// provided test case
var testData = [{
		start : 540,
		end : 600
	}, {
		start : 30,
		end : 150
	}, {
		start : 560,
		end : 620
	}, {
		start : 610,
		end : 670
	}
];

// more complicated test case
var testData2 = [{
		start : 30,
		end : 60
	}, {
		start : 90,
		end : 180
	}, {
		start : 190,
		end : 500
	}, {
		start : 150,
		end : 240
	}, {
		start : 300,
		end : 420
	}, {
		start : 300,
		end : 420
	}, {
		start : 500,
		end : 600
	}, {
		start : 410,
		end : 600
	}
];

/** loads timeline and given test day events **/
function load(){
	loadTimeline();
	layOutDay(testData);
}

/** load timeline (the display of times on the left) */
function loadTimeline(){
	var timeline = document.getElementById("timeline");
	var startHour = 9;
	var endHour = 21;
	for(var i = 0; i <= (endHour-startHour)*2; i++){
		var currentHour = startHour + i/2;
		var timestr = "AM";
		if(currentHour >= 13){
			currentHour = currentHour % 12;
			timestr = "PM";
		}
		var timeDiv = document.createElement('div');
		if(currentHour % 1 == 0){
			timeDiv.className = "time";
			var darkSpan = document.createElement('span');
			darkSpan.innerHTML = currentHour + ":00";
			darkSpan.className = "darkText";
			var lightSpan = document.createElement('span');
			lightSpan.innerHTML = timestr;
			lightSpan.className = "lightText";
			timeDiv.appendChild(darkSpan);
			timeDiv.appendChild(lightSpan);
		}
		else{
			timeDiv.className = "time halfhour lightText";
			timeDiv.innerHTML = Math.floor(currentHour) + ":30"; 
		}
		timeDiv.style.top = i*30 + "px";
		timeline.appendChild(timeDiv);
	}
}

/** Set the calendar layout to reflect the events parameter */
function layOutDay(events){
	var calendar = document.getElementById('events'); 
	calendar.innerHTML = "";
	var width = 600;
	var offset = 10; // amount of padding to the left padding
	
	var levels = getRanked(events);
	for(var i = 0; i < levels.length; i++){
		for(var j = 0; j < levels[i].length; j++){
			var event = levels[i][j];
			var eventDiv = document.createElement('div');			
			eventDiv.className = "event";
			eventDiv.style.left = offset + i*(width/event.rank) + "px";
			eventDiv.style.top = event.start + "px";
		
			var blueStripe = document.createElement('span');
			blueStripe.className = "blueStripe";
			blueStripe.style.height = (event.end - event.start) + "px";
			
			var dataDiv = document.createElement('div');
			dataDiv.className = "eventInfo";
			dataDiv.style.width = width/event.rank - 11 + "px"; // bluestripe =5, border =1, padding = 5 
			dataDiv.style.height = (event.end - event.start) - 7 + "px"; // border = 2, padding  = 5
			
			var name = document.createElement('div');
			name.innerHTML = "Sample Item";
			name.className = "eventName";
			var location = document.createElement('div');
			location.innerHTML = "Sample Location";
			location.className = "location";
			
			dataDiv.appendChild(name);
			dataDiv.appendChild(location);
			eventDiv.appendChild(blueStripe);
			eventDiv.appendChild(dataDiv);
			calendar.appendChild(eventDiv);
		}
	}
}

/** Sets the rank of each event, where rank denotes
how much space an event can take. Rank 1 events
can take up the whole available width, rank 2 take
up half, rank 3 take a third, etc.
Return the levels array with the calculated ranks*/
function getRanked(data) {
	var levels = getOptimizedLevels(data);

	// set all to rank 1 first
	for (var i = 0; i < levels.length; i++) {
		for (var j = 0; j < levels[i].length; j++) {
			levels[i][j]['rank'] = 1;
		}
	}

	// increment rank with each collision
	levelLoop(levels, function (primaryEvent, collidingEvent) {
		primaryEvent.rank++;
		collidingEvent.rank = Math.max(primaryEvent.rank, collidingEvent.rank);
	});

	// account for the case where an event overlaps with
	// another event that overlaps with more elements
	levelLoop(levels, function (primaryEvent, collidingEvent) {
		primaryEvent.rank = Math.max(primaryEvent.rank, collidingEvent.rank);
		collidingEvent.rank = Math.max(primaryEvent.rank, collidingEvent.rank);
	}, true);

	return levels;
}

/** goes through levels array and runs func on colliding events. 
reverseOrder is whether or not the loop should start at the last level and work backwords*/
function levelLoop(levels, func, reverseOrder) {
	if(!reverseOrder){
		// start from 1st level
		for (var i = 0; i < levels.length; i++) {
			// compare to elements of the levels after it
			for (var j = i + 1; j < levels.length; j++) {
				// modify colliding events in levels i and j by func
				modifyCollidingEvents(levels[i], levels[j], func); 
			}
		}
	}
	else{
		// start from last level
		for (var i = levels.length-1; i >= 0; i--) {
			// compare to elements of the levels before it
			for (var j = i - 1; j >= 0; j--) {
				// modify colliding events in levels i and j by func
				modifyCollidingEvents(levels[i], levels[j], func); 
			}
		}
	}
}


/** given two levels,
*	go through them and compare their events.
*	run func on the colliding events
*/
function modifyCollidingEvents(levelI, levelJ, func){
	var eventI = 0;
	var eventJ = 0;
	while (eventI < levelI.length) {
		if (isOverlapping(levelI[eventI], levelJ[eventJ])) {
			func(levelI[eventI], levelJ[eventJ]);
		}
		eventJ++;
		if (eventJ >= levelJ.length) {
			eventJ = 0;
			eventI++;
		}
	}
}

/** Get optimized levels--each level represents
the max-length array of non-colliding events that have
not been included in a previous level */
function getOptimizedLevels(data) {
	var levels = [];
	while (data.length > 0) {
		var result = greedyGrab(data);
		levels.push(result[0]);
		data = result[1];
	}
	return levels;
}


/** Get the max length array of events that don't collide,
return an array of these non-colliding events and the
remaining events */
function greedyGrab(data) {
	data.sort(function (event1, event2) {
		return event1.end - event2.end
	});
	var results = [];
	var remainder = [];
	for (var i = 0; i < data.length; i++) {
		if (results.length == 0 || data[i].start >= results[results.length - 1].end) {
			results.push(data[i]);
		} else {
			remainder.push(data[i]);
		}
	}
	return [results, remainder];
}

/** Given 2 events, return true if they overlap */
function isOverlapping(event1, event2) {
	return event1.start < event2.end && event2.start < event1.end;
}

