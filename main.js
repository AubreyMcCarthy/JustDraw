import { PaintTool } from './tools/paintTool.js';
import { DebugLogger } from './tools/debugLogger.js';
import { TouchInputManager } from './tools/touchInputManager.js';

function log(text) {
    console.log(`Error: ${text}`);
    alert(`Error: ${text}`);
}


const debugLogger = new DebugLogger(true, document.getElementById('aboutTitle'));
const paintTool = new PaintTool(debugLogger);

paintTool.init();
const touchInputManager = new TouchInputManager(paintTool, debugLogger);

const aboutBtn = document.getElementById('aboutBtn');
const about = document.getElementById('about');
const aboutContainer = document.getElementById('aboutContainer');
aboutBtn.addEventListener('click', () => aboutContainer.classList.toggle('hide'));
aboutContainer.addEventListener('click', (e) => {
    if(e.target == aboutContainer)
        aboutContainer.classList.toggle('hide')
});