import { PaintTool } from './tools/paintTool.js';

function log(text) {
    console.log(`Error: ${text}`);
    alert(`Error: ${text}`);
}


const paintTool = new PaintTool();

paintTool.init()

const aboutBtn = document.getElementById('aboutBtn');
const about = document.getElementById('about');
aboutBtn.addEventListener('click', () => about.classList.toggle('hide'));