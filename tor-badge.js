$(document).ready(function() {
    console.log("ready!");
    fill(".tor-relay-badge");
    style(".tor-relay-badge");
    getData(".tor-relay-badge");
});

function getData(card) {
    var id = $(card).attr("id");
    var url = "https://onionoo.torproject.org/details"
    console.log(id);
    $.get(url, {fingerprint: id} )
        .done(function(data) {
            if (data.relays.length == 1) {
                fillRelay(card, data.relays[0]);
            } else if (data.bridges.length == 1) {
                console.log("Bridges not yet supported");
            } else {
                console.log("Fingerprint Error");
            }
        });
}

function fillRelay(card, data) {
    var trHead = $(card).children(".tr-head");
    var trBody = $(card).children(".tr-body");
    var trInfo = $(trBody).children(".tr-info");
    console.log(data);
    $(trHead).children(".tr-name").text(data.nickname);
    if (data.guard_probability >= data.middle_probability && data.guard_probability >= data.exit_probability) {
        $(trHead).children(".tr-type").text("Guard Relay");
    } else if (data.exit_probability >= data.middle_probability && data.exit_probability >= data.guard_probability) {
        $(trHead).children(".tr-type").text("Exit Relay");
    } else {
        $(trHead).children(".tr-type").text("Middle Relay");
    }
    $(trInfo).children(".tr-run").text("Running: " + data.running);
    $(trInfo).children(".tr-start").text("First Seen: " + data.first_seen.substring(0, data.first_seen.indexOf(" ")));
    $(trInfo).children(".tr-location").text("Location: " +  data.city_name + ", " + data.region_name);
    $(trInfo).children(".tr-bandwidth").text("Bandwidth: " + data.advertised_bandwidth);
    $(trInfo).children(".tr-weight").text("Weight: " + data.consensus_weight);
    $(trInfo).children(".tr-flags").text("Flags: " + data.flags);
}

function fill(card) {
    $(card).append('<div class="tr-head"></div>');
    $(card).append('<div class="tr-body"></div>');
    var trHead = $(card).children(".tr-head");
    var trBody = $(card).children(".tr-body");
    $(trHead).append('<h1 class="tr-name">Relay Name</h1>');
    $(trHead).append('<img class="tr-logo" src="onion.png" alt="Onion Logo">');
    $(trHead).append('<p class="tr-type">Relay Type</p>');
    $(trBody).append('<ul class="tr-info"></ul>');
    $(trBody).children(".tr-info").append('<li class="tr-run">Running: </li>');
    $(trBody).children(".tr-info").append('<li class="tr-start">First Seen: </li>');
    $(trBody).children(".tr-info").append('<li class="tr-location">Location: </li>');
    $(trBody).children(".tr-info").append('<li class="tr-bandwidth">Bandwidth: </li>');
    $(trBody).children(".tr-info").append('<li class="tr-weight">Weight: </li>');
    $(trBody).children(".tr-info").append('<li class="tr-flags">Flags: </li>');
}

function style(card) {
    var trHead = $(card).children(".tr-head");
    var trBody = $(card).children(".tr-body");
    //Base Formatting
    $(card).width("500px");
    $(card).height("225px");
    $(card).css({
        padding: "10px",
        backgroundColor: "#E5FFCC",
        borderRadius: "5px",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#71E600",
    });
    //Head Formatting
    $(trHead).width("50%");
    $(trHead).height("100%");
    $(trHead).css({
        float: "left",
    });
    $(trHead).children(".tr-name").css({
        margin: "0px",
        color: "purple",
        fontSize: "28px",
        fontFamily: "serif",
        textAlign: "center",
    });
    $(trHead).children(".tr-logo").css({
        display: "block",
        marginTop: "15px",
        marginBottom: "15px",
        marginLeft: "auto",
        marginRight: "auto",
    });
    $(trHead).children(".tr-type").css({
        margin: "0px",
        padding: "5px",
        fontSize: "20px",
        fontFamily: "sans-serif",
        textAlign: "center",
    });
    //Body Formatting
    $(trBody).width("50%");
    $(trBody).height("100%");
    $(trBody).css({
        float: "left",
    });
    $(trBody).children(".tr-info").css({
        listStyle: "none",
        padding: "0px",
        marginTop: "34px",
        fontSize: "18px",
    });
    $(trBody).children(".tr-info").children("li").css({
        padding: "2px",
    });
}


