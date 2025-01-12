export class DebugLogger {
    constructor(startHidden, hideElement) {
        // create logging element
        const box = document.createElement('div');
        box.classList.add('rectangle');
        box.id = 'debugBox';
        document.body.appendChild(box);
        this.box = box;
        
        this.messages = "Debug logger started!";
        if(startHidden && !this.box.classList.contains('hide'))
            this.box.classList.add('hide');

        hideElement.addEventListener("dblclick", (event) => this.toggle());
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