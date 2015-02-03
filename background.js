console.log('inside background.js');
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(changeInfo.status=='complete'){
        if(tab.url.match(/\/pull-requests\/.*\/commits/g)){
            console.log('Pull Request Page Found');
            chrome.pageAction.show(tabId);
        }
        else {
            console.log('Pull Request Not Page Found');
            chrome.pageAction.hide(tabId);
        }
    }
});

chrome.pageAction.onClicked.addListener(function(tab){
    console.log('icon clicked');
	chrome.tabs.executeScript({code: 'addDiffTool()'});
//	chrome.tabs.executeScript({code: 'createLoadingPage()'});
});