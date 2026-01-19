document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const directBtn = document.getElementById('directBtn');
    const virtualBtn = document.getElementById('virtualBtn');
    const delayInput = document.getElementById('delay');
    const autoStartCheckbox = document.getElementById('autoStart');
    
    chrome.storage.local.get(['settings'], function(result) {
        if (result.settings) {
            delayInput.value = result.settings.delay || 50;
            autoStartCheckbox.checked = result.settings.autoStart !== false;
        }
    });
    
    function saveSettings() {
        const settings = {
            delay: parseInt(delayInput.value) || 50,
            autoStart: autoStartCheckbox.checked
        };
        chrome.storage.local.set({ settings });
    }
    
    delayInput.addEventListener('change', saveSettings);
    autoStartCheckbox.addEventListener('change', saveSettings);
    
    function startAlgoritmikaTyping(mode = 'direct') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0].url.includes('learn.algoritmika.su')) return;
            
            const delay = parseInt(delayInput.value) || 50;
            
            startBtn.disabled = true;
            directBtn.disabled = true;
            virtualBtn.disabled = true;
            startBtn.textContent = 'ПЕЧАТАЕМ...';
            
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: (mode, delay) => {
                    if (window.AlgoritmikaTyper) {
                        return window.AlgoritmikaTyper.startTyping(mode);
                    }
                    return false;
                },
                args: [mode, delay]
            });
            
            setTimeout(() => {
                startBtn.disabled = false;
                directBtn.disabled = false;
                virtualBtn.disabled = false;
                startBtn.textContent = '🚀 Автопечать';
            }, 2000);
        });
    }
    
    startBtn.addEventListener('click', () => startAlgoritmikaTyping('direct'));
    directBtn.addEventListener('click', () => startAlgoritmikaTyping('direct'));
    virtualBtn.addEventListener('click', () => startAlgoritmikaTyping('virtual'));
});