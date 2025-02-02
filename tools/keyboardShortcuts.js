export class KeyboardShortcuts {
    constructor(app) {
        this.app = app;
        this.shortcuts = {};
        
        const handleShortcut = (e) => {
            const callback = this.shortcuts[e.key]
            callback?.(e)
        }
        document.addEventListener("keydown", handleShortcut);

        this.shortcutsKeyUp = {};
        
        document.addEventListener("keyup", (e) => {
            const callback = this.shortcutsKeyUp[e.key]
            callback?.(e)
        });

        // this.register ("t", (e) => { this.app.console.log("test"); });
    }

    register(key, callback) {
        this.shortcuts[key] = callback;
    }
    registerKeyUp(key, callback) {
        this.shortcutsKeyUp[key] = callback;
    }
}