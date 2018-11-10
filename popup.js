
var timer = null;
var timezones = null;

function getOptions() {
	var options = null;
	if (typeof localStorage["options"] != "undefined") {
		options = JSON.parse(localStorage["options"]);
	} else {
		options = {
			"localTimeZone": "UTC"
		}
	}

	return options;
}

// fetches the list timezones we use to auto-complete the drop-down which contains the list of supported
// Time Zones. Also refreshes the selected TZ values from what we've saved.
function initialize() {
	var fromTZ = $("#fromTZ");
	var toTZ = $("#toTZ");
	var usDates = $("#usDates");

	var saved = null;
	if (typeof localStorage["savedTZ"] != "undefined") {
		saved = JSON.parse(localStorage["savedTZ"]);
	} else {
		saved = {
			"from": "UTC",
			"to": "US/Pacific",
			"usDates": true
		}
	}

	fromTZ.val(saved["from"]);
	toTZ.val(saved["to"]);

	if (typeof saved["usDates"] != "undefined" && saved["usDates"]) {
		usDates.attr("checked", "checked");
	} else {
		usDates.attr("checked", null);
	}
}

var last_dtexpr = null;

// This is called when one of the values changes. We need to re-calculate the time
function calculate(val) {
	if (timer != null) {
		clearTimeout(timer);
		timer = null;
	}

	var fromTZ = $("#fromTZ");
	var toTZ = $("#toTZ");
	var time = $("#time");
	var usDates = $("#usDates");

	if (time.val() == "") {
		return;
	}

	// save the selected from/to so that we remeber it next time
	localStorage["savedTZ"] = JSON.stringify({"from": fromTZ.val(), "to": toTZ.val(), "usDates": usDates.prop("checked")});

	if (val == null && parseInt(time.val()).toString() == time.val().trim() && parseInt(time.val()) > 100000) {
		// if you've just input an integer with no other text, we assume it's
		// a unix timestamp... this is a little different because it's gauranteed
		// to be UTC.
		calculateFromTimestamp();
		return;
	} else if (val == null) {
		fromTZ.prop("disabled", false);
		usDates.prop("disabled", false);
	}

	if (val == null) {
		val = time.val();
	}

	chrome.extension.sendRequest({op: "convert", fromTZ: fromTZ.val(), toTZ: toTZ.val(), usDates: usDates.prop("checked"), time: val}, function(response) {
		$("#fromTZ, #toTZ").css("background-color", "#fff");
		if (response.success) {
			last_dtexpr = response.dtexpr;
			$("#result").html(response.time);
			$("#actionsContainer").show();
		} else {
			if (typeof response.invalidTZ == "string") {
				last_dtexpr = null;
				$("#result").html("");
				$("#actionsContainer").hide();

				$(response.invalidTZ).css("background-color", "#fdd");
			} else {
				last_dtexpr = null;
				$("#result").html(response.msg);
				$("#actionsContainer").hide();
			}
		}
	});
}

// calculates the value assuming what's in the input is a Unix timestamp
function calculateFromTimestamp() {
	var fromTZ = $("#fromTZ");
	var toTZ = $("#toTZ");
	var time = $("#time");
	var usDates = $("#usDates");

	fromTZ.val("UTC");
	fromTZ.prop("disabled", true);
	usDates.prop("disabled", true);

	chrome.extension.sendRequest({op: "format", time: parseInt(time.val()), format: "dd mmm yyyy hh:mm:ss"}, function(response) {
		if (response.success) {
			console.log(response.time);
			calculate(response.time);
		} else {
			// ignore errors... shouldn't happen
		}
	});

}

