var html = 
`<div id="wco-modal-container">
<div id='wco-modal'>								
	<div id='wco-content'>
		<span class='title'> TITLE: </span> <br>
		<span id='wco-title'></span> <br>
		<button data-type='page'>Rip Page</button> <br>
		<button data-type='sub-section'>Rip SelectedContent</button> <br>
		<button data-type='selection'>Highlight Text Content</button> <br>
	</div>		
</div>
</div>`;


var $html = $(html);



$('body').append($html);
console.log("SIZE: "+$('#wco-modal-container').length);
console.log("SIZE: "+$('#wco-modal-container button').length);

$('#wco-modal-container button').click(function(e) {
	var value = $(e.target).attr('data-type');
	console.log('PRESSED: '+value);
});


