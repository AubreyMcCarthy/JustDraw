
export class TouchInputManager {
    constructor(paintTool, debugLogger) {
        this.debugLogger = debugLogger;
        this.paintTool = paintTool;
        this.reset();

        // Bind methods to maintain correct 'this' context
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.attach(this.paintTool.canvas);
    }

    reset() {
        // Track active touches
        this.touches = new Map();
        // Track pencil touch specifically
        this.pencilTouch = null;
        // Track if we're currently drawing
        this.isDrawing = false;

        // Track number of concurrent fingers while drawing
        this.activeFingerCount = 0;

        this.tapGestureFingerCount = 0;
        this.tapGestureIntiated = 0;
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
                    this.startDrawing(touch.clientX, touch.clientY, this.mapForce(touch.force));
                }
            } else {
                // Handle finger touches
                this.activeFingerCount++;

                if (!this.isDrawing) {
                    // Handle taps when not drawing
                    if(this.activeFingerCount == 1) {
                        this.tapGestureIntiated = Date.now();
                    }

                    this.tapGestureFingerCount = Math.max(
                        this.tapGestureFingerCount,
                        this.activeFingerCount
                    );
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
                    this.draw(touch.clientX, touch.clientY, this.activeFingerCount, this.mapForce(touch.force));
                    break;
                }
            }
        }
    }

    mapForce(force) {
        if(!this.paintTool.usePencilForce.value) return 1;

        if(force) {
            let f = Math.min(f * 2, 1);
            return f * 0.5 + 0.5;
            // return force;
        }
        else {
            return 1;
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

                if(this.activeFingerCount === 0) {
                    const TAP_THRESHOLD = 300; // Maximum time in ms 
                    const touchDuration = Date.now() - this.tapGestureIntiated;

                    if (touchDuration < TAP_THRESHOLD) {
                        if (this.tapGestureFingerCount === 2) {
                            this.undo();
                        }
                        else if (this.tapGestureFingerCount === 3) {
                            this.redo();
                        }
                    }
                    this.tapGestureFingerCount = 0;
                }
            }
        }
    }

    // Placeholder methods to be implemented by the user
    startDrawing(x, y, force) {
        this.debugLogger.log(`Start drawing at: ${x}, ${y}, force:${force ? force : "no force applied"}`);
        this.paintTool.startDrawing(x, y, force);
    }

    draw(x, y, fingerCount, force) {
        // this.debugLogger.log('Drawing at:', x, y, 'with', fingerCount, 'fingers');
        this.paintTool.draw(x, y, force);
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