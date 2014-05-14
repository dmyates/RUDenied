function init() {
		console.log("Initialising popup page...");
		
    getPageQuotas();
    getNoticeboard();
    
    console.log("Popup page initialised");
}

function getPageQuotas() {
		console.log("Getting page quotas...");
		
		loadQuotaFromFrontEnd();
    if (localStorage["HasUserQuotaFromFrontEnd"]) {
		$('#username').text(localStorage["UsernameFE"]);
        //document.getElementById("username").innerHTML = localStorage["UsernameFE"];
        var mb = localStorage["UserBytesFE"] / 1048576;
        var days = localStorage["UserNumDaysFE"];
        document.getElementById("userMebibytes").innerHTML = mb.toFixed(2);
        document.getElementById("userMebibytesPerDay").innerHTML = (mb / days).toFixed(2);
        document.getElementById("userNumDays").innerHTML = days;
        document.getElementById("userCategory").innerHTML = localStorage["UserCategoryFE"];
        document.getElementById("userPercentage").innerHTML = localStorage["UserPercentageFE"];
    }
    if (localStorage["HasHostQuotaFromFrontEnd"]) {
        document.getElementById("hostname").innerHTML = localStorage["HostnameFE"];
        var mb = localStorage["HostBytesFE"] / 1048576;
        var days = localStorage["HostNumDaysFE"];
        document.getElementById("hostMebibytes").innerHTML = mb.toFixed(2);
        document.getElementById("hostMebibytesPerDay").innerHTML = (mb / days).toFixed(2);
        document.getElementById("hostNumDays").innerHTML = days;
        document.getElementById("hostCategory").innerHTML = localStorage["HostCategoryFE"];
        document.getElementById("hostPercentage").innerHTML = localStorage["HostPercentageFE"];
    }
    if (localStorage["HasUnauthQuotaFromFrontEnd"]) {
        document.getElementById("unauthname").innerHTML = localStorage["UnauthnameFE"];
        var days = localStorage["UnauthNumDaysFE"];
        var requests = localStorage["UnauthRequestsFE"];
        var percentage = localStorage["UnauthPercentageFE"];
        document.getElementById("unauthNumHours").innerHTML = (days * 24);
        document.getElementById("unauthRequests").innerHTML = localStorage["UnauthRequestsFE"];
        document.getElementById("unauthPercentage").innerHTML = localStorage["UnauthPercentageFE"];
        document.getElementById("unauthMaxRequests").innerHTML = 1440; //(requests * 100 / percentage).toFixed(0);
        document.getElementById("unauthCategory").innerHTML = localStorage["UnauthCategoryFE"];
    }

    //Load graphs
    loadGraphs();
    
    //Set the visible tab from preferences
    var option = localStorage["UserOrHost"];

    if (option == "PerUser") {
        $("#PerUser").addClass("current");
        $("#PerHost").removeClass("current");
        $("#UnauthenticatedRequests").removeClass("current");
    		$("#Noticeboard").removeClass("current");
    }
    else if (option == "PerHost") {
        $("#PerUser").removeClass("current");
        $("#PerHost").addClass("current");
        $("#UnauthenticatedRequests").removeClass("current");
    		$("#Noticeboard").removeClass("current");
    }
    else if (option == "UnauthenticatedRequests") {
        $("#PerUser").removeClass("current");
        $("#PerHost").removeClass("current");
        $("#UnauthenticatedRequests").addClass("current");
    		$("#Noticeboard").removeClass("current");
    }
    else if (option == "Noticeboard") {
        $("#PerUser").removeClass("current");
        $("#PerHost").removeClass("current");
        $("#UnauthenticatedRequests").removeClass("current");
    		$("#Noticeboard").addClass("current");
    }
    else {
        setCookie("UserOrHost", "PerUser");
        $("#PerUser").addClass("current");
        $("#PerHost").removeClass("current");
        $("#UnauthenticatedRequests").removeClass("current");
    		$("#Noticeboard").removeClass("current");
    }
}

function getNoticeboard() {
    var noticeboardRssUrl = "http://noticeboard.ru.ac.za/rss.xml";
    var noticeboardReq = new XMLHttpRequest();
    
    function noticeboardReceived() {
    		var xml = this.responseXML;
    		var items = xml.getElementsByTagName('item');
    		var output = "";
    		for (var i=0; i<items.length; i++) {
    				var item = items[i];
    				var title = item.getElementsByTagName('title')[0].firstChild.nodeValue;
    				var link = item.getElementsByTagName('link')[0].firstChild.nodeValue;
    				output += '<p class="newsItem"><a href="' + link + ' target="_blank">' + title + '</a><br />' + item.getElementsByTagName('description')[0].firstChild.nodeValue.replace(/(<([^>]+)>)/ig,"").substring(0, 75) + ' [<a href="' + link + '" target="_blank">more</a>]</p>\n';
    		}
    		output += '<br />'
    		document.getElementById("noticeboardContent").innerHTML = output;
    }
    
    noticeboardReq.open("GET", noticeboardRssUrl, true);
    noticeboardReq.onload = noticeboardReceived;
    noticeboardReq.send(null);
}