// refreshes the list of timezones we display in the popup list.
function refreshPopupList(input) {
	chrome.extension.sendRequest({op: "timezone-ac", val: input.val()}, function(response) {
		var ul = $("#tzPopupList ul");
		ul.empty();

		for(i in response) {
			var tz = response[i];
			ul.append("<li>"+tz+"</li>");
		}

		$("#tzPopupList li").mouseover(function(evnt) {
			$("li", tzPopupList).removeClass("hover");
			$(this).addClass("hover");
		}).click(function(evnt) {
			input.val($(this).html());
			$("#tzPopupList").hide();
			calculate();
		});
	});
}

function startCalculate() {
	if (timer == null) {
		timer = setTimeout(calculate, 100);
	} else {
		clearTimeout(timer);
		timer = setTimeout(calculate, 100);
	}
}

$(function() {
	initialize();
	$("#fromTZ").change(function() { calculate(); });
	$("#toTZ").change(function() { calculate(); });
	$("#time").change(startCalculate).keyup(startCalculate).mouseup(startCalculate);
	$("#usDates").change(function() { calculate(); });
	
	$("#applyToAll").click(function() {
		if(last_dtexpr == null) {
			alert("no dtexpr");
			return;
		}

		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {method: "applyToAll", dtexpr: last_dtexpr,
					fromTZ: $("#fromTZ").val(), toTZ: $("#toTZ").val(), usDates: $("#usDates").attr("checked") != ""}, function (response) {
				// do nothing!
			});
		});
	});

	$("#swap").click(function() {
		var fromVal = $("#fromTZ").val();
		var toVal = $("#toTZ").val();
		$("#fromTZ").val(toVal);
		$("#toTZ").val(fromVal);
		calculate();
	});

	$("#now").click(function() {
		var now = new Date();
		var fromTZ = $("#fromTZ");
		var time = $("#time");

		var options = getOptions();
		fromTZ.val(options["localTimeZone"]);

		chrome.extension.sendRequest({op: "format", time: now.getTime(), timezone: fromTZ.val(), format: "dd mmm yyyy hh:mm:ss"}, function(response) {
			if (response.success) {
				time.val(response.time);
				calculate();
			} else {
				// ignore errors... shouldn't happen
			}
		});
	});

	$("#fromTZ, #toTZ").focus(function(evnt) {
		evnt.preventDefault();
		evnt.stopPropagation();

		var tzPopupList = $("#tzPopupList");
		var $this = $(this);
		$this.select();

		var p = $this.position();
		tzPopupList.css("left", p.left+"px")
		           .css("top", (p.top + 20)+"px")
		           .show();

		// when you click outside the popup, hide it
		$("body").bind("click.hide-popup", function(evnt) {
			tzPopupList.hide();
			$("body").unbind("click.hide-popup");
		});

		refreshPopupList($this);
	}).click(function(evnt) {
		evnt.stopPropagation();
	}).mouseup(function(evnt) {
		evnt.preventDefault();
	}).keyup(function(evnt) {
		if (evnt.keyCode == 38 || evnt.keyCode == 40) {
			// if you press up (38) or down (40), then focus the popup
			// which'll let you use keyboard navigation
			var tzPopupList = $("#tzPopupList");
			tzPopupList.show();

			var curr = $("li.hover", tzPopupList);
			if (curr.size() != 1) {
				$("li:first", tzPopupList).addClass("hover");
			} else {
				var next = (evnt.keyCode == 38 ? curr.prev() : curr.next());
				if (next.size() == 1) {
					$("li", tzPopupList).removeClass("hover");
					next.addClass("hover");
					$(this).val(next.html());
				}
			}

			return false;
		} else if (evnt.keyCode == 13) {
			// pressing enter just hides the popup, basically
			$("#tzPopupList").hide();
		}

		refreshPopupList($(this));
	});
	$("#tzPopupList").click(function(evnt) {
		evnt.stopPropagation();
	});

	// get the current selection from the document, and pre-populate the #time with it.
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {method: "getSelection"}, function (response) {
			if (typeof response.data != "undefined" && response.data != "") {
				$("#time").val(response.data);
				calculate();
			}
		});
	});

	$("#time").focus();
});

