var html = 
`<div id="wco-modal-container">
<div id='wco-modal'>								
	<div id='wco-content'>
		<span class='title-label'> TITLE: </span> <br>
		<span id="wco-title"></span> <br>
		<br>
		<button data-type='page'>Rip Page</button> <br>
		<button data-type='sub-section'>Rip SelectedContent</button> <br>
		<button data-type='selection'>Highlight Text Content</button> <br>
		<button data-type='hide'>DONE</button> <br>
	</div>		
</div>
</div>`;

// =================================================================
// Supporting JS
// =================================================================
var responseCount = 0;
var browserWrapper = {


	sendMessage : function(msg, type, responseCB) {
		if (!type) {
			type = null;
		}
		
		//window.postMessage({ type: "WCO-CONTROLLER", msgtype: type, msg: msg }, "*");
		chrome.runtime.sendMessage({extension: "WCO", type: type, msg: msg}, function(response) {
			responseCount++;
	  		if (responseCB) {
	  			responseCB(responseCount,response);
	  		}
		});
	}



};





var printResponse=function(responseNumber,data) {
	console.log("RECEIVED RESPONSE #"+responseNumber);
	console.dir(data);
}

var init = function() {
	var $html = $(html);
	$('body').append($html);	

	


	$('#wco-modal-container button').click(function(e) {
		var value = $(e.target).attr('data-type');
		if (value == 'hide') {
			console.log("DONE>>> HIDING");
			$('#wco-modal-container').hide();
			return;
		}		
		browserWrapper.sendMessage("pressed "+value,"buttonInfo", printResponse)
	});


	chrome.runtime.onMessage.addListener(
  		function(request, sender, sendResponse) {
    	console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    	console.dir(request);

   		if (request.extension != "WCO") {
    		return;
    	}	

    	var title = request.msg.title;
    	console.log("TITLE: "+title);
    	console.log(">>"+$('#wco-modal-container span.title').size())
    	$('#wco-title').text(title);

    
    	sendResponse({acknowledged: true, msg: request.msg});
  });
}



// =================================================================
// MAIN
// =================================================================
if ($('#wco-modal-container').length == 0) {
	init();
}
else {
	$('#wco-modal-container').show();
}




