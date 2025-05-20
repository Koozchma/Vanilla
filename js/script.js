// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error("FATAL ERROR: Canvas element with ID 'gameCanvas' was not found.");
        alert("FATAL ERROR: Canvas not found. Check index.html.");
        return;
    }

    const ctx = canvas.getContext('2d');

    let gold = 100000;
    let goldPerSecond = 0;
    const clickValue = 1;

    const mainClickImage = new Image();
    let mainClickImageLoaded = false;
    const itemImages = {};
    const itemImageLoaded = {};

    const equipment = [ // Shortened for brevity, use your full list
        { id: "safety_glasses", name: "Safety Glasses", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", baseCost: 150.00, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", baseCost: 750.00, production: 7.80, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", baseCost: 3750.00, production: 39.80, owned: 0 },
        { id: "pliers", name: "Pliers", baseCost: 18750.00, production: 202.96, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", baseCost: 93750.00, production: 1035.08, owned: 0 },
        { id: "utility_knife", name: "Utility Knife", baseCost: 468750.00, production: 5278.89, owned: 0 },
        { id: "measuring_tape", name: "Measuring Tape", baseCost: 2343750.00, production: 26922.32, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", baseCost: 11718750.00, production: 137303.83, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", baseCost: 58593750.00, production: 700249.55, owned: 0 },
        { id: "file_set", name: "File Set", baseCost: 292968750.00, production: 3571272.71, owned: 0 },
    ];

    const LAYOUT = {
        padding: 25, // Increased padding
        topBarHeight: 65,
        mainClicker: { x: 25, y: 90, width: 200, height: 150, hoverGlowColor: 'rgba(0, 255, 255, 0.8)', clickPulseColor: 'rgba(0, 255, 255, 0.5)' },
        shop: {
            x: 260, // Increased gap
            y: 90,
            width: canvas.width - 260 - 25 - 25, // Adjusted for new padding
            height: canvas.height - 90 - 25,
            card: {
                width: (canvas.width - 260 - 25 - 25) - 30, // Shop width - scrollbar - padding
                height: 210,
                bgColor: 'rgba(10, 20, 50, 0.8)', // Darker, more saturated blue
                borderColor: '#00FFFF', // Cyan
                borderWidth: 1.5,
                borderRadius: 6, // Sharper
                padding: 20, // More internal padding
                iconSize: 60,
                iconBgColor: 'rgba(0, 255, 255, 0.05)',
                iconBorderColor: '#00FFFF',
                iconPlaceholderSymbol: '◈', // Techy symbol
                titleFont: 'bold 22px "Exo 2", Verdana, sans-serif',
                statLabelFont: '14px "Exo 2", Verdana, sans-serif',
                statValueFont: 'bold 17px "Exo 2", Verdana, sans-serif',
                buttonHeight: 40,
                buttonGap: 12,
                buttonBorderRadius: 4,
                buttonFont: 'bold 15px "Exo 2", Verdana, sans-serif',
                buyButton: { width: 110, bgColor: 'rgba(0, 200, 255, 0.7)', hoverBgColor: 'rgba(0, 230, 255, 1)', disabledBgColor: 'rgba(50, 60, 80, 0.7)', textColor: '#FFFFFF', borderColor: '#00FFFF', glowColor: 'rgba(0,255,255,0.7)' },
                maxButton: { width: 110, bgColor: 'rgba(0, 255, 150, 0.7)', hoverBgColor: 'rgba(0, 255, 180, 1)', disabledBgColor: 'rgba(50, 60, 80, 0.7)', textColor: '#FFFFFF', borderColor: '#39FF14', glowColor: 'rgba(57,255,20,0.7)' }
            },
            scrollbar: {
                width: 14,
                x: (canvas.width - 25 - 14 - 5),
                color: 'rgba(0, 0, 0, 0.4)',
                handleColor: '#00A8FF',
                handleHoverColor: '#00FFFF',
                handleBorderRadius: 4,
            },
            itemGap: 20 // Increased gap
        },
        colors: {
            canvasBgGradient: [ // For createLinearGradient
                { stop: 0, color: '#0A0A2A' },
                { stop: 1, color: '#14143F' }
            ],
            topBarBg: 'rgba(0, 0, 0, 0.0)', // Make top bar transparent, rely on canvas bg
            topBarSeparatorColor: 'rgba(0, 255, 255, 0.5)', // Cyan line separator
            textLight: '#F0F8FF', // AliceBlue - very light for high contrast
            gold: '#FFD700',
            gps: '#39FF14', // Neon Green
            iconPlaceholderText: '#00FFFF', // Cyan for placeholder symbol
            statLabelColor: '#B0C4DE', // LightSteelBlue
        },
        fonts: {
            header: 'bold 24px "Exo 2", Verdana, sans-serif',
        }
    };

    let buyButtonRects = [];
    let mainClickerRect = LAYOUT.mainClicker;
    let shopScrollY = 0;
    let totalShopContentHeight = 0;
    let lastUpdateTime = 0;
    let mouse = { x: 0, y: 0, down: false };
    let scrollbarHover = false;

    // --- Utility Functions --- (formatNumber, calculateCurrentCost, recalculateGPS - unchanged)
    function formatNumber(num) { if (num === null || num === undefined) return '0'; if (num < 1000) { let fixed = num.toFixed(2); if (fixed.endsWith('.00')) return fixed.substring(0, fixed.length - 3); if (fixed.endsWith('0') && fixed.includes('.')) { let temp = fixed.substring(0, fixed.length - 1); if (temp.endsWith('.0')) return temp.substring(0, temp.length-2); return temp; } return fixed; } const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"]; const i = Math.floor(Math.log10(Math.abs(num)) / 3); if (i >= suffixes.length) return num.toExponential(2); const scaledNum = num / Math.pow(1000, i); let precision = 2; if (scaledNum >= 100) precision = 0; else if (scaledNum >= 10) precision = 1; let sNum = scaledNum.toFixed(precision); if (precision > 0 && sNum.includes('.')) sNum = sNum.replace(/0+$/, '').replace(/\.$/, ''); return sNum + suffixes[i]; }
    function calculateCurrentCost(item) { return item.baseCost * Math.pow(1.0, item.owned); }
    function recalculateGPS() { goldPerSecond = equipment.reduce((totalGPS, item) => totalGPS + (item.production * item.owned), 0); }
    function loadItemImages() { equipment.forEach(item => { const img = new Image(); itemImageLoaded[item.id] = false; img.onload = () => { itemImageLoaded[item.id] = true; itemImages[item.id] = img; }; img.onerror = () => { itemImageLoaded[item.id] = 'error'; }; img.src = `pics/items/${item.id}.png`; }); }


    // --- Drawing Functions ---
    function drawTechRect(x, y, width, height, radius, fillColor, borderColor, borderWidth = 1, shadowColor, shadowBlur, inset) {
        ctx.save();
        if (shadowColor && shadowBlur && !inset) { // Outer shadow
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        ctx.beginPath();
        ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y);
        if (radius > 0) ctx.arcTo(x + width, y, x + width, y + radius, radius); else ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height - radius);
        if (radius > 0) ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); else ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + radius, y + height);
        if (radius > 0) ctx.arcTo(x, y + height, x, y + height - radius, radius); else ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        if (radius > 0) ctx.arcTo(x, y, x + radius, y, radius); else ctx.lineTo(x,y);
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        ctx.restore(); // Restore before stroke / inset shadow

        if (inset && shadowColor && shadowBlur) { // Inner shadow - draw after fill
            ctx.save();
            ctx.clip(); // Clip to the rect path
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            // Offset shadow inwards:
            ctx.shadowOffsetX = (width + shadowBlur*2); // move shadow far right
            ctx.fillRect(x - (width + shadowBlur*2), y - shadowBlur, width + shadowBlur*2, height + shadowBlur*2); // draw offset rect
            ctx.restore();
        }


        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            // Re-draw path for stroke to be clean, no shadow on stroke from fill
            ctx.beginPath();
            ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y);
            if (radius > 0) ctx.arcTo(x + width, y, x + width, y + radius, radius); else ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height - radius);
            if (radius > 0) ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); else ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + radius, y + height);
            if (radius > 0) ctx.arcTo(x, y + height, x, y + height - radius, radius); else ctx.lineTo(x, y + height);
            ctx.lineTo(x, y + radius);
            if (radius > 0) ctx.arcTo(x, y, x + radius, y, radius); else ctx.lineTo(x,y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function clearCanvas() {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        LAYOUT.colors.canvasBgGradient.forEach(stop => grad.addColorStop(stop.stop, stop.color));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Optional: Add subtle grid lines or tech pattern to background
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'; // Faint cyan lines
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let i = 0; i < canvas.height; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    }

    function drawTopBar() {
        // Transparent top bar, rely on canvas background. Add a separator line.
        ctx.beginPath();
        ctx.moveTo(0, LAYOUT.topBarHeight);
        ctx.lineTo(canvas.width, LAYOUT.topBarHeight);
        ctx.strokeStyle = LAYOUT.colors.topBarSeparatorColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowColor = 'transparent';


        ctx.fillStyle = LAYOUT.colors.gold;
        ctx.font = LAYOUT.fonts.header;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,215,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(`Gold: ${formatNumber(gold)}`, LAYOUT.padding, LAYOUT.topBarHeight / 2);

        ctx.fillStyle = LAYOUT.colors.gps;
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(57,255,20,0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(`GPS: ${formatNumber(goldPerSecond)}/s`, canvas.width - LAYOUT.padding, LAYOUT.topBarHeight / 2);
        
        ctx.shadowColor = 'transparent';
        ctx.textBaseline = 'alphabetic';
    }

    function drawMainClicker(mouseX, mouseY) {
        const { x, y, width, height, hoverGlowColor, clickPulseColor } = LAYOUT.mainClicker;
        const isHovered = (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height);

        if (mainClickImageLoaded) {
            ctx.save();
            if (isHovered) {
                ctx.shadowColor = hoverGlowColor;
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                if (mouse.down) {
                    ctx.shadowColor = clickPulseColor; // Brighter pulse on click
                    ctx.shadowBlur = 30;
                    ctx.translate(x + width / 2, y + height / 2);
                    ctx.scale(0.96, 0.96);
                    ctx.translate(-(x + width / 2), -(y + height / 2));
                }
            }
            ctx.drawImage(mainClickImage, x, y, width, height);
            ctx.restore();
        } else {
            drawTechRect(x, y, width, height, 5, 'rgba(70,70,90,0.7)', '#00A8FF', 2);
            ctx.fillStyle = LAYOUT.colors.textLight;
            ctx.font = 'bold 18px "Exo 2", Verdana, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("LOADING...", x + width / 2, y + height / 2);
        }
        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function drawShop(mouseX, mouseY) {
        const shop = LAYOUT.shop;
        const cardLayout = LAYOUT.shop.card;
        buyButtonRects = [];

        totalShopContentHeight = equipment.length * (cardLayout.height + shop.itemGap) - shop.itemGap;
        if (totalShopContentHeight < shop.height) totalShopContentHeight = shop.height;

        ctx.save();
        ctx.beginPath();
        ctx.rect(shop.x, shop.y, shop.width, shop.height);
        ctx.clip();

        let currentCardY = shop.y - shopScrollY;

        for (let i = 0; i < equipment.length; i++) {
            const item = equipment[i];
            const cardX = shop.x + (shop.width - cardLayout.width - shop.scrollbar.width) / 2;
            const cardY = currentCardY + i * (cardLayout.height + shop.itemGap);

            if (cardY + cardLayout.height < shop.y - 20 || cardY > shop.y + shop.height + 20) { // Cull with margin
                continue;
            }

            drawTechRect(cardX, cardY, cardLayout.width, cardLayout.height, cardLayout.borderRadius, cardLayout.bgColor, cardLayout.borderColor, cardLayout.borderWidth, 'rgba(0,255,255,0.15)', 15);

            let contentX = cardX + cardLayout.padding;
            let contentY = cardY + cardLayout.padding;

            const iconX = contentX;
            const iconY = contentY;
            drawTechRect(iconX, iconY, cardLayout.iconSize, cardLayout.iconSize, 4, cardLayout.iconBgColor, cardLayout.iconBorderColor, 1);
            if (itemImageLoaded[item.id] === true && itemImages[item.id]) {
                ctx.drawImage(itemImages[item.id], iconX + 2, iconY + 2, cardLayout.iconSize - 4, cardLayout.iconSize - 4); // Padded image
            } else {
                ctx.fillStyle = LAYOUT.colors.iconPlaceholderText;
                ctx.font = `bold ${cardLayout.iconSize * 0.5}px "Exo 2", Verdana, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cardLayout.iconPlaceholderSymbol, iconX + cardLayout.iconSize / 2, iconY + cardLayout.iconSize / 2);
            }

            ctx.fillStyle = LAYOUT.colors.textLight;
            ctx.font = cardLayout.titleFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const titleX = iconX + cardLayout.iconSize + 15;
            const titleMaxWidth = cardLayout.width - cardLayout.padding * 2 - cardLayout.iconSize - 20;
            ctx.fillText(item.name, titleX, iconY + (cardLayout.iconSize - ctx.measureText('M').width) / 2 - 5, titleMaxWidth); // Vertically align title better


            let statsY = cardY + cardLayout.padding + cardLayout.iconSize + 20; // Below icon
            const statsX = contentX;
            const valueOffsetX = 115; // Adjusted for new font/layout
            const statLineHeight = 25;


            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.statLabelColor;
            ctx.fillText("Cost:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gold;
            const cost = calculateCurrentCost(item);
            ctx.fillText(formatNumber(cost), statsX + valueOffsetX, statsY);
            statsY += statLineHeight;

            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.statLabelColor;
            ctx.fillText("Prod/Sec:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gps;
            ctx.fillText(formatNumber(item.production), statsX + valueOffsetX, statsY);
            statsY += statLineHeight;

            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.statLabelColor;
            ctx.fillText("Owned:", statsX, statsY);
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.textLight;
            ctx.fillText(String(item.owned), statsX + valueOffsetX, statsY);
            statsY += statLineHeight;

            ctx.font = cardLayout.statLabelFont;
            ctx.fillStyle = LAYOUT.colors.statLabelColor;
            ctx.fillText("Item GPS:", statsX, statsY); // Renamed for clarity
            ctx.font = cardLayout.statValueFont;
            ctx.fillStyle = LAYOUT.colors.gps;
            ctx.fillText(formatNumber(item.production * item.owned), statsX + valueOffsetX, statsY);

            const buttonAreaY = cardY + cardLayout.height - cardLayout.padding - cardLayout.buttonHeight;
            const totalButtonWidth = cardLayout.buyButton.width + cardLayout.maxButton.width + cardLayout.buttonGap;
            const buttonsStartX = cardX + (cardLayout.width - totalButtonWidth) / 2;

            const canAfford = gold >= cost;
            // BUY Button
            const buyBtnX = buttonsStartX;
            const buyBtnStyle = cardLayout.buyButton;
            const buyHover = canAfford && mouseX >= buyBtnX && mouseX <= buyBtnX + buyBtnStyle.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight;
            let buyFill = canAfford ? (buyHover ? buyBtnStyle.hoverBgColor : buyBtnStyle.bgColor) : buyBtnStyle.disabledBgColor;
            drawTechRect(buyBtnX, buttonAreaY, buyBtnStyle.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, buyFill, buyBtnStyle.borderColor, 1.5, buyHover && canAfford ? buyBtnStyle.glowColor : null, 15);
            ctx.fillStyle = buyBtnStyle.textColor;
            ctx.font = cardLayout.buttonFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = buyHover ? 2 : 0; ctx.shadowOffsetX = buyHover ? 1 : 0; ctx.shadowOffsetY = buyHover ? 1 : 0; // Text shadow for buttons
            ctx.fillText("BUY", buyBtnX + buyBtnStyle.width / 2, buttonAreaY + cardLayout.buttonHeight / 2);
            ctx.shadowColor = 'transparent'; // Reset
            buyButtonRects.push({ x: buyBtnX, y: buttonAreaY, width: buyBtnStyle.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'BUY', enabled: canAfford });

            // MAX Button
            const maxBtnX = buyBtnX + buyBtnStyle.width + cardLayout.buttonGap;
            const maxBtnStyle = cardLayout.maxButton;
            const maxHover = canAfford && mouseX >= maxBtnX && mouseX <= maxBtnX + maxBtnStyle.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight;
            let maxFill = canAfford ? (maxHover ? maxBtnStyle.hoverBgColor : maxBtnStyle.bgColor) : maxBtnStyle.disabledBgColor;
            drawTechRect(maxBtnX, buttonAreaY, maxBtnStyle.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, maxFill, maxBtnStyle.borderColor, 1.5, maxHover && canAfford ? maxBtnStyle.glowColor : null, 15);
            ctx.fillStyle = maxBtnStyle.textColor;
            ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = maxHover ? 2 : 0; ctx.shadowOffsetX = maxHover ? 1 : 0; ctx.shadowOffsetY = maxHover ? 1 : 0; // Text shadow
            ctx.fillText("MAX", maxBtnX + maxBtnStyle.width / 2, buttonAreaY + cardLayout.buttonHeight / 2);
            ctx.shadowColor = 'transparent'; // Reset
            buyButtonRects.push({ x: maxBtnX, y: buttonAreaY, width: maxBtnStyle.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'MAX', enabled: canAfford });
        }
        ctx.restore(); // End clipping

        if (totalShopContentHeight > shop.height) {
            scrollbarHover = mouseX >= shop.scrollbar.x && mouseX <= shop.scrollbar.x + shop.scrollbar.width && mouseY >= shop.y && mouseY <= shop.y + shop.height;
            const scrollbarTrackHeight = shop.height;
            const scrollbarHandleHeight = Math.max(30, scrollbarTrackHeight * (shop.height / totalShopContentHeight));
            const scrollbarHandleY = shop.y + (shopScrollY / Math.max(1, totalShopContentHeight - shop.height)) * (scrollbarTrackHeight - scrollbarHandleHeight);
            drawTechRect(shop.scrollbar.x, shop.y, shop.scrollbar.width, scrollbarTrackHeight, shop.scrollbar.handleBorderRadius, shop.scrollbar.color, 'rgba(0,0,0,0.3)', 1);
            drawTechRect(shop.scrollbar.x, Math.max(shop.y, Math.min(scrollbarHandleY, shop.y + shop.height - scrollbarHandleHeight)), shop.scrollbar.width, scrollbarHandleHeight, shop.scrollbar.handleBorderRadius, scrollbarHover ? shop.scrollbar.handleHoverColor : shop.scrollbar.handleColor, 'rgba(0,0,0,0.5)', 1);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // --- Game Logic and Interaction --- (buyEquipmentItem, mouse listeners, wheel listener - largely unchanged)
    function handleManualClick() { gold += clickValue; }
    function buyEquipmentItem(itemIndex, buyMax = false) { if (itemIndex < 0 || itemIndex >= equipment.length) return; const item = equipment[itemIndex]; const costPerUnit = calculateCurrentCost(item); if (costPerUnit <= 0 && buyMax) { if (gold >= costPerUnit && !buyMax){ item.owned++; recalculateGPS(); } return; } let numToBuy = 0; if (buyMax) { if (gold >= costPerUnit) numToBuy = Math.floor(gold / costPerUnit); } else { if (gold >= costPerUnit) numToBuy = 1; } if (numToBuy > 0) { gold -= numToBuy * costPerUnit; item.owned += numToBuy; recalculateGPS(); } }
    canvas.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; });
    canvas.addEventListener('mousedown', () => mouse.down = true);
    canvas.addEventListener('mouseup', () => mouse.down = false);
    canvas.addEventListener('mouseleave', () => mouse.down = false);
    canvas.addEventListener('click', (event) => { const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top; if (clickX >= mainClickerRect.x && clickX <= mainClickerRect.x + mainClickerRect.width && clickY >= mainClickerRect.y && clickY <= mainClickerRect.y + mainClickerRect.height) { if (mainClickImageLoaded) handleManualClick(); return; } for (const btn of buyButtonRects) { if (btn.enabled && clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) { buyEquipmentItem(btn.itemIndex, btn.type === 'MAX'); return; } } });
    canvas.addEventListener('wheel', (event) => { if (mouse.x >= LAYOUT.shop.x && mouse.x <= LAYOUT.shop.x + LAYOUT.shop.width + LAYOUT.shop.scrollbar.width && mouse.y >= LAYOUT.shop.y && mouse.y <= LAYOUT.shop.y + LAYOUT.shop.height) { event.preventDefault(); shopScrollY += event.deltaY * 0.3; const maxScrollY = Math.max(0, totalShopContentHeight - LAYOUT.shop.height); if (shopScrollY < 0) shopScrollY = 0; if (shopScrollY > maxScrollY) shopScrollY = maxScrollY; } });

    // --- Game Loop & Initialization --- (unchanged)
    function update(deltaTime) { if (deltaTime > 0.1) deltaTime = 0.1; gold += goldPerSecond * deltaTime; }
    function draw() { clearCanvas(); drawTopBar(); drawMainClicker(mouse.x, mouse.y); drawShop(mouse.x, mouse.y); }
    let gameLoopStarted = false; function gameLoop(timestamp) { if (!gameLoopStarted) { lastUpdateTime = timestamp; gameLoopStarted = true; } const deltaTime = (timestamp - lastUpdateTime) / 1000; lastUpdateTime = timestamp; update(deltaTime); draw(); requestAnimationFrame(gameLoop); }
    function init() { recalculateGPS(); loadItemImages(); mainClickImage.onload = () => { mainClickImageLoaded = true; if (!gameLoopStarted) requestAnimationFrame(gameLoop); }; mainClickImage.onerror = () => { mainClickImageLoaded = false; if (!gameLoopStarted) requestAnimationFrame(gameLoop); }; mainClickImage.src = 'pics/manual/Main_click.png'; }
    init();
});
