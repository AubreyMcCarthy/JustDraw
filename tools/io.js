export class IO {
    constructor(paintTool) {
        this.paintTool = paintTool;

        this.selectArea = {
            label: "Select Area",
            tooltip: "select area",
            icon: "img/icon/select-area.png",
            value: true,
            defaultValue: true,
        }

        this.fillBg = {
            label: "Fill Background",
            tooltip: "fill bg",
            icon: "img/icon/fill.png",
            value: true,
            defaultValue: true,
        }

        this.selection = {
            xMin: {
                value: window.innerWidth * 0.333,
            },
            yMin: {
                value: window.innerHeight * 0.333,
            },
            xMax: {
                value: window.innerWidth - window.innerWidth * 0.333,
            },
            yMax: {
                value: window.innerHeight - window.innerHeight * 0.333,
            },
            width() { return Math.round(this.xMax.value - this.xMin.value) },
            height() { return Math.round(this.yMax.value - this.yMin.value) },
            x() { return Math.round(this.xMin.value) },
            y() { return Math.round(this.yMin.value) },
            // width() { return this.xMax.value },
            // height() { return this.yMax.value },
        }

        this.createUI();
    }

    createUI() {
        const controls = document.getElementById('controls-io');
        this.controls = controls;

        controls.classList.add('minimized');
        // minimize
        const hideBtn = this.addButton({
            icon: "img/icon/save.png", 
            tooltip: "hide",
        }, controls);
        const hideIcon = hideBtn.querySelector('img');
        hideBtn.addEventListener('click', () => {
            controls.classList.toggle('minimized');
            if(controls.classList.contains('minimized')) {
                hideIcon.src = 'img/icon/save.png';
            }
            else {
                hideIcon.src = 'img/icon/arrow-right.png';
            }
        });

        // toogle full screen
        this.selectArea.action = () => this.setSelectionVisability();
        const selectAreaBtn = this.addToggleButton(this.selectArea, controls);
        // toggle background
        const toggleBgBtn = this.addToggleButton(this.fillBg, controls);

        // export buttons
        const download = () => {
            this.drawSelectionCanvas((blob) => {
                    const link = document.createElement('a');
                    link.download = 'drawing.png';
                    link.href = URL.createObjectURL(blob);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
            });
        }
        const downloadBtn = this.addButton({
            icon: "img/icon/save.png", 
            tooltip: "save",
            action: download,            

        }, controls);
        // download
        // save as
        // copy
        // share

        const selectionBG = document.createElement('div');
        this.selectionBG = selectionBG;
        selectionBG.id = "selectionBg";
        
        const selectionBox = document.createElement('div');
        this.selectionBox = selectionBox;
        selectionBox.id = 'selectionBox';
        this.dragAndDropControls(selectionBox, (deltaX, deltaY) => {
            this.selection.xMin.value += deltaX;
            this.selection.xMax.value += deltaX;
            this.selection.yMin.value += deltaY;
            this.selection.yMax.value += deltaY;
        });
        selectionBG.appendChild(selectionBox);
        this.setSelectionVisability();

        // const minMinHandle = document.createElement('div');
        // minMinHandle.id = 'minMinHandle';
        // minMinHandle.classList.add('drag-handle');
        // selectionBox.appendChild(minMinHandle);
        // this.dragAndDropControls(
        //     this.selection.xMin, this.selection.yMin, 
        //     minMinHandle
        // ); 
        const topLeftHandle = this.addHandle(
            this.selection.xMin, this.selection.yMin, 'topLeftHandle', selectionBox
        );
        const bottomLeftHandle = this.addHandle(
            this.selection.xMin, this.selection.yMax, 'bottomLeftHandle', selectionBox
        );
        const topRightHandle = this.addHandle(
            this.selection.xMax, this.selection.yMin, 'topRightHandle', selectionBox
        );
        const bottomRightHandle = this.addHandle(
            this.selection.xMax, this.selection.yMax, 'bottomRightHandle', selectionBox
        );
    }

    loadSVGIcon(path, el, tooltip) {
        const img = document.createElement('img');
        img.src = path;
        img.style.width = '100%';
        img.style.height = '100%';
        el.appendChild(img);
        if(tooltip) {
            el.classList.add('tooltip');
            el.innerHTML += `<span class="tooltiptext">${tooltip}</span>`;
        }
        // fetch(path)
        //     .then(response => response.text())
        //     .then(svg => {
        //         el.innerHTML = svg;
        //         if(tooltip) {
        //             el.classList.add('tooltip');
        //             el.innerHTML += `<span class="tooltiptext">${tooltip}</span>`;
        //         }
        //     })
        //     .catch(error => console.error('Error loading the SVG: ', error));
        return img;
    }

    addButton(o, controls) {
        const btn = document.createElement('button');
        if(o.icon != "") {
            this.loadSVGIcon(o.icon, btn, o.tooltip);
        }
        if(o.action) {
            btn.addEventListener('click', o.action);
        }
        controls.appendChild(btn);
        return btn;
    }
    addToggleButton(o, controls) {
        const btn = this.addButton(o, controls);
        if(o.action){
            btn.removeEventListener('click', o.action);
        }
        if(o.value) {
            btn.classList.add('btn-enabled');
        }
        btn.addEventListener('click', () => {
            o.value = !o.value;
            if(o.value) {
                btn.classList.add('btn-enabled');
            }
            else {
                btn.classList.remove('btn-enabled');
            }
            if(o.action){
                o.action();
            }
            
        });
    }
    setSelectionVisability(){
        // console.log("setting full screen selection box vsiablity: " + this.fullScreen.value);
        if(this.selectArea.value) {
            this.controls.appendChild(this.selectionBG);
            this.setSelection();
        } 
        else {
            this.controls.removeChild(this.selectionBG);
        }
    }

    addHandle(x, y, id, parent) {
        const handle = document.createElement('div');
        handle.id = id;
        handle.classList.add('drag-handle');
        parent.appendChild(handle);
        this.dragAndDropCorner(x, y, handle); 
        return handle;
    }

    setSelection() {
        this.selection.xMin.value = Math.max(this.selection.xMin.value, 0);
        this.selection.yMin.value = Math.max(this.selection.yMin.value, 0);
        this.selection.xMax.value = Math.min(this.selection.xMax.value, window.innerWidth);
        this.selection.yMax.value = Math.min(this.selection.yMax.value, window.innerHeight);
        this.selection.xMax.value = Math.max(this.selection.xMax.value, this.selection.xMin.value + 50);
        this.selection.yMax.value = Math.max(this.selection.yMax.value, this.selection.yMin.value + 50);

        this.selectionBox.style.left = `${this.selection.x()}px`;
        this.selectionBox.style.top = `${this.selection.y()}px`;
        // this.selectionBox.style.width = `${this.selection.xMax.value - this.selection.xMin.value}px`;
        // this.selectionBox.style.height = `${this.selection.yMax.value - this.selection.yMin.value}px`;
        this.selectionBox.style.width = `${this.selection.width()}px`;
        this.selectionBox.style.height = `${this.selection.height()}px`;
        // console.log(
        //     `x: ${this.selection.x()}, width: ${this.selection.width()}.\n` +
        //     `y: ${this.selection.y()}, height: ${this.selection.height()}.\n` 
        //     // + `max x: ${this.selection.xMax.value}, max y: ${this.selection.yMax.value}.`
        // );
    }

    dragAndDropCorner(rectX, rectY, handle) {
        this.dragAndDropControls(handle, (deltaX, deltaY) => {
            rectX.value += deltaX;
            rectY.value += deltaY;
        });
    }

    dragAndDropControls(handle, onDrag) {
        let startX = 0, startY = 0;
        let isDragging = false;

        // const validatePosition = () => {
        //     if(curX < paddingX) {
        //         curX = paddingX;
        //     }
        //     else if(curX > window.innerWidth - paddingX) {
        //         curX = window.innerWidth - paddingX;
        //     }
        //     if(curY < paddingY) {
        //         curY = paddingY;
        //     }
        //     else if(curY > window.innerHeight - paddingY) {
        //         curY = window.innerHeight - paddingY;
        //     }

        //     // controls.style.top = curY + 'px'
        //     // controls.style.left = curX + 'px'
        //     x.value = curX;
        //     y.validatePosition = curY;
        // };
        
        
        const down = (x, y) => {
            isDragging = true;
            startX = x;
            startY = y;     
        }
        
        const mouseDown = (e) => {
            if(isDragging) return;
            isDragging = true;
            e.preventDefault();
            e.stopPropagation();
            down(e.clientX, e.clientY);
            document.addEventListener('mousemove', mouseMove);
        }
        const touchDown = (e) => {
            if(isDragging) return;
            isDragging = true;
            e.preventDefault();
            e.stopPropagation();
            down(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            document.addEventListener('touchmove', touchMove)
        }

        const move = (x, y ) => {
            // rectX.value += x - startX;
            // rectY.value += y - startY;
            onDrag(
                x - startX,
                y - startY
            );
        
            startX = x;
            startY = y;
    
            this.setSelection();

        }

        const mouseMove = (e) => {
            if(!isDragging) return;
            move(e.clientX, e.clientY);
            e.stopPropagation();
        }

        const touchMove = (e) => {
            if(!isDragging) return;
            move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            e.stopPropagation();
        }

        const mouseUp = (e) => {
            if(!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mousemove', mouseMove)
            e.stopPropagation();
        }

        handle.addEventListener('mousedown', mouseDown)
        handle.addEventListener('touchstart', touchDown)
        handle.addEventListener('mouseup', mouseUp)
        handle.addEventListener('touchend', mouseUp)
        handle.addEventListener('touchcancel', mouseUp)
        handle.style.cursor = 'grab';
        // window.addEventListener("resize", () => validatePosition());
    }

    drawSelectionCanvas(action) {

        let width = this.selection.width();
        let height = this.selection.height();
        let x = this.selection.x();
        let y = this.selection.y();
        if(!this.selectArea.value) {
            width = this.paintTool.canvas.width;
            height = this.paintTool.canvas.height;
            x = 0;
            y = 0;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;



        const ctx = canvas.getContext("2d");
        this.ctx = ctx;

        ctx.drawImage(this.paintTool.canvas, -x, -y);
        if(this.fillBg.value) {
            ctx.beginPath();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = this.paintTool.canvas.style.backgroundColor;
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fill();
        }

        canvas.toBlob(async (blob) => {
            action(blob);
        }, 'image/png');

        // copy existing contents to paint tool's canvas
        // baseCanvas.toBlob(async (blob) => {
        //     const img = new Image();
        //     img.onload = function () {
        //         ctx.drawImage(img, 0, 0);
        //         historyCtx.drawImage(img, 0, 0);
        //     };
        //     img.src = URL.createObjectURL(blob);
        // }, 'image/png');
        // this.baseCanvas.style.display = 'none';

    }
}