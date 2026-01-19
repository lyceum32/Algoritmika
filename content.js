let checkInterval = null;
let currentPageIsTyping = false;
let isTypingInProgress = false;

function checkPageType() {
    const hasTypingEditor = document.querySelector('.typing-editor') !== null;
    const hasViewLines = document.querySelector('.view-lines') !== null;
    const hasVirtualKeyboard = document.querySelector('.react-simple-keyboard') !== null;
    return hasTypingEditor && hasViewLines && hasVirtualKeyboard;
}

function extractTextFromEditor() {
    const lines = document.querySelectorAll('.view-lines .view-line');
    let text = '';
    lines.forEach(line => {
        text += (line.textContent || line.innerText) + '\n';
    });
    text = text.replace(/\u00A0/g, ' ').trim();
    return text;
}

function resetButtonState() {
    const btn = document.getElementById('algoritmika-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🚀<span>Автопечать</span>';
    }
    isTypingInProgress = false;
}

function startTyping(mode = 'direct') {
    if (isTypingInProgress) return false;
    
    isTypingInProgress = true;
    
    const btn = document.getElementById('algoritmika-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳<span>ПЕЧАТАЕМ...</span>';
    }
    
    setTimeout(() => {
        const text = extractTextFromEditor();
        if (!text) {
            resetButtonState();
            return false;
        }
        
        const textarea = document.querySelector('.typing-editor textarea.inputarea');
        if (!textarea) {
            resetButtonState();
            return false;
        }
        
        if (mode === 'virtual') {
            typeWithVirtualKeyboard(text);
        } else {
            directTypeText(text);
        }
    }, 100);
    
    return true;
}

function directTypeText(text) {
    const textarea = document.querySelector('.typing-editor textarea.inputarea');
    if (!textarea) {
        resetButtonState();
        return false;
    }
    
    textarea.focus();
    textarea.value = text;
    
    const events = ['input', 'change', 'keydown', 'keyup', 'keypress'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        textarea.dispatchEvent(event);
    });
    
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            if (!textarea) return;
            
            const inputEvent = new InputEvent('input', {
                data: text[i],
                inputType: 'insertText',
                bubbles: true
            });
            textarea.dispatchEvent(inputEvent);
            
            if (i === text.length - 1) {
                setTimeout(() => {
                    resetButtonState();
                }, 500);
            }
        }, i * 10);
    }
    
    return true;
}

async function typeWithVirtualKeyboard(text) {
    const textarea = document.querySelector('.typing-editor textarea.inputarea');
    if (!textarea) {
        resetButtonState();
        return false;
    }
    
    textarea.focus();
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        setTimeout(() => {
            const buttons = document.querySelectorAll('.hg-button');
            let buttonFound = false;
            
            for (let btn of buttons) {
                const btnText = btn.textContent.trim();
                const keyValue = btn.getAttribute('data-skbtn');
                
                if (btnText === char || keyValue === char || 
                    (char === ' ' && keyValue === '{space}') ||
                    (char === '\n' && keyValue === '{enter}')) {
                    
                    btn.style.backgroundColor = '#2db6d6';
                    btn.style.color = 'white';
                    
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    
                    btn.dispatchEvent(clickEvent);
                    
                    setTimeout(() => {
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 100);
                    
                    buttonFound = true;
                    break;
                }
            }
            
            if (textarea) {
                textarea.value = text.substring(0, i + 1);
                const inputEvent = new InputEvent('input', {
                    data: char,
                    bubbles: true
                });
                textarea.dispatchEvent(inputEvent);
            }
            
            if (i === text.length - 1) {
                setTimeout(() => {
                    resetButtonState();
                }, 500);
            }
        }, i * 50);
    }
    
    return true;
}

function addAlgoritmikaButton() {
    if (document.getElementById('algoritmika-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'algoritmika-btn';
    btn.innerHTML = '🚀<span>Автопечать</span>';
    btn.title = 'Автоматическая печать Algoritmika';
    
    btn.addEventListener('click', () => {
        startTyping('direct');
    });
    
    document.body.appendChild(btn);
    
    resetButtonState();
}

function removeAlgoritmikaButton() {
    const btn = document.getElementById('algoritmika-btn');
    if (btn) {
        btn.remove();
    }
    isTypingInProgress = false;
}

function updateButtonVisibility() {
    const isTypingPageNow = checkPageType();
    
    if (isTypingPageNow && !currentPageIsTyping) {
        addAlgoritmikaButton();
        currentPageIsTyping = true;
    } else if (!isTypingPageNow && currentPageIsTyping) {
        removeAlgoritmikaButton();
        currentPageIsTyping = false;
    }
}

if (window.location.href.includes('learn.algoritmika.su')) {
    setTimeout(() => {
        updateButtonVisibility();
        
        checkInterval = setInterval(updateButtonVisibility, 1500);
    }, 1000);
    
    window.addEventListener('beforeunload', () => {
        if (checkInterval) {
            clearInterval(checkInterval);
        }
        isTypingInProgress = false;
    });
}

window.AlgoritmikaTyper = {
    startTyping,
    extractTextFromEditor
};