var options = [];
var listItems = {"running": "<li class=\"tb-running\"></li>",
                 "total-uptime": "<li class=\"tb-total-uptime\"></li>",
                 "current-uptime": "<li class=\"tb-current-uptime\"></li>",
                 "location": "<li class=\"tb-location\"></li>",
                 "bandwidth": "<li class=\"tb-bandwidth\"></li>",
                 "traffic": "<li class=\"tb-traffic\"></li>",
                 "hostname": "<li class=\"tb-hostname\"></li>",
                 "platform": "<li class=\"tb-platform\"></li>",
                 "weight": "<li class=\"tb-weight\"></li>",
                 "weight-fraction": "<li class=\"tb-weight-fraction\"></li>",
                 "contact": "<li class=\"tb-contact\"></li>",
                 "flags": "<li class=\"tb-flags\"></li>"};
var badgeWidth = "600px";
var getURL = "https://onionoo.torproject.org/";

$(document).ready(function() {
    fill(".tor-badge");
});

//Fills the Tor Badge
function fill(badge) {
    options = $(badge).attr("data-options").replace(/ /g, "").split(",");
    framework(badge);
    style(badge);
    content(badge);
}

//Fills the basic HTML Framework
function framework(badge) {
    $(badge).html("");
    $(badge).append("<div class=\"tb-head\"></div>");
    $(badge).append("<div class=\"tb-body\"></div>");
    var tbHead = $(badge).children(".tb-head");
    var tbBody = $(badge).children(".tb-body");
    $(tbHead).append("<h1 class=\"tb-name\">Relay Name</h1>");
    $(tbHead).append("<img class=\"tb-logo\" src=\"onion.png\" " +
                     "alt=\"Onion Logo\">");
    $(tbHead).append("<p class=\"tb-type\">Relay Type</p>");
    $(tbBody).append("<ul class=\"tb-info\"></ul>");
    var tbInfo = $(tbBody).children(".tb-info");
    for (var i = 0; i < options.length; i++) {
        if (listItems[options[i]] == undefined) {
            console.log("List Option not found: " + options[i]);
        } else {
            $(tbInfo).append(listItems[options[i]]);
        }
    }
}

//Applies CSS
function style(badge) {
    var tbHead = $(badge).children(".tb-head");
    var tbBody = $(badge).children(".tb-body");
    var tbInfo = $(tbBody).children(".tb-info");
    //Base CSS
    $(badge).width(badgeWidth);
    $(badge).css({
        padding: "10px",
        backgroundColor: "#E5FFCC",
        borderRadius: "5px",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#71E600",
        display: "-webkit-flex",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
    });
    //Head CSS
    $(tbHead).width("50%");
    $(tbHead).css({
        margin: "auto",
    });
    $(tbHead).children(".tb-name").css({
        margin: "0px",
        color: "purple",
        fontSize: "28px",
        fontFamily: "sans-serif",
        textAlign: "center",
    });
    $(tbHead).children(".tb-logo").css({
        display: "block",
        margin: "20px auto",
    });
    $(tbHead).children(".tb-type").css({
        margin: "0px",
        fontSize: "20px",
        textAlign: "center",
    });
    //Body CSS
    $(tbBody).width("50%");
    $(tbBody).css({
    });
    $(tbBody).children(".tb-info").css({
        listStyle: "none",
        padding: "0px",
        margin: "auto",
        fontSize: "18px",
    });
    $(tbInfo).children("li").css({
        padding: "2px",
    });
}

function content(badge) {
    details(badge);
}

//Fills relay or bridge details
function details(badge) {
    var id = $(badge).attr("id");
    var url = getURL + "details";
    $.get(url, {fingerprint: id} )
        .done(function(data) {
            if (data.relays.length == 1) {
                fillHead(badge, data.relays[0]);
                relayDetails(badge, data.relays[0]);
            } else if (data.bridges.length == 1) {
                console.log("Bridges not yet supported");
            } else {
                console.log("Fingerprint Error");
            }
        });
}

//Fills badge head section
function fillHead(badge, data) {
    var tbHead = $(badge).children(".tb-head");
    $(tbHead).children(".tb-name").text(data.nickname);
    if (data.guard_probability >= data.middle_probability &&
        data.guard_probability >= data.exit_probability) {
        $(tbHead).children(".tb-type").text("Guard Relay");
    } else if (data.exit_probability >= data.middle_probability &&
               data.exit_probability >= data.guard_probability) {
        $(tbHead).children(".tb-type").text("Exit Relay");
    } else {
        $(tbHead).children(".tb-type").text("Middle Relay");
    }
}

//Fills Relay Details
function relayDetails(badge, data) {
    var tbBody = $(badge).children(".tb-body");
    var tbInfo = $(tbBody).children(".tb-info");
    var firstSeen = new Date(data.first_seen.replace(" ", "T"));
    var lastRestarted = new Date(data.last_restarted.replace(" ", "T"))
    var totalTime = new Date() - firstSeen;
    var currentTime = new Date() - lastRestarted;
    var currentUptime = parseMilliseconds(currentTime);
    var location = data.city_name + ", " + data.region_name;
    var bandwidth = parseBandwidth(parseInt(data.advertised_bandwidth, 10)) + "/s";
    var weightFraction = data.consensus_weight_fraction * 100 + "%";
    var flags = data.flags;
    $(tbInfo).children(".tb-running").text("Running: " + data.running);
    $(tbInfo).children(".tb-current-uptime").text("Current Uptime: " + currentUptime);
    $(tbInfo).children(".tb-location").text("Location: " + location);
    $(tbInfo).children(".tb-bandwidth").text("Bandwidth: " + bandwidth);
    $(tbInfo).children(".tb-hostname").text("Hostname: " + data.host_name);
    $(tbInfo).children(".tb-platform").text("Platform: " + data.platform);
    $(tbInfo).children(".tb-weight").text("Weight: " + data.consensus_weight);
    $(tbInfo).children(".tb-weight-fraction").text("Weight Fraction: " + weightFraction);
    $(tbInfo).children(".tb-contact").text("Contact: " + data.contact);
    $(tbInfo).children(".tb-flags").text("Flags: " + flags);
    getUptime(badge, totalTime);
    getTraffic(badge);
}

