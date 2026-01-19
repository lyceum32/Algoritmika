chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        settings: {
            delay: 50,
            autoStart: true
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url.includes('learn.algoritmika.su/lesson')) {
        chrome.storage.local.get(['settings'], function(result) {
            if (result.settings && result.settings.autoStart) {
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: {tabId: tabId},
                        function: () => {
                            if (window.AlgoritmikaTyper) {
                                const text = window.AlgoritmikaTyper.extractTextFromEditor();
                                if (text && text.length > 0) {
                                    window.AlgoritmikaTyper.startTyping('direct');
                                }
                            }
                        }
                    });
                }, 3000);
            }
        });
    }
});