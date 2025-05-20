// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error("FATAL ERROR: Canvas element with ID 'gameCanvas' was not found in your HTML.");
        alert("FATAL ERROR: Canvas element with ID 'gameCanvas' not found. Please check your index.html and the canvas ID. The game cannot start.");
        return;
    }

    const ctx = canvas.getContext('2d');

    // Game State Variables
    let gold = 0; // Start with some gold for testing: 100000;
    let goldPerSecond = 0;
    const clickValue = 1;

    // Images
    const mainClickImage = new Image();
    let mainClickImageLoaded = false;
    const itemImages = {}; // To store loaded item icons { itemId: ImageObject }
    const itemImageLoaded = {}; // { itemId: boolean }

    const equipment = [
        // Using IDs that can be used for image filenames (e.g., safety_glasses.png)
        { id: "safety_glasses", name: "Safety Glasses", description: "Protects eyes from debris during basic tasks.", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", description: "Provides hand protection for manual labor.", baseCost: 150.00, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", description: "A basic tool for driving nails or shaping materials.", baseCost: 750.00, production: 7.80, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", description: "Used for inserting and removing screws.", baseCost: 3750.00, production: 39.80, owned: 0 },
        { id: "pliers", name: "Pliers", description: "Grips and manipulates small objects and wires.", baseCost: 18750.00, production: 202.96, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", description: "Tightens and loosens nuts and bolts.", baseCost: 93750.00, production: 1035.08, owned: 0 },
        { id: "utility_knife", name: "Utility Knife", description: "Cuts various thin materials precisely.", baseCost: 468750.00, production: 5278.89, owned: 0 }, // Shorter name for display
        { id: "measuring_tape", name: "Measuring Tape", description: "Ensures accurate measurements for fabrication.", baseCost: 2343750.00, production: 26922.32, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", description: "Manually cuts wood or other soft materials.", baseCost: 11718750.00, production: 137303.83, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", description: "Shapes or carves wood and metal by hand.", baseCost: 58593750.00, production: 700249.55, owned: 0 },
        { id: "file_set", name: "File Set", description: "Smooths and shapes metal or wood surfaces.", baseCost: 292968750.00, production: 3571272.71, owned: 0 },
        { id: "manual_clamps", name: "Manual Clamps", description: "Securely holds workpieces in place.", baseCost: 1464843750.00, production: 18213490.85, owned: 0 },
        { id: "manual_hand_drill", name: "Manual Drill", description: "Creates small holes with manual power.", baseCost: 7324218750.00, production: 92888803.31, owned: 0 }, // Shorter name
        { id: "pop_rivet_gun", name: "Rivet Gun", description: "Joins sheet materials with rivets by hand.", baseCost: 36621093750.00, production: 473732896.89, owned: 0 }, // Shorter name
        { id: "workbench", name: "Workbench", description: "A sturdy surface for all manufacturing tasks.", baseCost: 183105468750.00, production: 2416037774.16, owned: 0 },
        { id: "vise", name: "Vise", description: "A bench-mounted tool for firmly holding items.", baseCost: 915527343750.00, production: 12321792648.23, owned: 0 },
        { id: "manual_grease_gun", name: "Grease Gun", description: "Applies lubricant to machine parts.", baseCost: 4577636718750.00, production: 62841142505.98, owned: 0 },
        { id: "caulking_gun", name: "Caulking Gun", description: "Applies sealants and adhesives from tubes.", baseCost: 22888183593750.00, production: 320489826780.49, owned: 0 },
        { id: "broom_dustpan", name: "Broom & Dustpan", description: "Keeps the workshop clean and operational.", baseCost: 114440917968750.00, production: 1634498116580.51, owned: 0 },
        { id: "basic_soldering_iron", name: "Soldering Iron", description: "Joins electronic components with solder.", baseCost: 572204589843750.00, production: 8335940394560.60, owned: 0 },
        { id: "electric_drill", name: "Electric Drill", description: "A powered tool for drilling holes quickly.", baseCost: 2861022949218750.00, production: 42513296012259.10, owned: 0 },
        { id: "jigsaw", name: "Jigsaw", description: "Cuts intricate curves and shapes in various materials.", baseCost: 14305114746093700.00, production: 216817809662521.00, owned: 0 },
        { id: "circular_saw", name: "Circular Saw", description: "Makes straight cuts in wood and other materials.", baseCost: 71525573730468800.00, production: 1105770829278860.00, owned: 0 },
        { id: "orbital_sander", name: "Orbital Sander", description: "Smooths surfaces with a random orbital motion.", baseCost: 357627868652344000.00, production: 5639431229322180.00, owned: 0 },
        { id: "angle_grinder", name: "Angle Grinder", description: "Grinds, cuts, and polishes metal and masonry.", baseCost: 1788139343261720000.00, production: 28761099269543100.00, owned: 0 },
        { id: "power_screwdriver", name: "Power Screwdriver", description: "Drives screws with electric power, faster than manual.", baseCost: 8940696716308590000.00, production: 146681606274670000.00, owned: 0 },
        { id: "heat_gun", name: "Heat Gun", description: "Emits hot air for tasks like stripping paint or shrinking tubing.", baseCost: 44703483581543000000.00, production: 748076192000816000.00, owned: 0 },
        { id: "rotary_tool", name: "Rotary Tool", description: "A versatile handheld tool for grinding, sanding, and polishing small parts.", baseCost: 223517417907715000000.00, production: 3815188579204160000.00, owned: 0 },
        { id: "bench_grinder", name: "Bench Grinder", description: "Sharpens tools and grinds metal on a stationary wheel.", baseCost: 1117587089538570000000.00, production: 19457461753941200000.00, owned: 0 },
        { id: "belt_sander", name: "Belt Sander", description: "Rapidly sands flat surfaces with a continuous abrasive belt.", baseCost: 5587935447692870000000.00, production: 99233054945100200000.00, owned: 0 },
    ];

    const LAYOUT = {
        padding: 20,
        topBarHeight: 60,
        mainClicker: { x: 20, y: 80, width: 200, height: 150 },
        shop: {
            x: 250,
            y: 80,
            width: canvas.width - 250 - 20 - 20, // Padded width
            height: canvas.height - 80 - 20, // Available height for shop content
            card: {
                width: (canvas.width - 250 - 20 - 20) - 20, // Shop width - scrollbar
                height: 180, // Approximate height based on example
                bgColor: '#FCE49C', // Yellowish like example
                borderColor: '#E6A23C', // Darker orange border
                borderRadius: 15,
                padding: 15,
                iconSize: 60,
                titleFont: 'bold 24px Arial',
                textFont: '16px Arial',
                statFont: 'bold 18px Arial',
                buttonHeight: 40,
                buttonGap: 10, // Gap between BUY and MAX
                buyButton: { width: 100, bgColor: '#67C23A', hoverBgColor: '#5CB85C', textColor: 'white' },
                maxButton: { width: 100, bgColor: '#E6A23C', hoverBgColor: '#F59E0B', textColor: 'white' }
            },
            scrollbar: {
                width: 10,
                x: (canvas.width - 20 - 20) - 10, // Positioned to the very right of shop area
                color: '#C0C0C0',
                handleColor: '#808080'
            },
            itemGap: 15 // Gap between cards
        },
        colors: {
            canvasBackground: '#ffffff', // White background for the game area
            textDark: '#4A4A4A', // Dark grey for text
            textDarker: '#000000',
            gold: '#E6A23C', // Orange-yellow for gold text
            gps: '#28A745',   // Green for GPS text
        },
        fonts: {
            header: '24px Arial', // For top bar gold/GPS
        }
    };

    let buyButtonRects = []; // Will store { x, y, width, height, itemIndex, type: 'BUY'/'MAX' }
    let mainClickerRect = LAYOUT.mainClicker;
    let shopScrollY = 0;
    let totalShopContentHeight = 0;
    let lastUpdateTime = 0;
    let mouse = { x: 0, y: 0, down: false };

    // --- Utility Functions ---
    function formatNumber(num) { // Same as before
        if (num === null || num === undefined) return '0';
        if (num < 1000) {
            let fixed = num.toFixed(2);
            if (fixed.endsWith('.00')) return fixed.substring(0, fixed.length - 3);
            if (fixed.endsWith('0') && fixed.includes('.')) {
                let temp = fixed.substring(0, fixed.length - 1);
                if (temp.endsWith('.0')) return temp.substring(0, temp.length-2);
                return temp;
            }
            return fixed;
        }
        const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"];
        const i = Math.floor(Math.log10(Math.abs(num)) / 3);
        if (i >= suffixes.length) return num.toExponential(2);
        const scaledNum = num / Math.pow(1000, i);
        let precision = 2;
        if (scaledNum >= 100) precision = 0;
        else if (scaledNum >= 10) precision = 1;
        let sNum = scaledNum.toFixed(precision);
        if (precision > 0 && sNum.includes('.')) sNum = sNum.replace(/0+$/, '').replace(/\.$/, '');
        return sNum + suffixes[i];
    }

    function calculateCurrentCost(item) { // MODIFIED as per user request
        return item.baseCost * Math.pow(1.0, item.owned); // Effectively item.baseCost
    }

    function recalculateGPS() {
        goldPerSecond = equipment.reduce((totalGPS, item) => totalGPS + (item.production * item.owned), 0);
    }

    function loadItemImages() {
        equipment.forEach(item => {
            const img = new Image();
            itemImageLoaded[item.id] = false;
            img.onload = () => {
                itemImageLoaded[item.id] = true;
                itemImages[item.id] = img;
            };
            img.onerror = () => {
                console.warn(`Could not load image for ${item.id} at pics/items/${item.id}.png`);
                itemImageLoaded[item.id] = 'error'; // Mark as error to draw placeholder
            };
            img.src = `pics/items/${item.id}.png`;
        });
    }

    // --- Drawing Functions ---
    function drawRoundedRect(x, y, width, height, radius, fillColor, strokeColor) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function clearCanvas() {
        ctx.fillStyle = LAYOUT.colors.canvasBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawTopBar() { // Same as before
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, LAYOUT.topBarHeight);
        ctx.fillStyle = LAYOUT.colors.gold;
        ctx.font = LAYOUT.fonts.header;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Gold: ${formatNumber(gold)}`, LAYOUT.padding, LAYOUT.topBarHeight / 2);
        ctx.fillStyle = LAYOUT.colors.gps;
        ctx.textAlign = 'right';
        ctx.fillText(`GPS: ${formatNumber(goldPerSecond)}/s`, canvas.width - LAYOUT.padding, LAYOUT.topBarHeight / 2);
        ctx.textBaseline = 'alphabetic'; // Reset
    }

    function drawMainClicker(mouseX, mouseY) { // Same as before (using image)
        const { x, y, width, height } = LAYOUT.mainClicker;
        const isHovered = (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height);

        if (mainClickImageLoaded) {
            ctx.drawImage(mainClickImage, x, y, width, height);
            if (isHovered) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(x, y, width, height);
            }
        } else {
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.font = LAYOUT.fonts.item;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Loading Clicker...", x + width / 2, y + height / 2);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function drawShop(mouseX, mouseY) {
        const shop = LAYOUT.shop;
        const card = LAYOUT.shop.card;
        buyButtonRects = []; // Clear old button rects

        // Calculate total content height for scrolling
        totalShopContentHeight = equipment.length * (card.height + shop.itemGap) - shop.itemGap; // Remove last gap

        // Shop area clipping (to contain scrolling items)
        ctx.save();
        ctx.beginPath();
        ctx.rect(shop.x, shop.y, shop.width, shop.height);
        ctx.clip();

        // Current Y for drawing, considering scroll
        let currentY = shop.y - shopScrollY;

        for (let i = 0; i < equipment.length; i++) {
            const item = equipment[i];
            const itemCardY = currentY + i * (card.height + shop.itemGap);

            // Cull items not in view
            if (itemCardY + card.height < shop.y || itemCardY > shop.y + shop.height) {
                continue;
            }

            // Draw Card Background
            drawRoundedRect(shop.x + 5, itemCardY, card.width - 10, card.height, card.borderRadius, card.bgColor, card.borderColor);

            // --- Content within the card ---
            let textX = shop.x + 5 + card.padding;
            let textY = itemCardY + card.padding;

            // Icon
            const iconX = textX;
            const iconY = textY;
            if (itemImageLoaded[item.id] === true && itemImages[item.id]) {
                ctx.drawImage(itemImages[item.id], iconX, iconY, card.iconSize, card.iconSize);
            } else { // Placeholder
                ctx.fillStyle = '#DDD';
                ctx.fillRect(iconX, iconY, card.iconSize, card.iconSize);
                ctx.fillStyle = LAYOUT.colors.textDark;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("Icon", iconX + card.iconSize/2, iconY + card.iconSize/2);
                ctx.textAlign = 'left';
            }

            // Item Name (Title) - to the right of icon
            ctx.fillStyle = LAYOUT.colors.textDarker;
            ctx.font = card.titleFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const titleX = iconX + card.iconSize + 10;
            ctx.fillText(item.name, titleX, textY + 5); // Adjust Y for better alignment

            // Stats below title and icon area
            textY += card.iconSize + 10; // Move below icon area

            ctx.font = card.textFont;
            ctx.fillStyle = LAYOUT.colors.textDark;

            const cost = calculateCurrentCost(item);
            ctx.fillText(`Cost: `, textX, textY);
            ctx.fillStyle = LAYOUT.colors.gold; // Cost in gold color
            ctx.font = card.statFont;
            ctx.fillText(formatNumber(cost), textX + ctx.measureText("Cost: ").width + 5, textY);
            ctx.fillStyle = LAYOUT.colors.textDark; // Reset color
            ctx.font = card.textFont; // Reset font
            textY += 22;


            ctx.fillText(`Production/Sec: `, textX, textY);
            ctx.fillStyle = LAYOUT.colors.gps; // Prod in GPS color
            ctx.font = card.statFont;
            ctx.fillText(formatNumber(item.production), textX + ctx.measureText("Production/Sec: ").width + 5, textY);
            ctx.fillStyle = LAYOUT.colors.textDark; // Reset color
            ctx.font = card.textFont; // Reset font
            textY += 22;


            ctx.fillText(`Owned: `, textX, textY);
            ctx.font = card.statFont;
            ctx.fillText(String(item.owned), textX + ctx.measureText("Owned: ").width + 5, textY);
            ctx.font = card.textFont; // Reset font
            textY += 22;

            const totalItemGPS = item.production * item.owned;
            ctx.fillText(`Total Item GPS: `, textX, textY);
            ctx.fillStyle = LAYOUT.colors.gps; // GPS color
            ctx.font = card.statFont;
            ctx.fillText(formatNumber(totalItemGPS), textX + ctx.measureText("Total Item GPS: ").width + 5, textY);
            ctx.fillStyle = LAYOUT.colors.textDark; // Reset color
            ctx.font = card.textFont; // Reset font


            // Buttons at the bottom of the card
            const buttonY = itemCardY + card.height - card.padding - card.buttonHeight;
            const availableButtonWidth = card.width - 10 - card.padding * 2;
            const combinedButtonWidth = card.buyButton.width + card.maxButton.width + shop.card.buttonGap;
            const buttonStartX = shop.x + 5 + card.padding + (availableButtonWidth - combinedButtonWidth) / 2;


            // BUY Button
            const buyBtnX = buttonStartX;
            const buyBtnRect = { x: buyBtnX, y: buttonY, width: card.buyButton.width, height: card.buttonHeight, itemIndex: i, type: 'BUY' };
            buyButtonRects.push(buyBtnRect);
            let buyFill = (gold >= cost) ? card.buyButton.bgColor : LAYOUT.shop.buttonDisabledColor;
            if (gold >= cost && mouseX >= buyBtnX && mouseX <= buyBtnX + card.buyButton.width && mouseY >= buttonY && mouseY <= buttonY + card.buttonHeight) {
                buyFill = card.buyButton.hoverBgColor;
            }
            drawRoundedRect(buyBtnX, buttonY, card.buyButton.width, card.buttonHeight, 5, buyFill);
            ctx.fillStyle = card.buyButton.textColor;
            ctx.font = LAYOUT.fonts.button;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("BUY", buyBtnX + card.buyButton.width / 2, buttonY + card.buttonHeight / 2);

            // MAX Button
            const maxBtnX = buyBtnX + card.buyButton.width + shop.card.buttonGap;
            const maxBtnRect = { x: maxBtnX, y: buttonY, width: card.maxButton.width, height: card.buttonHeight, itemIndex: i, type: 'MAX' };
            buyButtonRects.push(maxBtnRect);
            let maxFill = (gold >= cost) ? card.maxButton.bgColor : LAYOUT.shop.buttonDisabledColor; // Can afford at least one
            if (gold >= cost && mouseX >= maxBtnX && mouseX <= maxBtnX + card.maxButton.width && mouseY >= buttonY && mouseY <= buttonY + card.buttonHeight) {
                maxFill = card.maxButton.hoverBgColor;
            }
            drawRoundedRect(maxBtnX, buttonY, card.maxButton.width, card.buttonHeight, 5, maxFill);
            ctx.fillStyle = card.maxButton.textColor;
            ctx.fillText("MAX", maxBtnX + card.maxButton.width / 2, buttonY + card.buttonHeight / 2);
        }
        ctx.restore(); // End clipping

        // Draw Scrollbar if needed
        if (totalShopContentHeight > shop.height) {
            const scrollbarHeight = shop.height * (shop.height / totalShopContentHeight);
            const scrollbarY = shop.y + (shopScrollY / totalShopContentHeight) * shop.height;
            ctx.fillStyle = shop.scrollbar.color;
            ctx.fillRect(shop.scrollbar.x, shop.y, shop.scrollbar.width, shop.height);
            ctx.fillStyle = shop.scrollbar.handleColor;
            ctx.fillRect(shop.scrollbar.x, scrollbarY, shop.scrollbar.width, scrollbarHeight);
        }
        ctx.textAlign = 'left'; // Reset
        ctx.textBaseline = 'alphabetic'; // Reset
    }

    // --- Game Logic and Interaction ---
    function handleManualClick() {
        gold += clickValue;
    }

    function buyEquipmentItem(itemIndex, buyMax = false) {
        if (itemIndex < 0 || itemIndex >= equipment.length) return;
        const item = equipment[itemIndex];
        const costPerUnit = calculateCurrentCost(item); // Cost is now fixed per unit

        if (costPerUnit <= 0) { // Avoid division by zero or infinite loops
            console.warn("Item cost is zero or negative, cannot buy max.", item);
            if (!buyMax && gold >= costPerUnit) { // Still allow single buy if free and affordable
                 // No gold change for free items
                item.owned++;
                recalculateGPS();
            }
            return;
        }
        
        let numToBuy = 0;
        if (buyMax) {
            if (gold >= costPerUnit) {
                numToBuy = Math.floor(gold / costPerUnit);
            }
        } else {
            if (gold >= costPerUnit) {
                numToBuy = 1;
            }
        }

        if (numToBuy > 0) {
            gold -= numToBuy * costPerUnit;
            item.owned += numToBuy;
            recalculateGPS();
        } else {
            if (!buyMax) console.log("Not enough gold for " + item.name);
        }
    }


    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', () => mouse.down = true);
    canvas.addEventListener('mouseup', () => mouse.down = false);
    canvas.addEventListener('mouseleave', () => mouse.down = false); // If mouse leaves canvas while down


    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Check main clicker
        if (clickX >= mainClickerRect.x && clickX <= mainClickerRect.x + mainClickerRect.width &&
            clickY >= mainClickerRect.y && clickY <= mainClickerRect.y + mainClickerRect.height) {
            if (mainClickImageLoaded) handleManualClick();
            return;
        }

        // Check shop buttons (need to account for scroll and clipping)
        if (clickX >= LAYOUT.shop.x && clickX <= LAYOUT.shop.x + LAYOUT.shop.width &&
            clickY >= LAYOUT.shop.y && clickY <= LAYOUT.shop.y + LAYOUT.shop.height) {
            for (const btn of buyButtonRects) {
                // Check if button is visible before processing click (simple check for now)
                 const itemCardY_actual = LAYOUT.shop.y - shopScrollY + btn.itemIndex * (LAYOUT.shop.card.height + LAYOUT.shop.itemGap);
                 const buttonY_actual = itemCardY_actual + (btn.y - (LAYOUT.shop.y - shopScrollY + btn.itemIndex * (LAYOUT.shop.card.height + LAYOUT.shop.itemGap) + LAYOUT.shop.card.padding)); // More complex Y due to relative pos

                // Simplified check: is the click Y within the visible button's Y on screen?
                // This needs to use the btn.y which is relative to the card's top when drawn,
                // and the card's top is (LAYOUT.shop.y - shopScrollY + offset).
                // For simplicity, we check the stored btn.y which is *already adjusted for scroll during its creation in drawShop*
                // BUT this is not true, btn.y is relative to card top.
                // The `buyButtonRects` store absolute canvas coordinates *as if shopScrollY was 0*.
                // We need to adjust the click for scroll OR adjust button rects for scroll.
                // Let's adjust click for scroll for hit testing.

                const adjustedClickY = clickY + shopScrollY; // Click position within the full scrollable content

                // The btn.y stored in buyButtonRects is the absolute Y on the canvas for that frame
                // So we should use the original clickY
                 if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                     clickY >= btn.y && clickY <= btn.y + btn.height) { // btn.y IS ALREADY SCROLL ADJUSTED because it's calculated each frame in drawShop

                    const item = equipment[btn.itemIndex];
                    const currentCost = calculateCurrentCost(item);
                    if (gold >= currentCost) { // Check affordability again
                        buyEquipmentItem(btn.itemIndex, btn.type === 'MAX');
                    }
                    return;
                }
            }
        }
    });

    canvas.addEventListener('wheel', (event) => {
        // Check if mouse is over the shop area
        if (mouse.x >= LAYOUT.shop.x && mouse.x <= LAYOUT.shop.x + LAYOUT.shop.width &&
            mouse.y >= LAYOUT.shop.y && mouse.y <= LAYOUT.shop.y + LAYOUT.shop.height) {
            event.preventDefault(); // Prevent page scrolling

            shopScrollY += event.deltaY * 0.5; // Adjust scroll speed

            // Clamp scrollY
            const maxScrollY = Math.max(0, totalShopContentHeight - LAYOUT.shop.height);
            if (shopScrollY < 0) shopScrollY = 0;
            if (shopScrollY > maxScrollY) shopScrollY = maxScrollY;
        }
    });


    // --- Game Loop ---
    function update(deltaTime) {
        if (deltaTime > 0.1) deltaTime = 0.1;
        gold += goldPerSecond * deltaTime;
    }

    function draw() {
        clearCanvas();
        drawTopBar();
        drawMainClicker(mouse.x, mouse.y);
        drawShop(mouse.x, mouse.y);
    }

    let gameLoopStarted = false;
    function gameLoop(timestamp) {
        if (!gameLoopStarted) {
            lastUpdateTime = timestamp;
            gameLoopStarted = true;
        }
        const deltaTime = (timestamp - lastUpdateTime) / 1000;
        lastUpdateTime = timestamp;

        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    // --- Initialization ---
    function init() {
        recalculateGPS();
        loadItemImages(); // Start loading item icons

        mainClickImage.onload = () => {
            console.log("Main clicker image loaded.");
            mainClickImageLoaded = true;
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.onerror = () => {
            console.error("Error loading image: pics/manual/Main_click.png. Using placeholder.");
            mainClickImageLoaded = false;
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.src = 'pics/manual/Main_click.png';

        // If mainClickImage loading is very fast, gameLoop might start before this.
        // Ensure gameLoop only starts once (or relies on mainClickImageLoaded for drawing)
        // The current setup starts the loop in mainClickImage.onload/onerror.
    }

    init();
});
