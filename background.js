chrome.browserAction.onClicked.addListener(function(tab) {
  	// No tabs or host permissions needed!  
  	chrome.tabs.insertCSS(null,{ file: "modal.css"}, function() {
  		chrome.tabs.executeScript(null, {file: "jquery-2.1.4.min.js"}, function() {
  			chrome.tabs.executeScript(null, {file: "content_script.js"});	
  		});
	});
 
});