/*
RUDenied for Google Chrome (Copyright (c) 2010, Joao Lourenco, All rights reserved.)
This is provided as is and no responsibility is taken for any effects on a user's system.

Some source was derived from the Firefox plugin RUDenied, carrying the following declaration,
and is therefore applicable to this source as well:

 Copyright (c) 2007-2010, Rhodes University, All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  * Neither the name of Rhodes University nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

History:

Version 2.3:
12/11/2013
- Properly incorporated icons

Version 2.2:
12/11/2013
- Fixed Thruk link

Version 2.1:
23/10/2013
- Made compliant with Manifest 2.0 standards
- Added link to new Thruk monitoring system
- Fixed spelling mistakes
Version 1.7:
15/08/2010
- Added noticeboard
- Added icons
- Background page updates browser action icon and icon tooltip
- Changed website and extension location

Version 1.6:
18/05/2010
- Major overhaul - using a browser action now
- Graphs for the quotas
- Options page
- Background page
To do:
- Background page will update browser action icon (canvas)
- Background page will update icon tooltip
- Unauthenticated requests page will reflect the text on the quota site

Version 1.5:
13/10/2009
- Removed some debugging stuff

Version 1.4:
13/10/2009
- Added get version number from chrome for statistics gathering

Version 1.3:
09/10/2009
- Added statistics gathering

Version 1.2:
15/09/2009
- Changed refresh interval from 1 minute to 1 hour

Version 1.1:
14/09/2009
- Expands and collapes to show more information

Version 1.0:
14/09/2009
- Gets per user and per host quota
- Student number is stored in extension cookie
*/
/*function initQuota() {
		console.log("Initialising backend quota...");
		
    if (localStorage["FirstRun"] == undefined || localStorage["FirstRun"] == "true") {
        chrome.tabs.create({ url: "options.html" });
        //debug
        //localStorage["Username"] = "g07l2273";
        //localStorage["FirstRun"] = false;
        localStorage["Username"] = "nobody";
        localStorage["Password"] = "undefined";
        localStorage["UserOrHost"] = "PerUser";
    }

    //Reset local variables
    localStorage["HasUserQuotaFromBackend"] = false;
    localStorage["UserBytes"] = "0.0";
    localStorage["UserBytesScaled"] = "0.0";
    localStorage["UserPercentage"] = "0.0%";
    localStorage["UserDescription"] = "no delay";

    localStorage["HasHostQuotaFromBackend"] = false;
    localStorage["Hostname"] = "Detecting...";
    localStorage["HostBytes"] = "0.0";
    localStorage["HostBytesScaled"] = "0.0";
    localStorage["HostPercentage"] = "0.0%";
    localStorage["HostDescription"] = "no delay";

    //Chrome version
    var chromeVersionStart = navigator.userAgent.indexOf("Chrome/") + 7;
    var chromeVersionEnd = navigator.userAgent.indexOf(" ", chromeVersionStart);
    var chromeVersion = navigator.userAgent.substring(chromeVersionStart, chromeVersionEnd);
    localStorage["ChromeVersion"] = chromeVersion;

    loadQuotaFromBackend();
    setInterval(loadQuotaFromBackend, 60 * 60 * 1000); //every hour
    
    console.log("Backend quota initialised");
}

function loadQuotaFromBackend() {
		console.log("Loading quota from backend...");
		
    //Get the PerUser quota information
        var userUrl = getUserQuotaUrlBackend();
        var userReq = new XMLHttpRequest();

        //Async PerUser processing
        function userInfoReceived() {
        		console.log("Processing per-user info from backend...");
            var userResponse = this.responseText;
            if (userResponse.length) {
                // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
                userResponse = userResponse.replace(/\W*$/, "");

                // Get the fields: 0 = id, 1 = bytes, 2 = scaled bytes, 3 = percent, 4 = description
                var fieldArray = userResponse.split("\t");
                if (fieldArray.length == 5) {
                    localStorage["HasUserQuotaFromBackend"] = true;
                    localStorage["UserBytes"] = fieldArray[1];
                    localStorage["UserBytesScaled"] = fieldArray[2];
                    localStorage["UserPercentage"] = fieldArray[3];
                    localStorage["UserDescription"] = fieldArray[4];
                    localStorage["Changed"] = true;
                    
                    console.log("Per-user info from backend processed");
                }
                else {
                		console.log("Failed to process per-user info from backend (invalid response format)");
               	}
            }
	          else {
	           		console.log("Failed to process per-user info from backend (no response)");
	          }
        }

        userReq.open("GET", userUrl, true);
        userReq.onload = userInfoReceived;
        userReq.send(null);

    //Get the PerHost quota information
    var hostUrl = getHostQuotaUrlBackend();
    var hostReq = new XMLHttpRequest();

    //Async PerHost processing
    function hostInfoReceived() {
        console.log("Processing per-host info from backend...");
        var hostResponse = this.responseText;
        if (hostResponse.length) {
            // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
            hostResponse = hostResponse.replace(/\W*$/, "");

            // Get the fields: 0 = id, 1 = bytes, 2 = scaled bytes, 3 = percent, 4 = description
            var fieldArray = hostResponse.split("\t");
            if (fieldArray.length == 5) {
                localStorage["HasHostQuotaFromBackend"] = true;
                localStorage["Hostname"] = fieldArray[0].substring(1);
                chrome.extension.sendRequest({ message: "updateHostname" }, function (response) {});
                localStorage["HostBytes"] = fieldArray[1];
                localStorage["HostBytesScaled"] = fieldArray[2];
                localStorage["HostPercentage"] = fieldArray[3];
                localStorage["HostDescription"] = fieldArray[4];
                localStorage["Changed"] = true;
                    
                console.log("Per-host info from backend processed");
            }
            else {
             		console.log("Failed to process per-host info from backend (invalid response format)");
            }
        }
	      else {
	      		console.log("Failed to process per-host info from backend (no response)");
	      }
    }

    hostReq.open("GET", hostUrl, true);
    hostReq.onload = hostInfoReceived;
    hostReq.send(null);
}*/

