var _tz = timezoneJS.timezone;
_tz.loadingScheme = _tz.loadingSchemes.MANUAL_LOAD;
_tz.loadZoneDataFromObject(all_cities);

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-18096807-3']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function array_indexOf(array, elt /*, from*/) {
	var len = array.length;

	var from = Number(arguments[1]) || 0;
	from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	if (from < 0) {
		from += len;
	}

	for (; from < len; from++) {
		if (from in array && array[from] === elt) {
			return from;
		}
	}
	return -1;
}


// returns a copy of this array with duplicates removed
function array_dedupe(array) {
	var res = [];
	for (i in array) {
		var found = false;
		for (j in res) {
			if (array[i] == res[j]) {
				found = true;
				break;
			}
		}
		if (!found) {
			res[res.length] = array[i];
		}
	}
	return res;
}

var date_expressions = [
	{
		name: "yyyy-mm-dd hh:mm:ss",
		expr: "([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})[Tt ]([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))(.[0-9]+)?",
		groups: {year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 7},
		format: "%YYYY%-%MM%-%DD% %hh%:%mm%:%ss%"
	}, {
		name: "mmm dd yyyy hh:mm:ss",
		expr: "([A-Za-z]+) ([0-9]{1,2}) \'?([0-9]{2,4}) (at )?([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?",
		groups: {month: 1, day: 2, year: 3, hour: 5, minute: 6, second: 8},
		format: "%DOW+%, %Mmm% %DD% %YYYY% %hh%:%mm%:%ss% %ampm%"
	}, {
		name: "dd mmm yyyy hh:mm:ss",
		expr: "([0-9]{1,2})[ -]([A-Za-z]+)[ -]\'?([0-9]{2,4}) (at )?([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?( (am|pm))?",
		groups: {month: 2, day: 1, year: 3, hour: 5, minute: 6, second: 8, ampm: 10},
		format: "%DOW+%, %DD% %Mmm% %YYYY% %hh%:%mm%:%ss% %ampm%"
	}, {
		name: "mmmm dd, yyyy hh:mm:ss",
		expr: "([A-Za-z]+, *)?([A-Za-z]+) ([0-9]{1,2}),? ([0-9]{2,4}) ([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?( (am|pm))?",
		groups: {month: 2, day: 3, year: 4, hour: 5, minute: 6, second: 8, ampm: 10},
		format: "%DOW+%, %Mmmm% %DD%, %YYYY% %hh%:%mm%:%ss%"
	}, {
		name: "dd mmmm, yyyy hh:mm:ss",
		expr: "([A-Za-z]+, *)?([A-Za-z]+) ([0-9]{1,2}),? ([0-9]{2,4}) ([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?( (am|pm))?",
		groups: {month: 2, day: 3, year: 4, hour: 5, minute: 6, second: 8, ampm: 10},
		format: "%DOW+%, %DD% %Mmmm%, %YYYY% %hh%:%mm%:%ss%"
	}, {
		name: "yymmdd HH:mm:ss",
		expr: "([0-9]{2,4})([0-9]{2})([0-9}{2}) ([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?",
		groups: {year: 1, month: 2, day: 3, hour: 4, minute: 5, second: 7},
		format: "%DOW+%, %YYYY%%MM%%DD% %hh%:%mm%:%ss%"
	}
];

var us_date_expressions = [
	{
		name: "mm/dd/yyyy hh:mm:ss",
		expr: "([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4}) ([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))(.[0-9]+)?( (am|pm))?",
		groups: {month: 1, day: 2, year: 3, hour: 4, minute: 5, second: 7, ampm: 9},
		format: "%DOW+%, %MM%/%DD%/%YYYY% %hh%:%mm%:%ss% %ampm%"
	}
];

var eu_date_expressions = [
	{
		name: "dd/mm/yyyy hh:mm:ss",
		expr: "([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4}) ([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))(.[0-9]+)?( (am|pm))?",
		groups: {day: 1, month: 2, year: 3, hour: 4, minute: 5, second: 7, ampm: 9},
		format: "%DOW+%, %DD%/%MM%/%YYYY% %hh%:%mm%:%ss% %ampm%"
	}
];

