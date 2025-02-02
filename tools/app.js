import { IO } from './io.js';
import { PaintTool } from './paintTool.js';
import { DebugLogger } from './debugLogger.js';
import { TouchInputManager } from './touchInputManager.js';
import { CanvasManager } from './canvasManager.js';
import { KeyboardShortcuts } from './keyboardShortcuts.js';
import { History } from './history.js';

export class App {
    constructor() {
        const console = new DebugLogger(true, document.getElementById('aboutTitle'));
        this.console = console;

        const keyboardShortcuts = new KeyboardShortcuts(this);
        this.keyboardShortcuts = keyboardShortcuts;

        this.history = new History(this);

        const canvasManager = new CanvasManager(this);
        this.canvasManager = canvasManager;

        const paintTool = new PaintTool(this);
        this.paintTool = paintTool;

        paintTool.init();
        const touchInputManager = new TouchInputManager(this);
        this.touchInputManager = touchInputManager;
        const io = new IO(this);
        this.io = io;
    }
}