
var options = null;
if (typeof localStorage["options"] != "undefined") {
	options = JSON.parse(localStorage["options"]);
} else {
	options = {
		"localTimeZone": "UTC"
	}
}

var localTimeZone = $("#localTimeZone");

chrome.extension.sendRequest({op: "tzlist"}, function(all_timezones) {
	for(i in all_timezones) {
		var opt = $("<option>"+all_timezones[i]+"</option>");

		if (options["localTimeZone"] == all_timezones[i]) {
			opt.prop("selected", true);
		}
		localTimeZone.append(opt);
	}
});

localTimeZone.change(function() {
	options["localTimeZone"] = localTimeZone.val();
	localStorage["options"] = JSON.stringify(options);
});