function initQuota() {
		console.log("Initialising backend quota...");

    //Reset local variables
    localStorage["HasUserQuotaFromBackend"] = false;
    localStorage["UserBytes"] = "0.0";
    localStorage["UserBytesScaled"] = "0.0";
    localStorage["UserPercentage"] = "0.0";
    localStorage["UserDescription"] = "no delay";

    localStorage["HasHostQuotaFromBackend"] = false;
    localStorage["Hostname"] = "Detecting...";
    localStorage["HostBytes"] = "0.0";
    localStorage["HostBytesScaled"] = "0.0";
    localStorage["HostPercentage"] = "0.0";
    localStorage["HostDescription"] = "no delay";

    loadQuota();
    
    console.log("Backend quota initialised");
}

function loadQuota() {
    loadQuotaFromBackend();
}

function loadQuotaFromBackend() {
		console.log("Loading quota from backend...");
		
    if (localStorage["Username"] != "nobody") {
        //Get the PerUser quota information
        var userUrl = getUserQuotaUrlBackend();
        var userReq = new XMLHttpRequest();

        //Async PerUser processing
        function userInfoReceived() {
            var userResponse = this.responseText;
            if (userResponse.length) {
                // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
                userResponse = userResponse.replace(/\W*$/, "");

                // Get the fields: 0 = id, 1 = bytes, 2 = scaled bytes, 3 = percent, 4 = description
                var fieldArray = userResponse.split("\t");
                if (fieldArray.length == 5) {
                    localStorage["UserBytes"] = fieldArray[1];
                    localStorage["UserBytesScaled"] = fieldArray[2];
                    localStorage["UserPercentage"] = fieldArray[3];
                    localStorage["UserDescription"] = fieldArray[4];
                    localStorage["Changed"] = true;
                    localStorage["HasUserQuotaFromBackend"] = true;
                    
                    console.log("Per-user info from backend processed");
                }
                else {
                		console.log("Failed to process per-user info from backend (invalid response format)");
               	}
            }
	          else {
	           		console.log("Failed to process per-user info from backend (no response)");
	          }
        }

        userReq.open("GET", userUrl, true);
        userReq.onload = userInfoReceived;
        userReq.send(null);
    }

    //Get the PerHost quota information
    var hostUrl = getHostQuotaUrlBackend();
    var hostReq = new XMLHttpRequest();

    //Async PerHost processing
    function hostInfoReceived() {
        console.log("Processing per-host info from backend...");
        
        var hostResponse = this.responseText;
        if (hostResponse.length) {
            // Remove whitespace from the end of the string (this gets rid of the end-of-line characters)
            hostResponse = hostResponse.replace(/\W*$/, "");

            // Get the fields: 0 = id, 1 = bytes, 2 = scaled bytes, 3 = percent, 4 = description
            var fieldArray = hostResponse.split("\t");
            if (fieldArray.length == 5) {
                localStorage["Hostname"] = fieldArray[0].substring(1);
                chrome.extension.sendRequest({ message: "updateHostname" }, function (response) {});
                localStorage["HostBytes"] = fieldArray[1];
                localStorage["HostBytesScaled"] = fieldArray[2];
                localStorage["HostPercentage"] = fieldArray[3];
                localStorage["HostDescription"] = fieldArray[4];
                localStorage["Changed"] = true;
                localStorage["HasHostQuotaFromBackend"] = true;
                loadQuotaFromFrontEnd();
                    
                console.log("Per-host info from backend processed");
            }
            else {
             		console.log("Failed to process per-host info from backend (invalid response format)");
            }
        }
	      else {
	      		console.log("Failed to process per-host info from backend (no response)");
	      }
    }

    hostReq.open("GET", hostUrl, true);
    hostReq.onload = hostInfoReceived;
    hostReq.send(null);
}

