
export class TouchInputManager {
    constructor(paintTool, debugLogger) {
        this.debugLogger = debugLogger;
        this.paintTool = paintTool;
        this.reset();

        // Bind methods to maintain correct 'this' context
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.attach(document.body);
    }

    reset() {
        // Track active touches
        this.touches = new Map();
        // Track pencil touch specifically
        this.pencilTouch = null;
        // Track if we're currently drawing
        this.isDrawing = false;
        // Track tap timing for gestures
        this.lastTapTime = 0;
        this.tapCount = 0;
        // Track number of concurrent fingers while drawing
        this.activeFingerCount = 0;
    }

    attach(element) {
        this.debugLogger.log("attaching to " + element);

        element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        element.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
    }

    detach(element) {
        element.removeEventListener('touchstart', this.handleTouchStart);
        element.removeEventListener('touchmove', this.handleTouchMove);
        element.removeEventListener('touchend', this.handleTouchEnd);
        element.removeEventListener('touchcancel', this.handleTouchEnd);
    }

    handleTouchStart(event) {
        event.preventDefault();

        // Process each new touch
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, touch);

            // Check if this is a pencil touch
            if (touch.touchType === 'stylus') {
                this.debugLogger.log('pencil touch started');
                // If no drawing is in progress, start drawing
                if (!this.isDrawing) {
                    this.pencilTouch = touch;
                    this.isDrawing = true;
                    this.startDrawing(touch.clientX, touch.clientY);
                }
            } else {
                // Handle finger touches
                this.activeFingerCount++;

                if (!this.isDrawing) {
                    // Handle taps when not drawing
                    const now = Date.now();
                    if (now - this.lastTapTime < 300) {
                        // Double tap
                        this.tapCount++;
                        if (this.tapCount === 2) {
                            this.undo();
                            this.tapCount = 0;
                        } else if (this.tapCount === 3) {
                            this.redo();
                            this.tapCount = 0;
                        }
                    } else {
                        this.tapCount = 1;
                    }
                    this.lastTapTime = now;
                }
            }
        }
    }

    handleTouchMove(event) {
        event.preventDefault();

        // If we're drawing with the pencil, only track that movement
        if (this.isDrawing && this.pencilTouch) {
            for (const touch of event.changedTouches) {
                if (touch.identifier === this.pencilTouch.identifier) {
                    this.draw(touch.clientX, touch.clientY, this.activeFingerCount);
                    break;
                }
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();

        // Process each ended touch
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);

            // If this was the pencil touch, stop drawing
            if (this.pencilTouch && touch.identifier === this.pencilTouch.identifier) {
                this.stopDrawing(event);
                this.pencilTouch = null;
                this.isDrawing = false;
            } else {
                // Decrement finger count if this wasn't the pencil
                this.activeFingerCount = Math.max(0, this.activeFingerCount - 1);
            }
        }

        // Reset tap tracking if all touches are gone
        if (this.touches.size === 0) {
            setTimeout(() => {
                this.tapCount = 0;
            }, 300);
        }
    }

    // Placeholder methods to be implemented by the user
    startDrawing(x, y) {
        this.debugLogger.log('Start drawing at:', x, y);
        this.paintTool.startDrawing(x, y);
    }

    draw(x, y, fingerCount) {
        this.debugLogger.log('Drawing at:', x, y, 'with', fingerCount, 'fingers');
        this.paintTool.draw(x, y);
    }

    stopDrawing(event) {
        this.debugLogger.log('Stop drawing');
        this.paintTool.stopDrawing(event);
    }

    undo() {
        this.debugLogger.log('Undo');
        this.paintTool.undo();
    }

    redo() {
        this.debugLogger.log('Redo');
        this.paintTool.redo();
    }
}