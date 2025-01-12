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
        this.setMessage();
    }
    setMessage() {
        this.box.innerText = this.messages;
        this.box.scrollTop = this.box.scrollHeight;
    }

    toggle() {
        this.box.classList.toggle('hide');
        this.setMessage();
    }
}