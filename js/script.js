// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        // ... (error handling as before)
        console.error("FATAL ERROR: Canvas element with ID 'gameCanvas' was not found.");
        alert("FATAL ERROR: Canvas not found. Check index.html.");
        return;
    }

    const ctx = canvas.getContext('2d');

    // --- Game State Variables ---
    let gold = 0; // Will be loaded from localStorage or default to 0
    let goldPerSecond = 0;
    const clickValue = 1;

    const mainClickImage = new Image();
    let mainClickImageLoaded = false;
    const itemImages = {};
    const itemImageLoaded = {};

    const equipment = [
        // Your equipment array... (ensure it's here)
        // Example:
        { id: "safety_glasses", name: "Safety Glasses", imageFile: "1. Safety Glasses", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", imageFile: "2. Gloves", baseCost: 150.00, production: 1.53, owned: 0 },
        // ... rest of your equipment
    ];

    // --- LAYOUT Constant (as defined in your futuristic theme) ---
    const LAYOUT = { /* ... Your full LAYOUT object ... */ };

    let buyButtonRects = [];
    let mainClickerRect = LAYOUT.mainClicker;
    let shopScrollY = 0;
    let totalShopContentHeight = 0;
    let lastUpdateTime = 0;
    let mouse = { x: 0, y: 0, down: false };
    let scrollbarHover = false; // Assuming you had this from scrollbar implementation

    // --- Utility Functions (formatNumber, calculateCurrentCost, etc. - as before) ---
    function formatNumber(num) { /* ... Your existing formatNumber function ... */ }
    function calculateCurrentCost(item) { /* ... Your existing calculateCurrentCost (item.baseCost * Math.pow(1.0, item.owned)) ... */ }
    
    function recalculateGPS() {
        goldPerSecond = equipment.reduce((totalGPS, item) => totalGPS + (item.production * item.owned), 0);
    }
    
    function loadItemImages() { /* ... Your existing loadItemImages function ... */ }

    // --- Drawing Functions (drawTechRect, clearCanvas, drawTopBar, etc. - as before) ---
    function drawTechRect(/*...*/) { /* ... */ }
    function clearCanvas() { /* ... */ }
    function drawTopBar() { /* ... */ }
    function drawMainClicker(/*...*/) { /* ... */ }
    function drawShop(/*...*/) { /* ... */ }

    // --- Game Logic and Interaction (handleManualClick, buyEquipmentItem - as before) ---
    function handleManualClick() { /* ... */ }
    function buyEquipmentItem(/*...*/) { /* ... */ }

    // --- Event Listeners (mousemove, mousedown, mouseup, click, wheel - as before) ---
    canvas.addEventListener('mousemove', (event) => { /* ... */ });
    // ... other listeners

    // =======================================================================
    // NEW: GAME STATE SAVE AND LOAD FUNCTIONS + OFFLINE PROGRESS
    // =======================================================================

    const SAVE_KEY = 'myFuturisticClickerGameState'; // Key for localStorage

    function saveGameState() {
        const gameState = {
            gold: gold,
            equipmentOwned: equipment.map(e => ({ id: e.id, owned: e.owned })),
            lastSessionTimestamp: Date.now(),
            lastGoldPerSecond: goldPerSecond // Save GPS at the moment of closing
        };
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
            console.log("Game state saved.");
        } catch (e) {
            console.error("Error saving game state to localStorage:", e);
        }
    }

    function loadGameState() {
        try {
            const savedStateString = localStorage.getItem(SAVE_KEY);
            if (savedStateString) {
                const savedState = JSON.parse(savedStateString);

                gold = savedState.gold || 0;
                if (savedState.equipmentOwned) {
                    equipment.forEach(currentItem => {
                        const savedItemData = savedState.equipmentOwned.find(s => s.id === currentItem.id);
                        if (savedItemData) {
                            currentItem.owned = savedItemData.owned || 0;
                        }
                    });
                }
                
                recalculateGPS(); // Recalculate GPS based on loaded owned items first

                // --- Offline Progress Calculation ---
                if (savedState.lastSessionTimestamp && typeof savedState.lastGoldPerSecond === 'number') {
                    const currentTime = Date.now();
                    const elapsedTimeMs = currentTime - savedState.lastSessionTimestamp;
                    
                    if (elapsedTimeMs > 0) { // Only calculate if time has passed
                        const elapsedTimeSec = elapsedTimeMs / 1000;

                        // Optional: Cap maximum offline earning time (e.g., 48 hours)
                        const maxOfflineSeconds = 48 * 60 * 60; 
                        const effectiveElapsedTimeSec = Math.min(elapsedTimeSec, maxOfflineSeconds);

                        const offlineGoldEarned = savedState.lastGoldPerSecond * effectiveElapsedTimeSec;

                        if (offlineGoldEarned > 0) {
                            gold += offlineGoldEarned;
                            // Display a message to the player
                            // For a canvas game, you'd need to draw this message or use an alert.
                            // Alert is simpler for now:
                            setTimeout(() => { // Use timeout to ensure canvas is ready if this is called early
                                alert(`Welcome back!\n\nYou earned ${formatNumber(offlineGoldEarned)} gold while you were away (${formatNumber(effectiveElapsedTimeSec / 60)} minutes).\n\n(Offline earnings based on GPS of ${formatNumber(savedState.lastGoldPerSecond)}/s)`);
                            }, 100); // Short delay
                        }
                    }
                }
                console.log("Game state loaded.");
            } else {
                console.log("No saved game state found. Starting fresh.");
                // Gold is already 0 by default, equipment owned is 0.
                // recalculateGPS(); // Already called, or call if not starting fresh path.
            }
        } catch (e) {
            console.error("Error loading game state from localStorage:", e);
            // Start fresh if loading fails
            gold = 0;
            equipment.forEach(e => e.owned = 0);
            recalculateGPS();
        }
    }

    // Auto-save periodically and on leaving the page
    setInterval(saveGameState, 30000); // Save every 30 seconds
    window.addEventListener('beforeunload', saveGameState); // Save when tab/browser is closed

    // --- Game Loop & Initialization ---
    function update(deltaTime) {
        if (deltaTime > 0.1) deltaTime = 0.1; // Cap deltaTime
        gold += goldPerSecond * deltaTime;
    }

    function draw() {
        clearCanvas();
        drawTopBar();
        drawMainClicker(mouse.x, mouse.y);
        drawShop(mouse.x, mouse.y);
        // TODO: If you want a more integrated offline earnings message, draw it here
        // based on a flag set after loadGameState.
    }

    let gameLoopStarted = false;
    function gameLoop(timestamp) {
        if (!gameLoopStarted) {
            lastUpdateTime = timestamp; // Set initial lastUpdateTime here
            gameLoopStarted = true;
        }
        const deltaTime = (timestamp - lastUpdateTime) / 1000;
        lastUpdateTime = timestamp;

        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    function init() {
        loadGameState(); // Load game state (which includes offline progress calculation)
        // recalculateGPS(); // This is now called within loadGameState after items are loaded
        
        loadItemImages(); // Start loading item icons

        mainClickImage.onload = () => {
            mainClickImageLoaded = true;
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.onerror = () => {
            mainClickImageLoaded = false; // Will draw placeholder
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.src = 'pics/manual/Main_click.png'; 
        // If mainClickImage loading is very fast or fails, ensure gameLoop starts.
        // The current setup starts gameLoop in mainClickImage.onload/onerror.
        // If those don't fire and loadGameState is quick, ensure gameLoop is called.
        // A simple check:
        if (!mainClickImage.complete && !mainClickImageLoaded && !gameLoopStarted) { // If src is set but not yet loaded/errored
            // This path might be redundant if onload/onerror always fire.
        } else if (mainClickImage.complete && !gameLoopStarted) { // Image might be cached and loaded instantly
             if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        }

    }

    init();
});
