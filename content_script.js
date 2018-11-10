
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.method == "getSelection") {
		// when the popup requests the current selection from us, we'll send it over
		sendResponse({data: window.getSelection().toString()});
	} else if (request.method == "applyToAll") {
		// when you click "apply to all", we run through the whole document
		var regex = new RegExp(request.dtexpr.expr, "ig");
		var html = document.body.innerHTML;
		var matches = html.match(regex);

		var numComplete = 0;
		for (i in matches) {
			var match = matches[i];

			chrome.extension.sendRequest({op: "convert", fromTZ: request.fromTZ, toTZ: request.toTZ, usDates: request.usDates, time: match}, function(response) {
				if (response.success) {
					html = html.replace(response.fromTime, response.time);
					numComplete = numComplete + 1;
					
					if (numComplete >= matches.length - 1) {
						document.body.innerHTML = html;
					}
				} else {
					alert("error: " + response.msg);
				}
			});
		}
	}
});
