export class DebugLogger {
    constructor() {
        // create logging element
        const box = document.createElement('div');
        box.classList.add('rectangle');
        box.id = 'debugBox';
        document.body.appendChild(box);
        this.box = box;
        
        this.messages = "Debug logger started!";
    }

    log(value) {
        console.log(value);
        this.messages += '\n' + value;
        this.box.innerText = this.messages;
    }

    toggle() {
        this.box.classList.toggle('hide');
        this.box.innerText = this.messages;
    }
}