export class AppCanvas {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
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
        
        // Create the visible canvas
        this.viewCanvas = new AppCanvas(0, 0, window.innerWidth, window.innerHeight);
        document.body.appendChild(this.viewCanvas.canvas);
        this.historyCanvas = new AppCanvas(0, 0, window.innerWidth, window.innerHeight);
        
        // Map of tiles using string keys "x,y"
        this.tiles = new Map();
        
        // Track dirty state
        this.isDirty = false;
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        // this.handleResize();
    }

    handleResize() {
        this.viewCanvas.width =
            this.viewCanvas.canvas.width = 
            this.historyCanvas.canvas.width = 
            this.historyCanvas.width = this.viewCanvas.width;
        this.viewCanvas.canvas.height = 
            this.historyCanvas.canvas.height = 
            this.viewCanvas.height = 
            this.historyCanvas.height = this.viewCanvas.height;
        this.render();

        // this.historyCanvas.context.clearRect(0, 0, this.viewCanvas.width, this.viewCanvas.height);

        // this.historyCanvas.context.globalCompositeOperation = 'source-over';
        // // Copy history canvas content to active canvas
        // this.historyCanvas.context.drawImage(this.viewCanvas, 0, 0);
    }

    // Get tile at specified coordinates, creating if necessary
    getTile(x, y) {
        const key = `${x},${y}`;
        if (!this.tiles.has(key)) {
            this.tiles.set(key, new AppCanvas(x, y, this.tileSize, this.tileSize));
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
        this.moveTo(this.viewCanvas.x + deltaX, this.viewCanvas.y + deltaY);
        this.app.console.log(`panning canvas ${deltaX}, ${deltaY}, to view ${this.viewCanvas.x}, ${this.viewCanvas.y}`);
    }

    home() {
        moveTo(0,0);
        this.app.console.log(`reseting view to ${this.viewCanvas.x}, ${this.viewCanvas.y}`);
    }

    moveTo(x, y) {
        if (this.isDirty) {
            this.saveCurrentViewToTiles();
        }
        
        this.viewCanvas.x = x;
        this.historyCanvas.x = x;
        this.viewCanvas.y = y;
        this.historyCanvas.y = y;
        this.render();
    }

    // Save the current view content to underlying tiles
    saveCurrentViewToTiles() {
        const startCoords = this.getTileCoordinates(this.viewCanvas.x, this.viewCanvas.y);
        const endCoords = this.getTileCoordinates(
            this.viewCanvas.x + this.viewCanvas.width,
            this.viewCanvas.y + this.viewCanvas.height
        );

        // Iterate through all affected tiles
        for (let tileX = startCoords.tileX; tileX <= endCoords.tileX; tileX++) {
            for (let tileY = startCoords.tileY; tileY <= endCoords.tileY; tileY++) {
                const tile = this.getTile(tileX, tileY);
                
                // Calculate the intersection between the view and this tile
                const intersectX = Math.max(tileX * this.tileSize, this.viewCanvas.x);
                const intersectY = Math.max(tileY * this.tileSize, this.viewCanvas.y);
                const intersectWidth = Math.min((tileX + 1) * this.tileSize, this.viewCanvas.x + this.viewCanvas.width) - intersectX;
                const intersectHeight = Math.min((tileY + 1) * this.tileSize, this.viewCanvas.y + this.viewCanvas.height) - intersectY;

                // Copy the relevant portion of the view to this tile
                tile.context.drawImage(
                    this.historyCanvas,
                    intersectX - this.viewCanvas.x,
                    intersectY - this.viewCanvas.y,
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

    // Render the current view from tiles
    render() {
        this.historyCanvas.clear()
        
        const startCoords = this.getTileCoordinates(this.viewCanvas.x, this.viewCanvas.y);
        const endCoords = this.getTileCoordinates(
            this.viewCanvas.x + this.viewCanvas.width,
            this.viewCanvas.y + this.viewCanvas.height
        );

        // Draw all visible tiles
        for (let tileX = startCoords.tileX; tileX <= endCoords.tileX; tileX++) {
            for (let tileY = startCoords.tileY; tileY <= endCoords.tileY; tileY++) {
                const tile = this.getTile(tileX, tileY);
                
                this.historyCanvas.context.drawImage(
                    tile.canvas,
                    0,
                    0,
                    this.tileSize,
                    this.tileSize,
                    tileX * this.tileSize - this.viewCanvas.x,
                    tileY * this.tileSize - this.viewCanvas.y,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
        for(var i = 0; i < this.renderCallbacks.length; i++) {
            this.renderCallbacks[i]()
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

    // Clean up
    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}