var short_month = [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var long_month = [null, "January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var short_day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var long_day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function padZeros(n, zeros) {
	n = n.toString();
	while (n.length < zeros) {
		n = "0" + n;
	}
	return n;
}

function stripZeros(n) {
	if (typeof n == "undefined") {
		return 0;
	}

	while (n.substr(0,1) == '0') {
		n = n.substr(1);
	}
	return n;
}

function parseDate(str, isUS) {
	var expressions = date_expressions;
	if (isUS) {
		expressions = expressions.concat(us_date_expressions);
	} else {
		expressions = expressions.concat(eu_date_expressions);
	}

	for(i in expressions) {
		var dtexpr = expressions[i];
		
		var match = new RegExp("^"+dtexpr.expr+"$", "i").exec(str.trim());
		if (!match || match[0] == "") {
			continue;
		}
		
		var year = match[dtexpr.groups.year];
		var month = match[dtexpr.groups.month];
		var day = match[dtexpr.groups.day];
		var hour = match[dtexpr.groups.hour];
		var minute = match[dtexpr.groups.minute];
		var second = match[dtexpr.groups.second];
		var ampm = "am";
		if (typeof dtexpr.groups.ampm != "undefined" && typeof match[dtexpr.groups.ampm] != "undefined")
			ampm = match[dtexpr.groups.ampm];

		year = parseInt(stripZeros(year));
		if (year < 100) {
			year += 2000;
		}
		day = parseInt(stripZeros(day));
		hour = parseInt(stripZeros(hour));
		minute = parseInt(stripZeros(minute));
		second = parseInt(stripZeros(second));

		console.log("Matched expr: "+dtexpr.expr+" ("+dtexpr.name+")");
		console.log("Input Date: "+year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second);				

		if (ampm.trim().toLowerCase() == "pm") {
			hour += 12;
		}
		
		for(var j in short_month) {
			if (j == 0) {
				continue;
			}
			if (month.toString().toLowerCase() == short_month[j].toLowerCase()) {
				month = j;
				break;
			}
		}
		for(var j in long_month) {
			if (j == 0) {
				continue;
			}
			if (month.toString().toLowerCase() == long_month[j].toLowerCase()) {
				month = j;
				break;
			}
		}

		return {
			dtexpr: dtexpr,
			date: new timezoneJS.Date(year, month - 1, day, hour, minute, second, "UTC")
		};
	}
	
	return null;
}

function formatDate(dt, fmt) {
	var hour = dt.hours;
	var ampm = "";
	if (fmt.indexOf("%ampm%") >= 0) {
		if (hour > 12) {
			ampm = "pm";
			hour -= 12;
		} else {
			ampm = "am";
		}
		if (hour == 0) {
			hour = 12;
		}
	}

	fmt = fmt.replace("%DOW%", short_day[dt._day]);
	fmt = fmt.replace("%DOW+%", long_day[dt._day]);
	fmt = fmt.replace("%YYYY%", padZeros(dt.year, 4));
	fmt = fmt.replace("%Mmm%", short_month[dt.month + 1]);
	fmt = fmt.replace("%Mmmm%", long_month[dt.month + 1]);
	fmt = fmt.replace("%MM%", padZeros(dt.month + 1, 2));
	fmt = fmt.replace("%DD%", padZeros(dt.date, 2));
	fmt = fmt.replace("%hh%", padZeros(hour, 2));
	fmt = fmt.replace("%mm%", padZeros(dt.minutes, 2));
	fmt = fmt.replace("%ss%", padZeros(dt.seconds, 2));
	fmt = fmt.replace("%ampm%", ampm);
	return fmt;
}

function getLastTimezones() {
	try {
		if (typeof localStorage["lastTimezones"] == "undefined") {
			return [];
		} else {
			return JSON.parse(localStorage["lastTimezones"]);
		}
	} catch (e) {
		return [];
	}
}

function isValidTimezone(tz) {
	var timezones = _tz.getAllZones();
	for(i in timezones) {
		if (timezones[i].toLowerCase() == tz.toLowerCase()) {
			return true;
		}
	}

	return false;
}

// does the main lifting: converts a time from one timezone to another
function performConvert(params) {
	if (!isValidTimezone(params.toTZ) && !isValidTimezone(params.fromTZ)) {
		return {success: false, invalidTZ: "#toTZ, #fromTZ"};
	}
	if (!isValidTimezone(params.fromTZ)) {
		return {success: false, invalidTZ: "#fromTZ"};
	}
	if (!isValidTimezone(params.toTZ)) {
		return {success: false, invalidTZ: "#toTZ"};
	}

	var parsed = parseDate(params.time, params.usDates);
	if (parsed == null) {
		return {success: false, msg: "Invalid value: "+params.time};
	}

	var indt = parsed.date;
	indt.setTimezone(params.fromTZ);
	
	var utc = indt.getTime();

	var outdt = new timezoneJS.Date();
	outdt.setTimezone(params.toTZ);
	outdt.setTime(utc);

	var lastTimezones = getLastTimezones();

	lastTimezones.splice(0, 0, params.toTZ, params.fromTZ);
	lastTimezones = array_dedupe(lastTimezones);

	if (lastTimezones.length > 10) {
		lastTimezones = lastTimezones.slice(0, 9);
	}

	localStorage["lastTimezones"] = JSON.stringify(lastTimezones);
	console.log(JSON.stringify(lastTimezones));

	return {success: true, time: formatDate(outdt, parsed.dtexpr.format), dtexpr: parsed.dtexpr, fromTime: params.time};
}

// formats a date/time (passed to as in new Date().getTime()) using the specified format name
function performFormat(params) {
	var time = params.time;
	var fmtName = params.format;

	var dt = new timezoneJS.Date();
	dt.setTimezone(typeof params.timezone == "undefined" ? "UTC" : params.timezone);
	dt.setTime(time);

	for(i in date_expressions) {
		var dtexpr = date_expressions[i];

		if (dtexpr.name == fmtName) {
			var formatted = formatDate(dt, dtexpr.format);

			for(var i in long_day) {
				var d = long_day[i];
				if (formatted.indexOf(d+", ") == 0) {
					formatted = formatted.substr(d.length + 2);
				}
			}

			return {success: true, time: formatted};
		}
	}

	return {success: false, msg: "No such format: "+fmtName};
}

// when you type something into the timezone boxes, we'll try to auto-complete what you're saying.
function performTimezoneAutocomplete(params) {
	var timezones = _tz.getAllZones();

	var matches = [];
	var val = params.val.toLowerCase();
	for(i in timezones) {
		var tz = timezones[i];
		console.log("["+i+"] -- "+JSON.stringify(tz));
		var tzl = tz.toLowerCase();

		if (tzl == val) {
			// if you've typed in a whole timezone, then we actually return the last 10
			// timezones that you've used to perform a conversion
			matches = getLastTimezones();

			// add the value you typed as well...
			matches.splice(0, 0, tz);

			// make sure we don't duplicate any values..
			matches = array_dedupe(matches);

			return matches;
		}

		var idx = tzl.indexOf(val);
		if (idx >= 0) {
			matches[matches.length] = { "name": tz, "index": idx };
		}
	}

	// sort the matches by the index the search term was found in. This will prioritize
	// (for example) "US/Pacific" over "Africa/Damascus" if you type in "US".
	matches.sort(function(a, b) {
		if (a.index == b.index) {
			return (a.name < b.name) ? -1 : 1;
		}
		return a.index - b.index;
	});

	var names = [];
	for(i in matches) {
		names[names.length] = matches[i].name;
	}

	return names;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	var resp = null;
	if (request.op == "convert") {
		resp = performConvert(request);
	} else if (request.op == "tzlist") {
		resp = _tz.getAllZones();
	} else if (request.op == "format") {
		resp = performFormat(request);
	} else if (request.op == "timezone-ac") {
		resp = performTimezoneAutocomplete(request);
	}

	if (resp.success || request.op == "tzlist") {
		_gaq.push(['_trackEvent', request.op, 'executed']);
	}
	
	sendResponse(resp);
});