function refreshPage() {
    //Get the PerUser quota information
    var userUrl = getUserQuotaTextUrl();
    var userReq = new XMLHttpRequest();

    //Get the PerHost quota information
    var hostUrl = getHostQuotaTextUrl();
    var hostReq = new XMLHttpRequest();

    //Get the UnauthenticatedRequest quota information
    var unauthUrl = getUnauthQuotaTextUrl();
    var unauthReq = new XMLHttpRequest();

    //Async PerUser processing
    function userInfoReceived() {
        var userResponse = this.responseText;
        if (userResponse.length) {
            // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
            userResponse = userResponse.replace(/\W*$/, "");

            // Get the fields: 0 = id, 1 = bytes, 2 = number of days, 3 = ???boolean, 4 = description, 5 = percentage
            var arr = userResponse.split("\t");
            if (arr.length == 6) {
                document.getElementById("username").innerHTML = arr[0].substring(1);
                var mb = parseFloat(arr[1]) / 1048576;
                var days = parseInt(arr[2]);
                document.getElementById("userMebibytes").innerHTML = mb.toFixed(2);
                document.getElementById("userMebibytesPerDay").innerHTML = (mb / days).toFixed(2);
                document.getElementById("userNumDays").innerHTML = days;
                document.getElementById("userCategory").innerHTML = arr[4];
                document.getElementById("userPercentage").innerHTML = arr[5];
            }
        }
    }

    //Async PerHost processing
    function hostInfoReceived() {
        var hostResponse = this.responseText;
        if (hostResponse.length) {
            // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
            hostResponse = hostResponse.replace(/\W*$/, "");

            // Get the fields: 0 = id, 1 = bytes, 2 = number of days, 3 = ???boolean, 4 = description, 5 = percentage
            var arr = hostResponse.split("\t");
            if (arr.length == 6) {
                document.getElementById("hostname").innerHTML = arr[0].substring(1);
                var mb = parseFloat(arr[1]) / 1048576;
                var days = parseInt(arr[2]);
				document.getElementById("hostMebibytes").innerHTML = mb.toFixed(2);
                document.getElementById("hostMebibytesPerDay").innerHTML = (mb / days).toFixed(2);
                document.getElementById("hostNumDays").innerHTML = days;
                document.getElementById("hostCategory").innerHTML = arr[4];
                document.getElementById("hostPercentage").innerHTML = arr[5];
            }
        }
    }

    //Async UnauthenticatedRequest processing
    function unauthInfoReceived() {
        var unauthResponse = this.responseText;
        if (unauthResponse.length) {
            // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
            unauthResponse = unauthResponse.replace(/\W*$/, "");

            // Get the fields: 0 = id, 1 = number of days, 2 = number of requests, 3 = ???boolean, 4 = description, 5 = percentage
            var arr = unauthResponse.split("\t");
            if (arr.length == 6) {
                document.getElementById("unauthname").innerHTML = arr[0].substring(1);
                var days = parseInt(arr[2]);
                var requests = parseFloat(arr[1]);
                var percentage = parseFloat(arr[5]);
                document.getElementById("unauthNumHours").innerHTML = (days * 24);
                document.getElementById("unauthRequests").innerHTML = arr[1];
                document.getElementById("unauthPercentage").innerHTML = arr[5];
                document.getElementById("unauthMaxRequests").innerHTML = 1440; //(requests * 100 / percentage).toFixed(0);
                document.getElementById("unauthCategory").innerHTML = arr[4];
            }
        }
    }

    loadGraphs();

    userReq.open("GET", userUrl, true);
    userReq.onload = userInfoReceived;
    userReq.send(null);

    hostReq.open("GET", hostUrl, true);
    hostReq.onload = hostInfoReceived;
    hostReq.send(null);

    unauthReq.open("GET", unauthUrl, true);
    unauthReq.onload = unauthInfoReceived;
    unauthReq.send(null);
}

function loadGraphs() {
    var userGraph = getUserQuotaGraphUrl();
    $("#userContent").removeClass("hiddenstuff");
    $("#userInput").removeClass("hiddenstuff");
    if (userGraph == "") {
        $("#userContent").addClass("hiddenstuff");
        document.getElementById("userGraph").innerHTML = "";
    }
    else {
        $("#userInput").addClass("hiddenstuff");
        document.getElementById("userGraph").innerHTML = "<img src=\"" + userGraph + "\" title=\"traffic graph\" alt=\"[[CAN'T SEE THE GRAPH? YOU PROBABLY NEED TO VISIT https://www.ru.ac.za/certs/ AND INSTALL OUR CA CERT.]]\"/>";
    }
    document.getElementById("hostGraph").innerHTML = "<img src=\"" + getHostQuotaGraphUrl() + "\" title=\"traffic graph\" alt=\"[[CAN'T SEE THE GRAPH? YOU PROBABLY NEED TO VISIT https://www.ru.ac.za/certs/ AND INSTALL OUR CA CERT.]]\"/>";
    document.getElementById("unauthGraph").innerHTML = "<img src=\"" + getUnauthQuotaGraphUrl() + "\" title=\"traffic graph\" alt=\"[[CAN'T SEE THE GRAPH? YOU PROBABLY NEED TO VISIT https://www.ru.ac.za/certs/ AND INSTALL OUR CA CERT.]]\"/>";
}

$(function () {
    // Fast and dirty tabs
    $('article.tabs section > h3').click(function () {
        $('article.tabs section').removeClass('current');
        $(this).closest('section').addClass('current');
	});
	
	//Event handlers
	window.addEventListener("load", init, false);
	document.getElementById("popuplogobutton").addEventListener("click", refreshPage);
	$('a[href = "#closewindow"]').click( function() {
		window.close();
	});
});