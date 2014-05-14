function init() {

            		console.log("Initialising background page...");
            		
                //Extension version
                var currVersion = getVersion();
                var prevVersion = localStorage["ExtVersion"]
                if (currVersion != prevVersion) {
                    // Check if we just installed this extension.
                    if (typeof prevVersion == "undefined") {
                        onInstall();
                    } else {
                        onUpdate();
                    }
                    localStorage["ExtVersion"] = currVersion;
                }
                localStorage["ChromeVersion"] = getChromeVersion();

                initQuota();
                setInterval(function () { loadQuota(); }, 60 * 60 * 1000);  //every hour
                updateBrowserAction();
                setInterval(function () { updateBrowserAction(); }, 1000); //every minute
                
                console.log("Background page initialised");
            }

            function onInstall() {
            		console.log("Installing extension...");
            		
                //Default local storage values
                localStorage["Changed"] = true;
                localStorage["ChromeVersion"] = "NaN";
                localStorage["DrawIconBars"] = true;
                localStorage["DrawIconCrest"] = true;
                localStorage["DrawIconWarning"] = true;
                localStorage["Password"] = "password";
                localStorage["Username"] = "nobody";
                localStorage["UserOrHost"] = "PerUser";
                localStorage["ExtVersion"] = "NaN";

                localStorage["UserQuotaWarning"] = 75;
                localStorage["HostQuotaWarning"] = 75;
                localStorage["UnauthQuotaWarning"] = 75;

                localStorage["UsernameFE"] = "nobody";
                localStorage["UserBytesFE"] = 0;
                localStorage["UserNumDaysFE"] = 14;
                localStorage["UserCategoryFE"] = "loading";
                localStorage["UserPercentageFE"] = 0.0;
                localStorage["HasUserQuotaFromFrontEnd"] = false;
                localStorage["HostnameFE"] = "computer";
                localStorage["HostBytesFE"] = 0;
                localStorage["HostNumDaysFE"] = 14;
                localStorage["HostCategoryFE"] = "loading";
                localStorage["HostPercentageFE"] = 0.0;
                localStorage["HasHostQuotaFromFrontEnd"] = false;
                localStorage["UnauthnameFE"] = "computer";
                localStorage["UnauthRequestsFE"] = 0;
                localStorage["UnauthNumDaysFE"] = 1;
                localStorage["UnauthCategoryFE"] = "loading";
                localStorage["UnauthPercentageFE"] = 0.0;
                localStorage["HasUnauthQuotaFromFrontEnd"] = false;

                chrome.tabs.create({ url: "options.html" });
                console.log("Extension installed");
            }

            function onUpdate() {
                console.log("Extension updated");
            }

            function getVersion() {
                var version = "NaN";
                var xhr = new XMLHttpRequest();
                xhr.open("GET", chrome.extension.getURL("manifest.json"), false);
                xhr.send(null);
                var manifest = JSON.parse(xhr.responseText);
                return manifest.version;
            }

            function getChromeVersion() {
                //Chrome version
                var chromeVersionStart = navigator.userAgent.indexOf("Chrome/") + 7;
                var chromeVersionEnd = navigator.userAgent.indexOf(" ", chromeVersionStart);
                var chromeVersion = navigator.userAgent.substring(chromeVersionStart, chromeVersionEnd);
                localStorage["ChromeVersion"] = chromeVersion;
                
            }

            function updateBrowserAction() {
            		var percU = parseFloat(localStorage["UserPercentageFE"]);
                var percH = parseFloat(localStorage["HostPercentageFE"]);
                var percR = parseFloat(localStorage["UnauthPercentageFE"]);
                var warnU = percU > parseInt(localStorage["UserQuotaWarning"]);
                var warnH = percH > parseInt(localStorage["HostQuotaWarning"]);
                var warnR = percR > parseInt(localStorage["UnauthQuotaWarning"]);

                //Change tooltip
                var tooltip =
                    "U" + (warnU ? "*" : "") + ":" + percU.toFixed(1) + "% " +
                    "H" + (warnH ? "*" : "") + ":" + percH.toFixed(1) + "% " +
                    "R" + (warnR ? "*" : "") + ":" + percR.toFixed(1) + "% "
                    ;
                chrome.browserAction.setTitle({ title: tooltip });

                //Change icon
                var canvas = document.getElementById("iconCanvas");
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (localStorage["DrawIconCrest"] == "true") {
                    var image = document.getElementById("iconImage");
                    context.drawImage(image, 0, 0, image.width, image.height);
                }
                if (localStorage["DrawIconBars"] == "true") {
                    var gradient = context.createLinearGradient(0, 15, 0, 0);
                    gradient.addColorStop(0, "green");
                    gradient.addColorStop(0.5, "yellow");
                    gradient.addColorStop(1, "red");
                    context.fillStyle = gradient;
                    if (localStorage["HasUserQuotaFromFrontEnd"]) {
                        var userPerc = Math.min(localStorage["UserPercentageFE"] / 100.0, 1.0);
                        context.fillRect(3, 17, 3, -(userPerc * 15));
                    }
                    if (localStorage["HasHostQuotaFromFrontEnd"]) {
                        var hostPerc = Math.min(localStorage["HostPercentageFE"] / 100.0, 1.0);
                        context.fillRect(8, 17, 3, -(hostPerc * 15));
                    }
                    if (localStorage["HasUnauthQuotaFromFrontEnd"]) {
                        var unauthPerc = Math.min(localStorage["UnauthPercentageFE"] / 100.0, 1.0);
                        context.fillRect(13, 17, 3, -(unauthPerc * 15));
                    }
                }
                if (localStorage["DrawIconWarning"] == "true") {
                    var warning = new String();
                    warning += warnU ? "U" : "";
                    warning += warnH ? "H" : "";
                    warning += warnR ? "R" : "";
                    chrome.browserAction.setBadgeText({ text: warning});
                }
                else {
                    chrome.browserAction.setBadgeText({ text: "" });
                }
                var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
                chrome.browserAction.setIcon({ imageData: imgData });
            }
$(function() {
	window.addEventListener("load", init, false); //event handler
});