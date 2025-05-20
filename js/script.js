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
    let gold = 10000; // Start with some gold for testing
    let goldPerSecond = 0;
    const clickValue = 1;

    const mainClickImage = new Image();
    let mainClickImageLoaded = false;
    const itemImages = {};
    const itemImageLoaded = {};

    const equipment = [
        // Using IDs that can be used for image filenames (e.g., safety_glasses.png)
        { id: "safety_glasses", name: "Safety Glasses", description: "Protects eyes from debris during basic tasks.", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", description: "Provides hand protection for manual labor.", baseCost: 150.00, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", description: "A basic tool for driving nails or shaping materials.", baseCost: 750.00, production: 7.80, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", description: "Used for inserting and removing screws.", baseCost: 3750.00, production: 39.80, owned: 0 },
        { id: "pliers", name: "Pliers", description: "Grips and manipulates small objects and wires.", baseCost: 18750.00, production: 202.96, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", description: "Tightens and loosens nuts and bolts.", baseCost: 93750.00, production: 1035.08, owned: 0 },
        { id: "utility_knife", name: "Utility Knife", description: "Cuts various thin materials precisely.", baseCost: 468750.00, production: 5278.89, owned: 0 },
        { id: "measuring_tape", name: "Measuring Tape", description: "Ensures accurate measurements for fabrication.", baseCost: 2343750.00, production: 26922.32, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", description: "Manually cuts wood or other soft materials.", baseCost: 11718750.00, production: 137303.83, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", description: "Shapes or carves wood and metal by hand.", baseCost: 58593750.00, production: 700249.55, owned: 0 },
        { id: "file_set", name: "File Set", description: "Smooths and shapes metal or wood surfaces.", baseCost: 292968750.00, production: 3571272.71, owned: 0 },
        // Add more items if you have them
    ];

    const LAYOUT = {
        padding: 20,
        topBarHeight: 60,
        mainClicker: { x: 20, y: 80, width: 200, height: 150 },
        shop: {
            x: 250,
            y: 80,
            width: canvas.width - 250 - 20 - 20, // Padded width
            height: canvas.height - 80 - 20,
            card: {
                width: (canvas.width - 250 - 20 - 20) - 25, // Shop width - scrollbar - padding
                height: 190, // Increased height for better spacing
                bgColor: '#FFF8E1', // Lighter, creamy yellow
                borderColor: '#F57F17', // Stronger orange border
                borderWidth: 3,
                borderRadius: 12,
                padding: 15,
                iconSize: 55,
                iconBgColor: '#E0E0E0',
                iconBorderColor: '#BDBDBD',
                titleFont: 'bold 22px Verdana, sans-serif',
                statLabelFont: '15px Verdana, sans-serif',
                statValueFont: 'bold 17px Verdana, sans-serif',
                buttonHeight: 38,
                buttonGap: 10,
                buttonBorderRadius: 8,
                buttonFont: 'bold 16px Verdana, sans-serif',
                buyButton: { width: 100, bgColor: '#4CAF50', hoverBgColor: '#66BB6A', disabledBgColor: '#BDBDBD', textColor: '#FFFFFF' },
                maxButton: { width: 100, bgColor: '#FF9800', hoverBgColor: '#FFA726', disabledBgColor: '#BDBDBD', textColor: '#FFFFFF' }
            },
            scrollbar: {
                width: 12,
                x: (canvas.width - 20 - 12 - 5), // Positioned to the very right of shop area accounting for its own width and a small gap
                color: '#E0E0E0', // Lighter track
                handleColor: '#9E9E9E', // Darker handle
                handleBorderRadius: 6,
            },
            itemGap: 15
        },
        colors: {
            canvasBackground: '#ECEFF1', // Light bluish grey background
            topBarBg: '#37474F', // Dark slate grey for top bar
            textDark: '#333333',
            textLight: '#FFFFFF', // For text on dark backgrounds like top bar / buttons
            gold: '#FFC107', // Brighter gold
            gps: '#8BC34A',   // Brighter green
            iconPlaceholderText: '#757575',
        },
        fonts: {
            header: 'bold 22px Verdana, sans-serif',
        }
    };

    let buyButtonRects = [];
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

    function calculateCurrentCost(item) { // Cost does not increase
        return item.baseCost * Math.pow(1.0, item.owned);
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
                itemImageLoaded[item.id] = 'error';
            };
            img.src = `pics/items/${item.id}.png`;
        });
    }

    // --- Drawing Functions ---
    function drawRoundedRect(x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 2) {
        // Ensure radius is not too large for the dimensions
        if (typeof radius === 'object') { // Allow different radii for each corner
            // Not implemented here for simplicity, using a single radius
            radius = radius.tl || radius;
        }
        radius = Math.min(radius, width / 2, height / 2);


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
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
    }

    function clearCanvas() {
        ctx.fillStyle = LAYOUT.colors.canvasBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawTopBar() {
        ctx.fillStyle = LAYOUT.colors.topBarBg;
        ctx.fillRect(0, 0, canvas.width, LAYOUT.topBarHeight);
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillRect(0, 0, canvas.width, LAYOUT.topBarHeight);
        ctx.shadowColor = 'transparent'; // Reset shadow

        ctx.fillStyle = LAYOUT.colors.gold;
        ctx.font = LAYOUT.fonts.header;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Gold: ${formatNumber(gold)}`, LAYOUT.padding, LAYOUT.topBarHeight / 2);

        ctx.fillStyle = LAYOUT.colors.gps;
        ctx.textAlign = 'right';
        ctx.fillText(`GPS: ${formatNumber(goldPerSecond)}/s`, canvas.width - LAYOUT.padding, LAYOUT.topBarHeight / 2);
        ctx.textBaseline = 'alphabetic';
    }

    function drawMainClicker(mouseX, mouseY) {
        const { x, y, width, height } = LAYOUT.mainClicker;
        const isHovered = (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height);

        if (mainClickImageLoaded) {
            ctx.save();
            if (isHovered && mouse.down) {
                ctx.translate(x + width / 2, y + height / 2);
                ctx.scale(0.95, 0.95); // Click effect: slightly shrink
                ctx.translate(-(x + width / 2), -(y + height / 2));
            } else if (isHovered) {
                ctx.shadowColor = 'rgba(255,215,0,0.7)'; // Gold glow on hover
                ctx.shadowBlur = 15;
            }
            ctx.drawImage(mainClickImage, x, y, width, height);
            ctx.restore();
            ctx.shadowColor = 'transparent'; // Reset shadow
        } else {
            drawRoundedRect(x, y, width, height, 10, '#B0BEC5', '#78909C');
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.font = 'bold 18px Verdana, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Loading...", x + width / 2, y + height / 2);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function drawShop(mouseX, mouseY) {
        const shop = LAYOUT.shop;
        const cardLayout = LAYOUT.shop.card;
        buyButtonRects = [];

        totalShopContentHeight = equipment.length * (cardLayout.height + shop.itemGap) - shop.itemGap;
        if (totalShopContentHeight < shop.height) totalShopContentHeight = shop.height; // Ensure content height is at least view height

        ctx.save();
        ctx.beginPath();
        ctx.rect(shop.x, shop.y, shop.width, shop.height); // Define clipping region for shop content
        ctx.clip();

        let currentCardY = shop.y - shopScrollY;

        for (let i = 0; i < equipment.length; i++) {
            const item = equipment[i];
            const cardX = shop.x + (shop.width - cardLayout.width - shop.scrollbar.width) / 2; // Center card horizontally
            const cardY = currentCardY + i * (cardLayout.height + shop.itemGap);

            if (cardY + cardLayout.height < shop.y || cardY > shop.y + shop.height) {
                continue; // Cull items not in view
            }

            // Draw Card
            drawRoundedRect(cardX, cardY, cardLayout.width, cardLayout.height, cardLayout.borderRadius, cardLayout.bgColor, cardLayout.borderColor, cardLayout.borderWidth);

            // --- Card Content ---
            let contentX = cardX + cardLayout.padding;
            let contentY = cardY + cardLayout.padding;

            // Icon
            const iconX = contentX;
            const iconY = contentY;
            if (itemImageLoaded[item.id] === true && itemImages[item.id]) {
                ctx.drawImage(itemImages[item.id], iconX, iconY, cardLayout.iconSize, cardLayout.iconSize);
            } else {
                drawRoundedRect(iconX, iconY, cardLayout.iconSize, cardLayout.iconSize, 5, cardLayout.iconBgColor, cardLayout.iconBorderColor);
                ctx.fillStyle = LAYOUT.colors.iconPlaceholderText;
                ctx.font = 'bold 12px Verdana, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("?", iconX + cardLayout.iconSize / 2, iconY + cardLayout.iconSize / 2);
            }

            // Item Title
            ctx.fillStyle = LAYOUT.colors.textDarker;
            ctx.font = cardLayout.titleFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const titleX = iconX + cardLayout.iconSize + 15;
            const titleMaxWidth = cardLayout.width - cardLayout.padding * 2 - cardLayout.iconSize - 15;
            ctx.fillText(item.name, titleX, iconY + 5, titleMaxWidth); // +5 to align with icon center a bit

            // Stats Area (below icon/title)
            let statsY = iconY + cardLayout.iconSize + 12; // Start stats below icon area
            const statsX = contentX; // Align stats with icon left edge

            // Cost
            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.fillText("Cost:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gold;
            const cost = calculateCurrentCost(item);
            ctx.fillText(formatNumber(cost), statsX + 55, statsY); // Fixed offset for value
            statsY += 20;

            // Production/Sec
            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.fillText("Prod/Sec:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gps;
            ctx.fillText(formatNumber(item.production), statsX + 85, statsY);
            statsY += 20;

            // Owned
            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.fillText("Owned:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.textDarker;
            ctx.fillText(String(item.owned), statsX + 65, statsY);
            statsY += 20;

            // Total Item GPS
            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.fillText("Total GPS:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gps;
            ctx.fillText(formatNumber(item.production * item.owned), statsX + 85, statsY);


            // Buttons
            const buttonAreaY = cardY + cardLayout.height - cardLayout.padding - cardLayout.buttonHeight;
            const totalButtonWidth = cardLayout.buyButton.width + cardLayout.maxButton.width + cardLayout.buttonGap;
            const buttonsStartX = cardX + (cardLayout.width - totalButtonWidth) / 2; // Center buttons

            // BUY Button
            const buyBtnX = buttonsStartX;
            const canAfford = gold >= cost;
            const buyHover = canAfford && mouseX >= buyBtnX && mouseX <= buyBtnX + cardLayout.buyButton.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight;
            let buyFill = canAfford ? (buyHover ? cardLayout.buyButton.hoverBgColor : cardLayout.buyButton.bgColor) : cardLayout.buyButton.disabledBgColor;
            drawRoundedRect(buyBtnX, buttonAreaY, cardLayout.buyButton.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, buyFill);
            ctx.fillStyle = cardLayout.buyButton.textColor;
            ctx.font = cardLayout.buttonFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("BUY", buyBtnX + cardLayout.buyButton.width / 2, buttonAreaY + cardLayout.buttonHeight / 2);
            buyButtonRects.push({ x: buyBtnX, y: buttonAreaY, width: cardLayout.buyButton.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'BUY', enabled: canAfford });


            // MAX Button
            const maxBtnX = buyBtnX + cardLayout.buyButton.width + cardLayout.buttonGap;
            const maxHover = canAfford && mouseX >= maxBtnX && mouseX <= maxBtnX + cardLayout.maxButton.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight;
            let maxFill = canAfford ? (maxHover ? cardLayout.maxButton.hoverBgColor : cardLayout.maxButton.bgColor) : cardLayout.maxButton.disabledBgColor;
            drawRoundedRect(maxBtnX, buttonAreaY, cardLayout.maxButton.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, maxFill);
            ctx.fillStyle = cardLayout.maxButton.textColor;
            ctx.fillText("MAX", maxBtnX + cardLayout.maxButton.width / 2, buttonAreaY + cardLayout.buttonHeight / 2);
            buyButtonRects.push({ x: maxBtnX, y: buttonAreaY, width: cardLayout.maxButton.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'MAX', enabled: canAfford });

        }
        ctx.restore(); // End clipping

        // Draw Scrollbar
        if (totalShopContentHeight > shop.height) {
            const scrollbarTrackHeight = shop.height;
            const scrollbarHandleHeight = Math.max(20, scrollbarTrackHeight * (shop.height / totalShopContentHeight)); // Min handle height
            const scrollbarHandleY = shop.y + (shopScrollY / (totalShopContentHeight - shop.height)) * (scrollbarTrackHeight - scrollbarHandleHeight);

            drawRoundedRect(shop.scrollbar.x, shop.y, shop.scrollbar.width, scrollbarTrackHeight, shop.scrollbar.handleBorderRadius, shop.scrollbar.color); // Track
            drawRoundedRect(shop.scrollbar.x, Math.max(shop.y, scrollbarHandleY), shop.scrollbar.width, scrollbarHandleHeight, shop.scrollbar.handleBorderRadius, shop.scrollbar.handleColor); // Handle
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // --- Game Logic and Interaction ---
    function handleManualClick() { gold += clickValue; }

    function buyEquipmentItem(itemIndex, buyMax = false) {
        if (itemIndex < 0 || itemIndex >= equipment.length) return;
        const item = equipment[itemIndex];
        const costPerUnit = calculateCurrentCost(item);
        if (costPerUnit <= 0 && buyMax) { // Avoid issues with free items and MAX
            console.warn("Cannot MAX buy free items.");
            if (gold >= costPerUnit && !buyMax){ item.owned++; recalculateGPS(); } // Allow single "buy" of free
            return;
        }
        let numToBuy = 0;
        if (buyMax) {
            if (gold >= costPerUnit) numToBuy = Math.floor(gold / costPerUnit);
        } else {
            if (gold >= costPerUnit) numToBuy = 1;
        }
        if (numToBuy > 0) {
            gold -= numToBuy * costPerUnit;
            item.owned += numToBuy;
            recalculateGPS();
        }
    }

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', () => mouse.down = true);
    canvas.addEventListener('mouseup', () => mouse.down = false);
    canvas.addEventListener('mouseleave', () => mouse.down = false);

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (clickX >= mainClickerRect.x && clickX <= mainClickerRect.x + mainClickerRect.width &&
            clickY >= mainClickerRect.y && clickY <= mainClickerRect.y + mainClickerRect.height) {
            if (mainClickImageLoaded) handleManualClick();
            return;
        }

        // Check shop buttons (these rects are absolute canvas positions from last draw)
        for (const btn of buyButtonRects) {
            if (btn.enabled && clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                buyEquipmentItem(btn.itemIndex, btn.type === 'MAX');
                return;
            }
        }
    });

    canvas.addEventListener('wheel', (event) => {
        if (mouse.x >= LAYOUT.shop.x && mouse.x <= LAYOUT.shop.x + LAYOUT.shop.width + LAYOUT.shop.scrollbar.width && // Include scrollbar width for wheel event
            mouse.y >= LAYOUT.shop.y && mouse.y <= LAYOUT.shop.y + LAYOUT.shop.height) {
            event.preventDefault();
            shopScrollY += event.deltaY * 0.3; // Slower scroll speed
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
        loadItemImages();
        mainClickImage.onload = () => {
            mainClickImageLoaded = true;
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.onerror = () => {
            mainClickImageLoaded = false;
            if (!gameLoopStarted) requestAnimationFrame(gameLoop);
        };
        mainClickImage.src = 'pics/manual/Main_click.png';
    }
    init();
});
