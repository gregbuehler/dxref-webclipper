var modalContentHTML = 
`<div id="dxrwc-modal-container">
<div id='dxrwc-modal'>								
	<div id='dxrwc-content'>
		<div id="dxrwc-movebar"></div>
		<span class='dxrwc-title-label'> TITLE: </span> <br>
		<span id="dxrwc-title"></span> <br>
		<br>
		<button class='dxrwc-page'>Rip Page</button> <br>
		<button class='dxrwc-block-selected'>Rip SelectedContent</button> <br>
		<button class='dxrwc-highlight'>Highlight Text Content</button> <br>
		<button class='dxrwc-save'>SAVE</button> <br>
		<button class='dxrwc-cancel'>DONE</button> <br>
	</div>		
</div>
</div>`;

// DXRWC = Dr XRef Web Clipper
// =================================================================
// Local Data
// =================================================================
var local = {
	responseCount : 0,	
	highlighter: null,
	mode: null,
	pageInfo: null
};

// =================================================================
// Content Selection JS
// =================================================================
var HIGHLIGHTING_MODE = 'HIGHLIGHTING_MODE';
var BLOCK_SELECTION_MODE = 'BLOCK_SELECTION_MODE';
var PAGE_MODE = 'PAGE_MODE';

var contentSelection ={
	clearModalities: function() {
		local.highlighter.removeHighlights();		
		contentSelection.setMode(null);
	},

	onBeforeHighlight: function(){
		return local.mode == HIGHLIGHTING_MODE;
	},
	onAfterHighlight: function() {
		var highlightArray = local.highlighter.getHighlights();
		var isEnabled= local.mode==HIGHLIGHTING_MODE && highlightArray.length>0;
		handler.enableSave(isEnabled);
	},
	setMode: function(mode) {
		local.mode = mode;
		var isEnabled= local.mode !=null && local.mode!=HIGHLIGHTING_MODE &&
					   local.pageInfo!=null;
		handler.enableSave(isEnabled);
	},
	getHighlightMessage: function() {
		//TODO: This needs to be improved-- this merges things that maybe shouldn't
		// be merged (e.g. non-siblings in the page).
		// Also this ignores the HTML content (e.g. <h1>, <a>, etc.)
		// We need to account for these things.
		// We also have no locator -- meaning the backend will have a hard time
		// figuringout where the slice should go.		
		var highlightArray = local.highlighter.getHighlights();
		highlightArray = local.highlighter.normalizeHighlights(highlightArray);
		var txt = '';
		for (x in highlightArray) {
			var highlight = highlightArray[x];				
				txt = txt + highlight.innerText;
		}
		return txt;
	}, 
	setPageInfo: function(pageInfo) {

    	
    	$('#dxrwc-title').text(pageInfo.title);
	}
};


// =================================================================
// Page Setup & Event Handling
// =================================================================

var $modal = $('#dxrwc-modal-container');
var handler = {

	sendMessage : function(msg, type, responseCB) {
		if (!type) {
			type = null;
		}
				
		chrome.runtime.sendMessage({extension: "DXRWC", type: type, msg: msg}, function(response) {
			local.responseCount++;
	  		if (responseCB) {
	  			responseCB(local.responseCount,response);
	  		}
		});
	},	

	closeDialog: function() {
		contentSelection.clearModalities();
		$('#dxrwc-modal-container').hide();
		//cleanup highlighter
		local.highlighter.destroy();
		//cleanup events...
		for ( selector in clickEventMap) {
			var clickHandler =  clickEventMap[selector];
			$(selector).off('click',clickHandler);
		}	
	},
	handleSave: function() {		
		
		if (local.mode == HIGHLIGHTING_MODE) {

			var highlightMessage = contentSelection.getHighlightMessage();

			handler.sendMessage(highlightMessage,"highlight-selected",handler.printResponse);
		}
		else {
			alert("Save not yet implemented for this modality!");	
		}
		contentSelection.clearModalities();		
	},
	handleCancel: function() {
		handler.closeDialog();
	},
	handleRipPage: function(e) {
		contentSelection.clearModalities();
		contentSelection.setMode(PAGE_MODE);
		handler.sendMessage("pressed RipPage","buttonInfo", handler.printResponse);
	},
	handleBlockSelect: function(e) {
		contentSelection.clearModalities();
		contentSelection.setMode(BLOCK_SELECTION_MODE);
		alert("This mode is still TBD");
	},
	handleHighlight: function(e) {
		contentSelection.clearModalities();
		contentSelection.setMode(HIGHLIGHTING_MODE);	
	},

	printResponse: function(responseNumber,data) {		
		console.log("RECEIVED RESPONSE #"+responseNumber);
		console.dir(data);
	},
	handleMessage: function(request,sender,sendResponse) {
		console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    	console.dir(request);

   		if (request.extension != "DXRWC") {
    		return;
    	}	

    	var pageInfo = {
    		title: request.msg.title,
    		url: request.msg.url
    	};
    	
    	contentSelection.setPageInfo(pageInfo);
   
    	sendResponse({acknowledged: true, msg: request.msg});
	},
	enableSave: function(isEnabled) {
		console.log("ENABLING? "+isEnabled);
		$('#dxrwc-modal-container button.dxrwc-save').prop('disabled',!isEnabled);	
	}

};

var clickEventMap = {
	'#dxrwc-modal-container button.dxrwc-page': handler.handleRipPage,
	'#dxrwc-modal-container button.dxrwc-highlight': handler.handleHighlight,
	'#dxrwc-modal-container button.dxrwc-block-selected': handler.handleBlockSelect,
	'#dxrwc-modal-container button.dxrwc-save': handler.handleSave,
	'#dxrwc-modal-container button.dxrwc-cancel': handler.handleCancel
};



var init = function() {
	
	if ($modal.length != 0) {
		$modal.show();
	}
	else {
		//Doesn't yet exist, add modal to the page.
		var $html = $(modalContentHTML);
		$('body').append($html);		
		$modal = $('#dxrwc-modal-container');
	}
	
	for ( selector in clickEventMap) {
		var clickHandler =  clickEventMap[selector];
		$(selector).click(clickHandler);
	};

	local.highlighter = new TextHighlighter(document.body, {
		onBeforeHighlight: contentSelection.onBeforeHighlight,
		onAfterHighlight: contentSelection.onAfterHighlight
	});
	
	contentSelection.clearModalities();

	chrome.runtime.onMessage.addListener(handler.handleMessage);
}


// =================================================================
// MAIN
// =================================================================
init();