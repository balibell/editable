// code running on the back in background.html


function getStringNeeded(message, callback){
	// save current card name
	localStorage.setItem("aliway_now_card_name",name || '')

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {"name":"getneeded","howm":message.howm}, callback);
	});
	chrome.extension.getViews({type: 'popup'})[0].close();
}