function loadQuotaFromFrontEnd() {
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
                localStorage["UsernameFE"] = arr[0].substring(1);
                var b = parseFloat(arr[1]);
                localStorage["UserBytesFE"] = b;
                var days = parseInt(arr[2]);
                localStorage["UserNumDaysFE"] = days;
                localStorage["UserCategoryFE"] = arr[4];
                localStorage["UserPercentageFE"] = arr[5];
                localStorage["HasUserQuotaFromFrontEnd"] = true;
                            
                console.log("Per-user info processed");
            }
            else {
                console.log("Failed to process per-user info (invalid response format)");
            }
        }
        else {
            console.log("Failed to process per-user info (no response)");
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
                localStorage["HostnameFE"] = arr[0].substring(1);
                var b = parseFloat(arr[1]);
                localStorage["HostBytesFE"] = b;
                var days = parseInt(arr[2]);
                localStorage["HostNumDaysFE"] = days;
                localStorage["HostCategoryFE"] = arr[4];
                localStorage["HostPercentageFE"] = arr[5];
                localStorage["HasHostQuotaFromFrontEnd"] = true;
                            
                console.log("Per-host info processed");
            }
            else {
                console.log("Failed to process per-host info (invalid response format)");
            }
        }
        else {
            console.log("Failed to process per-host info (no response)");
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
                localStorage["UnauthnameFE"] = arr[0].substring(1);
                var requests = parseFloat(arr[1]);
                localStorage["UnauthRequestsFE"] = requests;
                var days = parseInt(arr[2]);
                localStorage["UnauthNumDaysFE"] = days;
                localStorage["UnauthCategoryFE"] = arr[4];
                var percentage = parseFloat(arr[5]);
                localStorage["UnauthPercentageFE"] = percentage;
                localStorage["HasUnauthQuotaFromFrontEnd"] = true;
                            
                console.log("Unauthenticated requests info processed");
            }
            else {
                console.log("Failed to process unauthenticated requests info (invalid response format)");
            }
        }
        else {
            console.log("Failed to process unauthenticated requests info (no response)");
        }
    }

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

function getUserQuotaTextUrl() {
    if (localStorage["Username"] == "nobody") {
        return "";
    }
    var url = "http://systems.ru.ac.za/quota/myquota.fcgi?Hid=&Aid=&quota=U&Uid=" + localStorage["Username"] + "&submit=Submit+Query&.cgifields=quota&.cgifields=graph";
    return url;
}

function getUserQuotaGraphUrl() {
    if (localStorage["Username"] == "nobody") {
        return "";
    }
    var url = "https://systems.ru.ac.za/quota/myquota.fcgi?q=U" + localStorage["Username"] + "&graph=1";
    return url;
}

function getHostQuotaTextUrl() {
    if (!localStorage["HasHostQuotaFromBackend"]) {
        return "";
    }
    var url = "http://systems.ru.ac.za/quota/myquota.fcgi?quota=H&Hid=" + localStorage["Hostname"] + "&Aid=&Uid=&submit=Submit+Query&.cgifields=quota&.cgifields=graph";
    return url;
}

function getHostQuotaGraphUrl() {
    if (!localStorage["HasHostQuotaFromBackend"]) {
        return "";
    }
    var url = "https://systems.ru.ac.za/quota/myquota.fcgi?q=H" + localStorage["Hostname"] + "&graph=1";
    return url;
}

function getUnauthQuotaTextUrl() {
    if (!localStorage["HasHostQuotaFromBackend"]) {
        return "";
    }
    var url = "http://systems.ru.ac.za/quota/myquota.fcgi?Hid=&quota=A&Aid=" + localStorage["Hostname"] + "&Uid=&submit=Submit+Query&.cgifields=quota&.cgifields=graph";
    return url;
}

function getUnauthQuotaGraphUrl() {
    if (!localStorage["HasHostQuotaFromBackend"]) {
        return "";
    }
    var url = "https://systems.ru.ac.za/quota/myquota.fcgi?q=A" + localStorage["Hostname"] + "&graph=1";
    return url;
}

function getUserQuotaUrlBackend() {
    var url = "http://systems.ru.ac.za/quota/firefox/rudenied-backend.cgi?q=" + "U" + localStorage["Username"] + "&version=" + "1.0" + "&mozilla=" + "Chrome" + "-" + localStorage["ChromeVersion"] + "&rand=" + Math.random();
    return url;
}

function getHostQuotaUrlBackend() {
    var url = "http://systems.ru.ac.za/quota/firefox/rudenied-backend.cgi?q=" + "Hme" + "&version=" + "1.0" + "&mozilla=" + "Chrome" + "-" + localStorage["ChromeVersion"] + "&rand=" + Math.random();
    return url;
}