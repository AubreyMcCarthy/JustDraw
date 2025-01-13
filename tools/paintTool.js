export class PaintTool {
    constructor(debugLogger) {
        this.debugLogger = debugLogger;
        this.color = '#990099';
        
        this.eraser = {
            label: "Eraser",
            tooltip: "eraser",
            icon: "img/icon/eraser.svg",
            value: false,
            defaultValue: false,
            color: "#000"
        }
        this.polyFill = {
            label: "Poly Fill",
            tooltip: "fill area",
            icon: "img/icon/brush_flat.svg",
            value: false,
            defaultValue: false,
        }
        this.usePencilForce = {
            label: "Use Pencil Force",
            tooltip: "pressure",
            icon: "img/icon/adhesive_tape.svg",
            value: false,
            defaultValue: false,
        }

        this.lineWidth = {
            lable: "Line Width",
            value: 5,
            defaultValue: 5,
            min: 1,
            max: 65,
            step: 4,
            validate() {
                if(this.value < this.min)
                    this.value = this.min
                else if(this.value > this.max)
                    this.value = this.max
                this.slider.value = this.value;

            },
            
        };

        this.blendModes = [
            {
                label: "Normal",
                value: "source-over",
            },
            {
                label: "Lighten",
                value: "lighten",
            },
            {
                label: "Darken",
                value: "darken",
            },
            {
                label: "Ontop",
                value: "source-atop",
            },
            {
                label: "Under",
                value: "destination-over",
            },
        ]
        this.blendMode = this.blendModes[0].value;

        const PaintActions = {
            CanvasFill: "CanvasFill",
            Draw: "Draw",
            Fill: "Fill",
        }
        this.PaintActions = PaintActions

        this.colors = [
            // {
            //     lable: "Black",
            //     color: '#000',
            // },
            // {
            //     lable: "White",
            //     color: '#fff',
            // },
            // {
            //     lable: "Red",
            //     color: '#ff0000',
            // },
            // {
            //     lable: "Green",
            //     color: '#00ff00',
            // },
            // {
            //     lable: "Blue",
            //     color: '#0000ff',
            // },
            {
                lable: "Steel Pink",
                color: '#C23AA9',
            },
            {
                lable: "Coral",
                color: '#FB8F67',
            },

            {
                lable: "Naples Yellow",
                color: '#F8E16C',
            },
            {
                lable: "Mint",
                color: '#00C49A',
            },
            {
                lable: "Blue Green",
                color: '#00A0C0',
            },
            {
                lable: "Royal Purple",
                color: '#884CBA',
            },
            {
                lable: "Tea Green",
                color: '#D3DFB8',
            },
            {
                lable: "Ebony",
                color: '#545C52',
            },
            {
                lable: "Black Olive",
                color: '#303B2B',
            },
        ]
        this.color = this.colors[0].color;
    }

    init() {

        const controls = document.getElementById('controls-toolbar');


        this.toolBtn = document.createElement('button');
        this.toolBtn.innerHTML = "Draw";
        this.toolBtn.addEventListener('click', () => {
            processor.setTool(this);
        });

        controls.appendChild(this.toolBtn);

        this.getControls();
    }

    loadSVGIcon(path, el, tooltip) {
        fetch(path)
            .then(response => response.text())
            .then(svg => {
                el.innerHTML = svg;
                if(tooltip) {
                    el.classList.add('tooltip');
                    el.innerHTML += `<span class="tooltiptext">${tooltip}</span>`;
                }
            })
            .catch(error => console.error('Error loading the SVG: ', error));
    }

    addSelectButton(o, controls) {
        const btn = document.createElement('button');
        if(o.icon != "") {
            
            this.loadSVGIcon(o.icon, btn, o.tooltip);
            // // <span class="tooltiptext">New Blank</span>
            // const tooltip = document.createElement('span');
            // tooltip.classList.add('tooltiptext');
            // tooltip.innerText = o.tooltip;
            
            // console.log(btn.innerHTML);
        }
        controls.appendChild(btn);
        return btn;
    }
    
    setButtonColor(btn, color) {
        btn.style.backgroundColor = color;
    }

    addColorButton(o, controls) {
        const btn = this.addSelectButton({icon: "", tooltip: ""}, controls);
        this.setButtonColor(btn, o.color);
        btn.addEventListener('click', () => {
            this.color = o.color;
            this.eraser.value = false;
            this.eraser.btn.classList.remove("btn-enabled");
            this.selectColor(o.color);
        });
        o.btn = btn;
    }
    addToolButton(o, controls) {
        const btn = this.addSelectButton(o, controls);

        if(o.value)
            btn.classList.add("btn-enabled");

        btn.addEventListener('click', () => {
            o.value = !o.value;
            if(o.value)
                btn.classList.add("btn-enabled");
            else
                btn.classList.remove("btn-enabled");

            this.selectColor();
        });
        o.btn = btn;
    }

    setPreview() {
        this.radiusPreview.style.width = this.radiusPreview.style.height = `${this.lineWidth.value*2}px`;
    }

    addSlider(o, controls) {
        const slider = document.createElement('input');
        slider.id = o.lable.replace(/\s/g, "-") + "-slider";
        slider.type = 'range';
        slider.min = o.min;
        slider.max = o.max;
        slider.value = o.value;
        slider.step = o.step ? o.step : 0.01;
        controls.appendChild(slider);
        const setPreview = this.setPreview.bind(this);
        slider.addEventListener('input', (value) => {
            o.value = slider.value;
            setPreview();
            // take input from the user
            // const number = value;
            // let n1 = 0, n2 = 1, nextTerm;

            // console.log('Fibonacci Series:');
            // console.log(n1); // print 0
            // console.log(n2); // print 1

            // nextTerm = n1 + n2;

            // while (nextTerm <= number) {

            //     // print the next term
            //     console.log(nextTerm);

            //     n1 = n2;
            //     n2 = nextTerm;
            //     nextTerm = n1 + n2;
            // }
            // o.value = nextTerm;
            // slider.value = nextTerm;
        });
        o.reset = function() { this.value = this.defaultValue; };
        slider.addEventListener("dblclick", (event) => {
            o.value = o.defaultValue;
            slider.value = o.value;
            setPreview();
        });
        o.slider = slider;
    }

    addSelect(o, controls) {
        const select = document.createElement('select');
        controls.appendChild(select);

        //Create and append the options
        for (var i = 0; i < o.length; i++) {
            var option = document.createElement("option");
            option.value = o[i].value;
            option.text = o[i].label;
            select.appendChild(option);
        }
        return select;
    }

    getControls() {
        this.toolBtn.disabled = true;
        const controls = document.getElementById('controls-tool-specific');
        controls.innerHTML = "";

        const hideBtn = this.addSelectButton({icon: "img/icon/pencil.svg", tooltip: "hide"}, controls);
        hideBtn.addEventListener('click', () => {
            controls.classList.toggle('minimized');
        });

        // const headerSpan = document.createElement('span');
        // headerSpan.style.width = "80px";
        // headerSpan.style.alignContent = "center";
        // headerSpan.style.color = 'rgb(169, 163, 142)';
        // headerSpan.innerText = "just draw";
        // controls.appendChild(headerSpan);
        const headerImg = document.createElement('img');
        headerImg.src = "img/just-draw.png";
        headerImg.style.width = "80px";
        headerImg.style.height = "20px";
        headerImg.style.marginTop = '8px';
        controls.appendChild(headerImg);

        const newDrawingButton = this.addSelectButton({icon: "img/icon/easel.svg", tooltip: "new"}, controls);
        newDrawingButton.addEventListener('click', () => location.reload());

        // Add undo/redo buttons
        const undoButton = this.addSelectButton({icon: "img/icon/undo.svg", tooltip: "undo"}, controls);
        undoButton.addEventListener('click', () => this.undo());

        const redoButton = this.addSelectButton({icon: "img/icon/redo.svg", tooltip: "redo"}, controls);
        redoButton.addEventListener('click', () => this.redo());


        for (let i = 0; i < this.colors.length; i++) {
            this.addColorButton(this.colors[i], controls);
        }
        // controls.appendChild(document.createElement('hr'));

        this.addToolButton(this.eraser, controls);
        this.addToolButton(this.polyFill, controls);
        
        const fillBtn = this.addSelectButton({icon:"img/icon/paint.svg", tooltip: "set background"}, controls);
        fillBtn.addEventListener('click', () => this.fillColor());

        const blendSelect = this.addSelect(this.blendModes, controls);
        blendSelect.addEventListener("change", (event) => {
            this.blendMode = event.target.value;
            this.ctx.globalCompositeOperation = this.blendMode;
        });
        blendSelect.style.width = "160px";
        blendSelect.style.height = "36px";
        blendSelect.id = "blend-mode-select";
        blendSelect.value = this.blendMode;

        this.currentColor = this.addSelectButton({icon: "", tooltip: ""}, controls);

        
        const colorSelect = document.createElement('input');
        this.colorSelect = colorSelect;
        colorSelect.type = 'color';
        colorSelect.className = 'color-picker';
        colorSelect.id = 'color-picker';
        colorSelect.addEventListener("input", (event) => {
            this.color = event.target.value;
            this.selectColor();
        });
        controls.appendChild(colorSelect);
        // <input type="color" id="html5colorpicker" onchange="clickColor(0, -1, -1, 5)" value="#ff0000" style="width:85%;"></input>
        
        const radiusPreviewContainer = document.createElement('div');
        radiusPreviewContainer.style.width = "100%";
        // radiusPreviewContainer.style.height = `${this.lineWidth.max*2}px`;
        // radiusPreviewContainer.style.backgroundColor = "#993366";
        radiusPreviewContainer.id = 'raidus-preview-container';
        
        const radiusPreview = document.createElement('div');
        this.radiusPreview = radiusPreview;
        this.setPreview();
        radiusPreview.style.margin = 'auto';
        radiusPreview.style.boxSizing = 'border-box';
        radiusPreview.style.borderRadius = "50%";
        radiusPreview.style.border = "2px solid rgb(91, 85, 61)";
        radiusPreview.style.backgroundColor = "rgb(47, 56, 67)";
        
        this.addSlider(this.lineWidth, controls);
        controls.appendChild(radiusPreviewContainer);
        radiusPreviewContainer.appendChild(radiusPreview);

        this.addToolButton(this.usePencilForce, controls);

        this.newCanvas();
        this.dragAndDropControls(controls, headerImg);
        // this.resize();
    }

    dragAndDropControls(controls, handle) {
        let newX = 0, newY = 0, startX = 0, startY = 0;
        let curX = 0, curY;

        handle.addEventListener('mousedown', mouseDown)
        handle.style.cursor = 'grab';

        const validatePosition = () => {
            if(curX < 10) {
                curX = 10;
            }
            else if(curX > window.innerWidth - controls.offsetWidth - 10) {
                curX = window.innerWidth - controls.offsetWidth - 10;
            }
            if(curY < 10) {
                curY = 10;
            }
            else if(curY > window.innerHeight - controls.offsetHeight - 10) {
                curY = window.innerHeight - controls.offsetHeight - 10;
            }

            controls.style.top = curY + 'px'
            controls.style.left = curX + 'px'
        };

        function mouseDown(e){
            e.preventDefault();

            startX = e.clientX
            startY = e.clientY

            document.addEventListener('mousemove', mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }

        function mouseMove(e){
            newX = startX - e.clientX 
            newY = startY - e.clientY 
        
            startX = e.clientX
            startY = e.clientY

            curX = controls.offsetLeft - newX;
            curY = controls.offsetTop - newY;

            validatePosition();
        }

        function mouseUp(e){
            document.removeEventListener('mousemove', mouseMove)
        }
        window.addEventListener("resize", () => validatePosition());
    }

    // function to setup a new canvas for drawing
    newCanvas() {
        const state = {
            isDrawing: false,
            paths: [],
            redoPaths: [],
            maxUndoSteps: 20,
            currentPath: [],
        };
        this.state = state;


        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.id = 'drawing-canvas';
        this.canvas = canvas;
        document.body.appendChild(canvas);

        // Canvas setup
        const historyCanvas = document.createElement('canvas');
        this.historyCanvas = historyCanvas;
        historyCanvas.width = canvas.width;
        historyCanvas.height = canvas.height;


        const ctx = canvas.getContext("2d");
        this.ctx = ctx;
        const historyCtx = historyCanvas.getContext('2d');
        this.historyCtx = historyCtx;

        [this.ctx, this.historyCtx].forEach(ctx => {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth.value;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        });

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

        // setup to trigger drawing on mouse or touch
        // this.drawTouch();
        // this.drawPointer();
        this.drawMouse();
        this.keyboardShortcuts();

        const randomBgColor = Math.floor(Math.random() * 6);
        this.canvas.style.backgroundColor = this.colors.at(randomBgColor).color;
        // this.color = this.colors.at(randomBgColor).color;
        // this.fillColor();
        let randomPaintColor = Math.floor(Math.random() * 6);
        // console.log(`bg: ${randomBgColor}, paint: ${randomPaintColor}`); 
        if(randomBgColor == randomPaintColor) {
            console.log("same color");
            randomPaintColor += 1;
            if(randomPaintColor >= 6)
                randomPaintColor = 0;   
        }
        this.color = this.colors.at(randomPaintColor).color;
        this.selectColor();
    }

    // resize() {
    //     window.addEventListener("resize", (event) => {
    //         if(window.innerWidth <= this.canvas.width && window.innerHeight <= this.canvas.height)
    //             return;

    //         const width = Math.max(window.innerWidth, this.canvas.width);
    //         const height = Math.max(window.innerWidth, this.canvas.height);

            
    //         this.canvasToPng(this.historyCanvas, (img) => {
    //             this.canvas.width = this.historyCanvas.width = width;
    //             this.canvas.height = this.historyCanvas.height = height;

    //             // Clear active canvas
    //             this.historyCtx.clearRect(0, 0, width, height);

    //             // Copy history canvas content to active canvas
    //             this.historyCtx.drawImage(img, 0, 0);

    //             this.redrawCanvas();
    //         })
    //     });
    // }


    apply() {
        // new image with contents
        this.canvas.toBlob(async (blob) => {
            this.io.newImage(URL.createObjectURL(blob));
            this.close();
        }, 'image/png');

    }

    canvasToPng(canvas, action) {
        canvas.toBlob(async (blob) => {
            action(blob);
        }, 'image/png');
    }

    selectColor() {
        if(this.eraser.value)
        {
            this.ctx.globalCompositeOperation = 'destination-out';
            if (this.currentColor)
            {
                this.currentColor.style.backgroundColor = this.eraser.color;
                this.loadSVGIcon(this.eraser.icon, this.currentColor);
                // this.currentColor.innerHTML = this.eraser.btn.innerHTML;
            }
        }
        else
        {
            this.ctx.globalCompositeOperation = this.blendMode;
            if (this.currentColor)
            {
                this.currentColor.style.backgroundColor = this.color;
                this.currentColor.innerHTML = "";
            }
        }

        this.colorSelect.value = this.color;
        
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
        this.ctx.beginPath();
    }

    fillColor() {
        // this.ctx.beginPath();
        // this.ctx.fillStyle = this.color;
        // this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fill();

        // this.addToUndoStack({
        //     color: this.color,
        //     paintAction: this.PaintActions.CanvasFill,
        //     blend: this.ctx.globalCompositeOperation,
        // });
        this.addToUndoStack({
            color: this.color,
            colorBefore: this.canvas.style.backgroundColor,
            paintAction: this.PaintActions.CanvasFill,    
        });
        this.canvas.style.backgroundColor = this.color;
    }

    startDrawing(posX, posY, force) {
        if(this.state.isDrawing) return;

        this.state.isDrawing = true;
        this.state.currentPath = {
            points: [],
            color: this.color,
            paintAction: this.PaintActions.Draw,
        };
        this.state.currentPath.points.push({ x: posX, y: posY, force: force ? force : 1 });
        this.state.currentPath.points.push({ x: posX, y: posY, force: force ? force : 1 });

        // this.ctx.beginPath();
        // this.ctx.moveTo(posX, posY);
        // this.ctx.stroke();
        this.ctx.lineWidth = this.polyFill.value ? 1 : this.lineWidth.value;
        if(!this.polyFill.value)
            this.drawPoint(posX, posY, force ? force : 1)
    }

    cancelDrawing() {
        this.state.isDrawing = false;
        this.state.currentPath = {};
        this.redrawCanvas();
    }

    drawPoint(x, y, force) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.lineWidth.value * 0.5 * force, 0, Math.PI * 2);
        this.ctx.fill();
    }

    draw(posX, posY, force) {
        if (!this.state.isDrawing) return;

        const newPoint = { x: posX, y: posY, force: force ? force : 1  };
        const lastPoint = this.state.currentPath.points.at(-1);
        this.state.currentPath.points.push(newPoint);

        this.ctx.beginPath();
        this.ctx.lineWidth = Math.max(this.lineWidth.value * lastPoint.force, 1);
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(posX, posY);
        this.ctx.stroke();
    }

    addToUndoStack(a) {
        this.state.paths.push(a);
        this.state.redoPaths = [];

        // If we exceed maxUndoSteps, bake the oldest path into history
        if (this.state.paths.length > this.state.maxUndoSteps) {
            this.bakeOldestPath();
        }
    }

    stopDrawing(e) {
        if (!this.state.isDrawing) return;

        const polyFill = this.polyFill.value || e.shiftKey;

        if(polyFill) {
            this.ctx.beginPath();
            const firstPoint = this.state.currentPath.points.at(-1)
            this.ctx.moveTo(firstPoint.x, firstPoint.y)
            this.state.currentPath.points.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            })
            this.ctx.fill();
        }

        this.state.isDrawing = false;
        if (this.state.currentPath.points.length > 0) {
            this.addToUndoStack({
                points: [...this.state.currentPath.points],
                color: this.state.currentPath.color,
                paintAction: this.PaintActions.Draw,
                blend: this.ctx.globalCompositeOperation,
                polyFill: polyFill,
                lineWidth: this.polyFill.value ? 1 : this.lineWidth.value,
            });
        }
        window.onbeforeunload = function() {
            return true;
        };
        this.debugLogger.log("stopped drawing");
    }


    // prototype to	start drawing on touch using canvas moveTo and lineTo
    drawTouch() {
        const startDrawing = this.startDrawing.bind(this);
        const draw = this.draw.bind(this);
        const stopDrawing = this.stopDrawing.bind(this);
        let drawingIdentifier;
        var move = function (e) {
            e.preventDefault();
            for(let i = 0; i < e.touches.length; i++){
                const touch = e.touches[i];
                if(touch.identifier != drawingIdentifier)
                    continue;
                drawingIdentifier = e.identifier;
                const x = touch.pageX - touch.target.offsetLeft;
                const y = touch.pageY - touch.target.offsetTop;
                draw(x, y);
            }
        };
        var stop = function (e) {
            for(let i = 0; i < e.touches.length; i++){
                if(e.touches[i].identifier == drawingIdentifier)
                    return;
            }
            stopDrawing(e);
        };

        this.canvas.addEventListener("touchmove", move, false);
        this.canvas.addEventListener("touchend", stop, false);

        let touchStartTime = 0;
        let touchCount = 0;
        const TAP_THRESHOLD = 200; // Maximum time in ms 

        document.addEventListener('touchstart', (e) => {
            if(this.isDrawing)
                return;

            for(let i = 0; i < e.touches.length; i++){
                const touch = e.touches[i];
                // if(touch.touchType != 'stylus')
                //     continue;
                drawingIdentifier = e.identifier;
                const x = touch.pageX - touch.target.offsetLeft;
                const y = touch.pageY - touch.target.offsetTop;
                this.startDrawing(x, y);
                return;
            }

            touchCount = e.touches.length;
            touchStartTime = Date.now();

            // Prevent default behavior like scrolling or zooming
            if (touchCount >= 2) {
                e.preventDefault();
            }


        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if(this.isDrawing)
                return;

            const touchDuration = Date.now() - touchStartTime;

            if (touchDuration < TAP_THRESHOLD) {
                if (touchCount === 2) {
                    this.undo();
                }
                else if (touchCount === 3) {
                    this.redo();
                }
            }
            touchCount = 0;
        });

        // Prevent default touch behaviors that might interfere
        document.addEventListener('touchmove', (e) => {
            if (touchCount >= 2) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent context menu from appearing on long press
        document.addEventListener('contextmenu', (e) => {
            if (touchCount >= 2) {
                e.preventDefault();
            }
        });
    };

    // prototype to	start drawing on pointer(microsoft ie) using canvas moveTo and lineTo
    drawPointer() {
        const startDrawing = this.startDrawing.bind(this);
        const draw = this.draw.bind(this);
        const stopDrawing = this.stopDrawing.bind(this);
        var start = function (e) {
            e = e.originalEvent;
            const x = e.offsetX;
            const y = e.offsetY;
            startDrawing(x, y);
        };
        var move = function (e) {
            e.preventDefault();
            e = e.originalEvent;
            const x = e.offsetX;
            const y = e.offsetY;
            draw(x, y);
        };
        var stop = function (e) {
            stopDrawing(e);
        };
        this.canvas.addEventListener("MSPointerDown", start, false);
        this.canvas.addEventListener("MSPointerMove", move, false);
        document.addEventListener("MSPointerUp", stop, false);
    };

    // prototype to	start drawing on mouse using canvas moveTo and lineTo
    drawMouse() {
        var clicked = 0;

        const startDrawing = this.startDrawing.bind(this);
        const draw = this.draw.bind(this);
        const stopDrawing = this.stopDrawing.bind(this);
        var start = function (e) { 
            if (e.which != 1) 
                return;
            clicked = 1;
            startDrawing(e.offsetX, e.offsetY);
        };
        var move = function (e) {
            if (clicked) {
                draw(e.offsetX, e.offsetY);
            }
        };
        var stop = function (e) {
            if (e.which != 1) 
                return;
            clicked = 0;
            stopDrawing(e);
        };
        this.canvas.addEventListener("mousedown", start, false);
        this.canvas.addEventListener("mousemove", move, false);
        document.addEventListener("mouseup", stop, false);
    };

    keyboardShortcuts() {
        const handleShortcut = (e) => {
            if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if(e.shiftKey) {
                    this.debugLogger.log("redo keyboard shortcut");
                    this.redo();
                }
                else {
                    this.debugLogger.log("undo keyboard shortcut");
                    this.undo();
                }
            }
            else if(e.key === 'e') {
                this.eraser.btn.click();
            }
            else if(e.key === 'f') {
                this.polyFill.btn.click();
            }
            else if(e.key === '[') {
                this.lineWidth.value -= this.lineWidth.step;
                this.lineWidth.validate();
                this.setPreview();
            }
            else if(e.key === ']') {
                this.lineWidth.value += this.lineWidth.step;
                this.lineWidth.validate();
                this.setPreview();
            }
        }
        document.addEventListener("keydown", handleShortcut);
    }

    // Undo/Redo functions
    undo() {
        if (this.state.paths.length === 0) return;

        const pathToUndo = this.state.paths.pop();
        this.state.redoPaths.push(pathToUndo);
        if(pathToUndo.paintAction === this.PaintActions.CanvasFill) {
            this.canvas.style.backgroundColor = pathToUndo.colorBefore;
        }
        else {
            this.redrawCanvas();
        }
    }

    redo() {
        if (this.state.redoPaths.length === 0) return;

        const pathToRedo = this.state.redoPaths.pop();
        this.state.paths.push(pathToRedo);
        if(pathToRedo.paintAction === this.PaintActions.CanvasFill) {
            this.canvas.style.backgroundColor = pathToRedo.color;
        }
        else {
            this.redrawCanvas();
        }
    }

    redrawCanvas() {
        // Clear active canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.globalCompositeOperation = 'source-over';
        // Copy history canvas content to active canvas
        this.ctx.drawImage(this.historyCanvas, 0, 0);

        // Redraw all paths in the undo stack
        for (const path of this.state.paths) {
            this.drawCompletePath(path, this.ctx);
        }

        this.selectColor();
    }

    drawCompletePath(path, ctx) {
        ctx.globalCompositeOperation = path.blend;
        if(path.paintAction === this.PaintActions.Draw) {
            ctx.lineWidth = path.lineWidth;
            ctx.strokeStyle = path.color;
            ctx.fillStyle = path.color;
            ctx.beginPath();
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineWidth = Math.max(path.lineWidth * path.points[i].force, 1);
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
            if(path.polyFill)
                ctx.fill()
        }
        else if(path.paintAction === this.PaintActions.CanvasFill) {
            ctx.beginPath();
            ctx.fillStyle = path.color;
            ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fill();
        }
    }

    // Remove oldest path and draw it on the history canvas
    bakeOldestPath() {
        const path = this.state.paths.shift();
        const ctx = this.historyCtx;
        this.drawCompletePath(path, ctx);        
    }
}
