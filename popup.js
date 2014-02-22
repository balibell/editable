

// BG refer to  background.html
var BG = chrome.extension.getBackgroundPage();


// init all buttons available
function buttonInit(){
	// use querySelectorAll since no jQuery in this page
	var btns = document.querySelectorAll('#mypopup .topcoat-button');

	for( var i=0; i<btns.length; i++ ){
		btns[i].addEventListener('click', function (e){
			// call function changeMyCard in background.html (powerful!)

			var howm = document.getElementById('rowhowmany').value || '';
			BG.getStringNeeded({"howm":howm});
		}, false);
	}
}
buttonInit();