import { IO } from './tools/io.js';
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
const io = new IO(paintTool);

const aboutBtn = document.getElementById('aboutBtn');
const about = document.getElementById('about');
const aboutContainer = document.getElementById('aboutContainer');
aboutBtn.addEventListener('click', () => aboutContainer.classList.toggle('hide'));
aboutContainer.addEventListener('click', (e) => {
    if(e.target == aboutContainer)
        aboutContainer.classList.toggle('hide')
});


// disable hover effects when touch input happens
function watchForHover() {
    // lastTouchTime is used for ignoring emulated mousemove events
    let lastTouchTime = 0;
  
    function enableHover() {
      if (new Date() - lastTouchTime < 500) return;
      document.body.classList.add('hasHover')
    }
  
    function disableHover() {
      document.body.classList.remove('hasHover');
    }
  
    function updateLastTouchTime() {
      lastTouchTime = new Date();
    }
  
    document.addEventListener('touchstart', updateLastTouchTime, true);
    document.addEventListener('touchstart', disableHover, true);
    document.addEventListener('mousemove', enableHover, true);
  
    enableHover()
  }
  
  watchForHover()