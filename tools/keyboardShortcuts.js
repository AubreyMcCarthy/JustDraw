export class KeyboardShortcuts {
    constructor(app) {
        this.app = app;
        this.shortcuts = {};
        
        const handleShortcut = (e) => {
            const callback = this.shortcuts[e.key]
            callback?.(e)
        }
        document.addEventListener("keydown", handleShortcut);

        // this.register ("t", (e) => { this.app.console.log("test"); });
    }

    register(key, callback, modifiers) {
        this.shortcuts[key] = callback;
    }
}