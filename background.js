chrome.browserAction.onClicked.addListener(function(tab) {
  	// No tabs or host permissions needed!  
  	chrome.tabs.insertCSS(null,{ file: "modal.css"}, function() {
  		chrome.tabs.executeScript(null, {file: "jquery-2.1.4.min.js"}, function() {
  			chrome.tabs.executeScript(null, {file: "content_script.js"});	
  		});
	});
 
});


var receiveMessage = function(event) {
	alert("RECEIVED A MESSGE!");
	console.log("BACKGROUND RECEIVED MESSAGE: ");
	console.dir(event);

  	// We only accept messages from ourselves
  	if (event.source != window)
    	return;

  	if (event.data.type && (event.data.type == "FROM_PAGE")) {
	    console.log("Content script received: " + event.data.msgType);    
	    console.log("Content script received: " + event.data.msg);    
	    alert("here1111!");
  	}
}


window.addEventListener("message", receiveMessage, false);

console.log("BACKGROUND INITIALIZED!");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.dir(request);

    if (request.extension != "WCO") {
    	return;
    }

    
    sendResponse({acknowledged: true, msg: request.msg});
  });



chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("TAB TITLE: "+tab.title);
	console.log("TAB URL: "+tab.url);

	var info = { title: tab.title, url: tab.url};

	var responseCB = function(responseCount,response) {
		console.log("RECEIVED RESPONSE>> "+responseCount);
		console.dir(response);
	}

	var responseCount = 0;
	var responseHandler = function(response) {
		responseCount++;
  		if (responseCB) {
  			responseCB(responseCount,response);
  		}
	}

	setTimeout(function() {
		chrome.tabs.sendMessage(tab.id, {extension: "WCO", type: "titleInfo", msg: info}, null, responseHandler);
	},1000);

});