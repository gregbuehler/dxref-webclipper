var html = 
`<div id="dxrwc-modal-container">
<div id='dxrwc-modal'>								
	<div id='dxrwc-content'>
		<div id="dxrwc-movebar"></div>
		<span class='dxrwc-title-label'> TITLE: </span> <br>
		<span id="dxrwc-title"></span> <br>
		<br>
		<button data-type='dxrwc-page'>Rip Page</button> <br>
		<button data-type='dxrwc-sub-section'>Rip SelectedContent</button> <br>
		<button data-type='dxrwc-selection'>Highlight Text Content</button> <br>
		<button data-type='dxrwc-hide'>DONE</button> <br>
	</div>		
</div>
</div>`;

// DXRWC = Dr XRef Web Clipper

// =================================================================
// Supporting JS
// =================================================================
var responseCount = 0;
var handler = {


	sendMessage : function(msg, type, responseCB) {
		if (!type) {
			type = null;
		}
				
		chrome.runtime.sendMessage({extension: "DXRWC", type: type, msg: msg}, function(response) {
			responseCount++;
	  		if (responseCB) {
	  			responseCB(responseCount,response);
	  		}
		});
	},	
	handleButtonClick: function(e) {
		var value = $(e.target).attr('data-type');
		if (value == 'dxrwc-hide') {			
			$('#dxrwc-modal-container').hide();
			return;
		}		
		handler.sendMessage("pressed "+value,"buttonInfo", printResponse)
	},
	handleMessage: function(request,sender,sendResponse) {
		console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    	console.dir(request);

   		if (request.extension != "DXRWC") {
    		return;
    	}	

    	var title = request.msg.title;
    	$('#dxrwc-title').text(title);
   
    	sendResponse({acknowledged: true, msg: request.msg});
	}
};

var clickEventMap = {
	'#dxrwc-modal-container button': handler.handleButtonClick
};


var printResponse=function(responseNumber,data) {
	console.log("RECEIVED RESPONSE #"+responseNumber);
	console.dir(data);
}

var init = function() {
	var $html = $(html);
	$('body').append($html);	

	for ( selector in clickEventMap) {
		var clickHandler =  clickEventMap[selector];
		$(selector).click(clickHandler);
	};

	chrome.runtime.onMessage.addListener(handler.handleMessage);
}



// =================================================================
// MAIN
// =================================================================
if ($('#dxrwc-modal-container').length == 0) {
	init();
}
else {
	$('#dxrwc-modal-container').show();
}