//Get Uptime
function getUptime(badge, totalTime) {
    var id = $(badge).attr("id");
    var url = getURL + "uptime"
    $.get(url, {fingerprint: id} )
        .done(function(data) {
            if (data.relays.length == 1) {
                fillUptime(badge, data.relays[0], totalTime);
            } else if (data.bridges.length == 1) {
                fillUptime(badge, data.bridges[0], totalTime);
            } else {
                console.log("Unknown error");
            }
        });
}

//Parses and fills Uptime
function fillUptime(badge, uptime, totalTime) {
    var tbBody = $(badge).children(".tb-body");
    var tbInfo = $(tbBody).children(".tb-info");
    var timeframe;
    var upPercent;
    var upString = "";
    if (uptime.uptime["5_years"] != undefined) {
        timeframe = uptime.uptime["5_years"];
    } else if (uptime.uptime["1_year"] != undefined) {
        timeframe = uptime.uptime["1_year"];
    } else if (uptime.uptime["3_months"] != undefined) {
        timeframe = uptime.uptime["3_months"];
    } else if (uptime.uptime["1_month"] != undefined) {
        timeframe = uptime.uptime["1_month"];
    } else if (uptime.uptime["1_week"] != undefined) {
        timeframe = uptime.uptime["1_week"];
    } else if (uptime.uptime["3_days"] != undefined) {
        timeframe = uptime.uptime["3_days"];
    } else {
        console.log("Uptime Error, no valid option");
        return;
    }
    upPercent = 0;
    for (var i = 0; i < timeframe.count; i++) {
        upPercent += timeframe.values[i];
    }
    upPercent /= timeframe.count;
    upPercent *= timeframe.factor;
    upString = parseMilliseconds(totalTime * upPercent);
    $(tbInfo).children(".tb-total-uptime").text("Total Uptime: " + upString);
}

//Get Traffic
function getTraffic(badge) {
    var id = $(badge).attr("id");
    var url = getURL + "bandwidth"
    $.get(url, {fingerprint: id} )
        .done(function(data) {
            if (data.relays.length == 1) {
                fillTraffic(badge, data.relays[0]);
            } else if (data.bridges.length == 1) {
                fillTraffic(badge, data.bridges[0]);
            } else {
                console.log("Unknown error");
            }
        });
}

//Parses and fills Traffic
function fillTraffic(badge, traffic) {
    var tbBody = $(badge).children(".tb-body");
    var tbInfo = $(tbBody).children(".tb-info");
    var timeframe;
    var totalRead = 0;
    var totalWrite = 0;
    var totalTraffic;
    if (traffic.write_history["5_years"] != undefined) {
        timeframe = "5_years";
    } else if (traffic.write_history["1_year"] != undefined) {
        timeframe = "1_year";
    } else if (traffic.write_history["3_months"] != undefined) {
        timeframe = "3_months";
    } else if (traffic.write_history["1_month"] != undefined) {
        timeframe = "1_month";
    } else if (traffic.write_history["1_week"] != undefined) {
        timeframe = "1_week";
    } else if (traffic.write_history["3_days"] != undefined) {
        timeframe = "3_days";
    } else {
        console.log("Traffic Error, no valid option");
        return;
    }
    for (var i = 0; i < traffic.write_history[timeframe].count; i++) {
        totalWrite += traffic.write_history[timeframe].values[i];
    }
    totalWrite *= traffic.write_history[timeframe].factor;
    totalWrite *= traffic.write_history[timeframe].interval;
    for (var i = 0; i < traffic.read_history[timeframe].count; i++) {
        totalRead += traffic.read_history[timeframe].values[i];
    }
    totalRead *= traffic.read_history[timeframe].factor;
    totalRead *= traffic.read_history[timeframe].interval;
    totalTraffic = totalWrite + totalRead;
    $(tbInfo).children(".tb-traffic").text("Traffic: " + parseBandwidth(totalTraffic));
}

//Converts bandwidth bytes to the appropriate human-readable unit
function parseBandwidth(bytes) {
    if (bytes == 0) {
        return "0 Bytes";
    }
    var units = ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB"];
    var index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (bytes / Math.pow(1000, index)).toPrecision(3) + " " + units[index];
}

//Converts milliseconds to the appropriate human-readable unit
function parseMilliseconds(millis) {
    var upString = "";
    var upSeconds = millis / 1000;
    if (upSeconds >= 31536000) {
        var year = Math.floor(upSeconds / 31536000);
        upSeconds %= 31536000;
        upString += year + " year";
        if (year > 1) {
            upString += "s";
        }
        upString += " ";
    }
    if (upSeconds >= 2592000) {
        var month = Math.floor(upSeconds / 2592000);
        upSeconds %= 2592000;
        upString += month + " month";
        if (month > 1) {
            upString += "s";
        }
        upString += " ";
    }
    if (upSeconds >= 86400) {
        var day = Math.floor(upSeconds / 86400);
        upSeconds %= 86400;
        upString += day + " day";
        if (day > 1) {
            upString += "s";
        }
        upString += " ";
    }
    return upString;
}
