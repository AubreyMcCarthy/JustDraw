import { PaintTool } from './tools/paintTool.js';

function log(text) {
    console.log(`Error: ${text}`);
    alert(`Error: ${text}`);
}


const paintTool = new PaintTool();

paintTool.init()
window.onbeforeunload = function() {
    return true;
};
