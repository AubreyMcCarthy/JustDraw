export class History {
    constructor(app) {
        this.app = app;

        this.actions = [];
        this.redoActions = [];
        this.maxUndoSteps = 5;


        const shortcuts = this.app.keyboardShortcuts;
        shortcuts.register("z", (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if(e.shiftKey) {
                    this.redo();
                }
                else {
                    this.undo();
            }
            }   
        });
    }

    getPreviousAction() { return this.actions.at(-1); }

    addAction(action, undoAction, bake) {
        this.actions.push({action, undoAction, bake});
        this.redoActions = [];
        
    
        // If we exceed maxUndoSteps, bake the oldest path into history
        if (this.actions.length > this.maxUndoSteps) {
            this.bakeOldestAction();
        }
    }

    bakeOldestAction() {
        const path = this.actions.shift();
        if(path.bake)
            path.bake();
    }

    bakeAll() {
        // while(this.actions.length > 0){
        //     const path = this.actions.shift();
        //     // this.app.console.log(`baking oldest action, action: ${path.bake}`);
        //     if(path.bake)
        //         path.bake();
        // }
        this.app.paintTool.bakeAllPaths();
        this.actions = [];
        this.redoActions = [];
    }
    
   undo() {
        if (this.actions.length === 0) return;
        this.app.console.log("undo!");
        const pathToUndo = this.actions.pop();
        this.redoActions.push(pathToUndo);
        if(pathToUndo.undoAction)
            pathToUndo.undoAction();
    }

    redo() {
        if (this.redoActions.length === 0) return;
        this.app.console.log("redo!");
        const pathToRedo = this.redoActions.pop();
        this.actions.push(pathToRedo);
        if(pathToRedo.action)
            pathToRedo.action();
    }
}