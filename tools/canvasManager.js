export class AppCanvas {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.offsetX = x * width;
        this.offsetY = y * width;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export class CanvasManager {
    constructor(app, tileSize = 1024) {
        this.app = app;
        this.renderCallbacks = [];
        // Configuration
        this.tileSize = tileSize;
        
        this.clear();
        this.handleResize();

        this.keyboardShortcuts();
    }

    clear() {

        if(this.viewCanvas) {
            document.body.removeChild(this.viewCanvas.canvas);
        }

        // Create the visible canvas
        this.viewCanvas = new AppCanvas(0, 0, window.innerWidth, window.innerHeight);
        document.body.appendChild(this.viewCanvas.canvas);
        this.historyCanvas = new AppCanvas(0, 0, window.innerWidth, window.innerHeight);
        
        // Map of tiles using string keys "x_y"
        this.tiles = new Map();

        // Track dirty state
        this.isDirty = false;

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        

        this.dragging = false;
    }

    handleResize() {
        this.viewCanvas.canvas.width = 
        this.historyCanvas.canvas.width = 
            window.innerWidth;
        this.viewCanvas.canvas.height = 
        this.historyCanvas.canvas.height = 
            window.innerHeight;
        this.render();

        // this.historyCanvas.context.clearRect(0, 0, this.viewCanvas.width, this.viewCanvas.height);

        // this.historyCanvas.context.globalCompositeOperation = 'source-over';
        // // Copy history canvas content to active canvas
        // this.historyCanvas.context.drawImage(this.viewCanvas, 0, 0);
    }

    // Get tile at specified coordinates, creating if necessary
    getTile(x, y) {
        const key = `${x}_${y}`;
        if (!this.tiles.has(key)) {
            this.app.console.log(`creating tile ${key}`);
            this.tiles.set(key, new AppCanvas(x, y, this.tileSize, this.tileSize));
            this.app.console.add(this.tiles.get(key).canvas);
            this.tiles.get(key).canvas.style.maxWidth = "100%";
        }
        return this.tiles.get(key);
    }

    // Convert view coordinates to tile coordinates
    getTileCoordinates(x, y) {
        return {
            tileX: Math.floor(x / this.tileSize),
            tileY: Math.floor(y / this.tileSize),
            offsetX: x % this.tileSize,
            offsetY: y % this.tileSize
        };
    }

    // Pan the viewport
    pan(deltaX, deltaY) {
        this.moveTo(this.viewCanvas.offsetX + deltaX, this.viewCanvas.offsetY + deltaY);
    }

    home() {
        this.moveTo(0,0);
        this.app.console.log(`reseting view to ${this.viewCanvas.offsetX}, ${this.viewCanvas.offsetY}`);
    }

    moveTo(x, y) {
        if (this.isDirty) {
            this.saveCurrentViewToTiles();
        }
        
        this.viewCanvas.offsetX = x;
        this.historyCanvas.offsetX = x;
        this.viewCanvas.offsetY = y;
        this.historyCanvas.offsetY = y;
        this.render();
    }

    // Save the current view content to underlying tiles
    saveCurrentViewToTiles() {
        const startCoords = this.getTileCoordinates(this.viewCanvas.offsetX, this.viewCanvas.offsetY);
        const endCoords = this.getTileCoordinates(
            this.viewCanvas.offsetX + this.viewCanvas.canvas.width,
            this.viewCanvas.offsetY + this.viewCanvas.canvas.height
        );

        // Iterate through all affected tiles
        for (let tileX = startCoords.tileX; tileX <= endCoords.tileX; tileX++) {
            for (let tileY = startCoords.tileY; tileY <= endCoords.tileY; tileY++) {
                const tile = this.getTile(tileX, tileY);
                
                // Calculate the intersection between the view and this tile
                const intersectX = Math.max(tileX * this.tileSize, this.viewCanvas.offsetX);
                const intersectY = Math.max(tileY * this.tileSize, this.viewCanvas.offsetY);
                const intersectWidth = Math.min((tileX + 1) * this.tileSize, this.viewCanvas.offsetX + this.viewCanvas.canvas.width) - intersectX;
                const intersectHeight = Math.min((tileY + 1) * this.tileSize, this.viewCanvas.offsetY + this.viewCanvas.canvas.height) - intersectY;

                // Copy the relevant portion of the view to this tile
                tile.context.globalCompositeOperation = 'source-over';
                tile.context.drawImage(
                    this.historyCanvas.canvas,
                    intersectX - this.viewCanvas.offsetX,
                    intersectY - this.viewCanvas.offsetY,
                    intersectWidth,
                    intersectHeight,
                    intersectX - tileX * this.tileSize,
                    intersectY - tileY * this.tileSize,
                    intersectWidth,
                    intersectHeight
                );
            }
        }
        
        this.isDirty = false;
    }

    applyToTiles(bounds, callback) {
        const startCoords = this.getTileCoordinates(
            bounds.minX, bounds.minY
        );
        const endCoords = this.getTileCoordinates(
            bounds.maxX, bounds.maxY
        );

        // Iterate through all affected tiles
        for (let tileX = startCoords.tileX; tileX <= endCoords.tileX; tileX++) {
            for (let tileY = startCoords.tileY; tileY <= endCoords.tileY; tileY++) {
                this.app.console.log(`path cover tiles ${tileX} ${tileY} `)
                callback(this.getTile(tileX, tileY));
            }
        }
    }

    // Render the current view from tiles
    render() {
        // this.app.console.log(`rendering ${this.tiles.entries().length} tiles to canvas. Which is ${this.viewCanvas.canvas.width} wide, and ${this.viewCanvas.canvas.height} high`);
        this.historyCanvas.clear()
        
        const startCoords = this.getTileCoordinates(this.viewCanvas.offsetX, this.viewCanvas.offsetY);
        const endCoords = this.getTileCoordinates(
            this.viewCanvas.offsetX + this.viewCanvas.canvas.width,
            this.viewCanvas.offsetY + this.viewCanvas.canvas.height
        );

        // Draw all visible tiles
        for (let tileX = startCoords.tileX; tileX <= endCoords.tileX; tileX++) {
            for (let tileY = startCoords.tileY; tileY <= endCoords.tileY; tileY++) {
                const tile = this.getTile(tileX, tileY);
                
                this.historyCanvas.context.globalCompositeOperation = 'source-over';
                this.historyCanvas.context.drawImage(
                    tile.canvas,
                    0,
                    0,
                    this.tileSize,
                    this.tileSize,
                    tileX * this.tileSize - this.viewCanvas.offsetX,
                    tileY * this.tileSize - this.viewCanvas.offsetY,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
        for(var i = 0; i < this.renderCallbacks.length; i++) {
            this.renderCallbacks[i]();
        }
    }

    // Handle drawing operations
    draw(drawCallback) {
        drawCallback(this.viewCanvas.context);
        this.isDirty = true;
    }

    setDirty() {
        this.isDirty = true;
    }

    keyboardShortcuts() {
        const shortcuts = this.app.keyboardShortcuts;
        const offset = 50;
        shortcuts.register("ArrowLeft", (e) => {
            e.preventDefault();
            this.pan(-offset, 0);
        });
        shortcuts.register("ArrowRight", (e) => {
            e.preventDefault();
            this.pan(offset, 0);
        });
        shortcuts.register("ArrowUp", (e) => {
            e.preventDefault();
            this.pan(0, -offset);
        });
        shortcuts.register("ArrowDown", (e) => {
            e.preventDefault();
            this.pan(0, offset);
        });
        shortcuts.register("h", (e) => {
            e.preventDefault();
            this.home();
        });

        shortcuts.register("ArrowLeft", (e) => {
            e.preventDefault();
            this.pan(-offset, 0);
        });

        shortcuts.register(" ", (e) => {
            if(this.dragging)
                return;
            e.preventDefault();
            this.dragging = true;
            this.viewCanvas.canvas.style.cursor = 'grab';
        });

        shortcuts.registerKeyUp(" ", (e) => {
            if(!this.dragging)
                return;
            e.preventDefault();
            this.dragging = false;
            this.viewCanvas.canvas.style.cursor = '';
        });
    }

    // Clean up
    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }

    loadTile(x, y, img) {
        const key = `${x}_${y}`;
        const tile = new AppCanvas(x, y, this.tileSize, this.tileSize);
        tile.context.drawImage(img, 0, 0);
        this.tiles.set(key, tile);

    }
}