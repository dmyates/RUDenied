//Initialization

  function init() {
    console.log("Initialising options page...");
    
    $("#status").fadeOut(0);
    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.message == "updateHostname") {
        var hostname = document.getElementById("hostname");
        hostname.value = localStorage["Hostname"];
        sendResponse({ message: "done" });
      }
      else
        sendResponse({}); // snub them.
    });
    loadOptions();
    
    console.log("Options page initialised");
  }
  
  //Saves settings to localStorage
  function saveOptions() {
    console.log("Saving options...");
    
    var errors = false;
    var errorMessage = "Some settings could not be saved:<ul>";
    
    //Username and password
    var username = document.getElementById("username").value;
    var usernameRegExp = new RegExp("g\\d{2}\\w\\d{4}");
    var match = usernameRegExp.exec(username);
    if (match != null) {
      localStorage["Username"] = username;
    }
    else {
      errors = true;
      errorMessage += "<li>Your username must follow the pattern g00x0000</li>";
    }
    var password = document.getElementById("password").value;
    if (password.toString().length > 0) {
      localStorage["Password"] = password;
    }
    else {
      errors = true;
      errorMessage += "<li>You must supply a password</li>";
    }
    
    //Save UserOrHost
    var userOrHostElement = document.getElementById("userOrHost");
    var userOrHost = userOrHostElement.children[userOrHostElement.selectedIndex].value;
    localStorage["UserOrHost"] = userOrHost;
    
    //Toolbar icon
    localStorage["DrawIconCrest"] = chkDrawCrest.checked;
    localStorage["DrawIconBars"] = chkDrawBars.checked;
    localStorage["DrawIconWarning"] = chkDrawWarn.checked;
    localStorage["UserQuotaWarning"] = parseInt(txtWarnUser.value);
    localStorage["HostQuotaWarning"] = parseInt(txtWarnHost.value);
    localStorage["UnauthQuotaWarning"] = parseInt(txtWarnUnauth.value);
      
    //Update status to let user know options were saved
    var status = document.getElementById("status");
    if (errors) {
      errorMessage += "</ul>";
      status.style.color = "red";
      status.innerHTML = errorMessage;
      $("#status").stop().fadeTo(1000, "1.0");
    
      console.log("Failed to save options (errors)");
    }
    else {
      loadQuotaFromBackend();
      status.style.color = "inherit";
      status.innerHTML = "Options saved";
      $("#status").stop().fadeTo(1000, "1.0", function () {
        $("#status").fadeOut(3000);
      });
      
      localStorage["FirstRun"] = false;
      initQuota();
      console.log("Options saved. You're good to go!");
    }
  }
    
  //Loads settings from localStorage
  function loadOptions() {
    console.log("Loading options...");
    
    var errors = false;
    var errorMessage = "Some settings could not be loaded:<ul>";
    
    //Username and password
    var username = document.getElementById("username");
    username.value = localStorage["Username"];
    var password = document.getElementById("password");
    password.value = localStorage["Password"];
    
    //UserOrHost
    var userOrHost = localStorage["UserOrHost"];
    if (userOrHost) {
      var select = document.getElementById("userOrHost");
      var found = false;
      for (var i = 0; i < select.children.length; i++) {
        var child = select.children[i];
        if (child.value == userOrHost) {
          child.selected = "true";
          found = true;
          break;
        }
      }
      if (!found) {
        errors = true;
        errorMessage += "<li>Could not load setting 'UserOrHost', reverting to default</li>";
      }
    }
    
    //Hostname
    var hostname = document.getElementById("hostname");
    hostname.value = localStorage["Hostname"];
    
    //Toolbar icon
    chkDrawCrest.checked = localStorage["DrawIconCrest"] == "true";
    chkDrawBars.checked = localStorage["DrawIconBars"] == "true";
    chkDrawWarn.checked = localStorage["DrawIconWarning"] == "true";
    iconChanged();
    txtWarnUser.value = localStorage["UserQuotaWarning"];
    txtWarnHost.value = localStorage["HostQuotaWarning"];
    txtWarnUnauth.value = localStorage["UnauthQuotaWarning"];
    
    //Toolbar icon tooltip
    var status = document.getElementById("status");
    if (errors) {
      errorMessage += "</ul>";
      status.style.color = "red";
      status.innerHTML = errorMessage;
      $("#status").stop();
      $("#status").stop().fadeTo(1000, "1.0");
    }
    else {
      status.style.color = "inherit";
      status.innerHTML = "Options loaded";
      $("#status").stop().fadeTo(1000, "1.0", function () {
        $("#status").fadeOut(3000);
      });
    }
    
    console.log("Options loaded");
  }
  
  function iconChanged() {
    console.log("Redrawing icon...");
    
    txtWarnUser.disabled = !chkDrawWarn.checked;
    txtWarnHost.disabled = !chkDrawWarn.checked;
    txtWarnUnauth.disabled = !chkDrawWarn.checked;
    var canvas = document.getElementById("iconCanvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (chkDrawCrest.checked) {
      var image = document.getElementById("iconImage");
      context.drawImage(image, 1, 0, image.width, image.height);
    }
    if (chkDrawBars.checked) {
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
      warning += parseFloat(localStorage["UserPercentageFE"]) > parseInt(localStorage["UserQuotaWarning"]) ? "U" : "";
      warning += parseFloat(localStorage["HostPercentageFE"]) > parseInt(localStorage["HostQuotaWarning"]) ? "H" : "";
      warning += parseFloat(localStorage["UnauthPercentageFE"]) > parseInt(localStorage["UnauthQuotaWarning"]) ? "R" : "";
    }
    
    console.log("Icon redrawn");
  }
  
  function onlyNumbers(e) {
    var charCode = e.which || e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  
  function closeWindow() {
    window.close();
  }
  
  function onlyNumbersPresser(event)
  {
	if (!onlyNumbers(event))
	{
		this.preventDefault();
	}
  }
  
$(function() {
	//Event handlers
	window.addEventListener("load", init);
	
	document.getElementById("chkDrawCrest").addEventListener("change",iconChanged, false);
	document.getElementById("chkDrawBars").addEventListener("change",iconChanged, false);
	document.getElementById("chkDrawWarn").addEventListener("change",iconChanged, false);
	
	document.getElementById("txtWarnUser").addEventListener("keypress",onlyNumbersPresser, false);
	document.getElementById("txtWarnHost").addEventListener("keypress",onlyNumbersPresser, false);
	document.getElementById("txtWarnUnauth").addEventListener("keypress",onlyNumbersPresser, false);
	
	document.getElementById("saveOptionsButton").addEventListener("click", saveOptions, false);
	document.getElementById("revertOptionsButton").addEventListener("click", loadOptions, false);
	document.getElementById("closeWindowButton").addEventListener("click", closeWindow, false);
});