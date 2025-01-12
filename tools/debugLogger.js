export class DebugLogger {
    constructor(startHidden, hideElement) {
        // create logging element
        const box = document.createElement('div');
        box.classList.add('rectangle');
        box.id = 'debugBox';
        document.body.appendChild(box);
        this.box = box;
        
        this.messages = ["Debug logger started!"];
        this.hidden = false;

        if(startHidden)
            this.toggle();

        hideElement.addEventListener("dblclick", (event) => this.toggle());

        var latesttap;
        hideElement.addEventListener("touchstart", (event) => {
            var now = new Date().getTime();
            var timesince = now - latesttap;
            if((timesince < 600) && (timesince > 0)){
                this.toggle()
            }

            latesttap = new Date().getTime();
        });
    }

    log(value) {
        console.log(value);
        this.messages.push(value);
        if(this.messages.length >= 30) {
            this.messages.shift();
        }
        this.setMessage();

    }
    setMessage() {
        if(this.hidden) return;

        let m = "";
        for(const message in this.messages) {
            m += `\n<p>${this.messages[message]}</p>`;
        }
        this.box.innerHTML = m;
        this.box.scrollTop = this.box.scrollHeight;
    }

    toggle() {
        this.hidden = !this.hidden;
        if(this.hidden) {
            if(!this.box.classList.contains('hide')) {
                this.box.classList.add('hide');
            }
        }
        else {
            this.box.classList.remove('hide');
            this.setMessage();
        }
        
    }
}