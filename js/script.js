// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error("FATAL ERROR: Canvas element with ID 'gameCanvas' was not found.");
        alert("FATAL ERROR: Canvas not found. Check index.html.");
        return;
    }

    const ctx = canvas.getContext('2d');

    // --- Game State Variables ---
    let gold = 0; // Default, will be loaded
    let goldPerSecond = 0;
    const clickValue = 1;

    const mainClickImage = new Image();
    let mainClickImageLoaded = false;
    const itemImages = {}; // To store loaded item icons { itemId: ImageObject }
    const itemImageLoaded = {}; // { itemId: boolean }

    const equipment = [
        { id: "safety_glasses", name: "Safety Glasses", imageFile: "1. Safety Glasses", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", imageFile: "2. Gloves", baseCost: 150.00, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", imageFile: "3. Hammer", baseCost: 750.00, production: 7.80, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", imageFile: "4. Screwdriver Set", baseCost: 3750.00, production: 39.80, owned: 0 },
        { id: "pliers", name: "Pliers", imageFile: "5. Pliers", baseCost: 18750.00, production: 202.96, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", imageFile: "6. Wrench Set", baseCost: 93750.00, production: 1035.08, owned: 0 },
        { id: "utility_knife", name: "Utility Knife", imageFile: "7. Utility KnifeBox Cutter", baseCost: 468750.00, production: 5278.89, owned: 0 },
        { id: "measuring_tape", name: "Measuring Tape", imageFile: "8. Measuring Tape", baseCost: 2343750.00, production: 26922.32, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", imageFile: "9. Hand Saw", baseCost: 11718750.00, production: 137303.83, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", imageFile: "10. Chisel Set", baseCost: 58593750.00, production: 700249.55, owned: 0 },
        { id: "file_set", name: "File Set", imageFile: "11. File Set", baseCost: 292968750.00, production: 3571272.71, owned: 0 },
        // Add your full list of equipment here, ensuring each has an 'imageFile' property
        // that matches the filename in 'pics/main_prod/'
    ];

    const LAYOUT = { // Using the futuristic layout from the previous response
        padding: 25, topBarHeight: 65,
        mainClicker: { x: 25, y: 90, width: 200, height: 150, hoverGlowColor: 'rgba(0, 255, 255, 0.8)', clickPulseColor: 'rgba(0, 255, 255, 0.5)' },
        shop: {
            x: 260, y: 90, width: canvas.width - 260 - 25 - 25, height: canvas.height - 90 - 25,
            card: {
                width: (canvas.width - 260 - 25 - 25) - 30, height: 270, bgColor: 'rgba(10, 20, 50, 0.8)',
                borderColor: '#00FFFF', borderWidth: 1.5, borderRadius: 6, padding: 20, iconSize: 60,
                iconBgColor: 'rgba(0, 255, 255, 0.05)', iconBorderColor: '#00FFFF', iconPlaceholderSymbol: '◈',
                titleFont: 'bold 22px "Exo 2", Verdana, sans-serif',
                statLabelFont: '14px "Exo 2", Verdana, sans-serif', statValueFont: 'bold 17px "Exo 2", Verdana, sans-serif',
                statLineHeight: 24, buttonHeight: 40, buttonGap: 12, buttonBorderRadius: 4,
                buttonFont: 'bold 15px "Exo 2", Verdana, sans-serif',
                buyButton: { width: 110, bgColor: 'rgba(0, 200, 255, 0.7)', hoverBgColor: 'rgba(0, 230, 255, 1)', disabledBgColor: 'rgba(50, 60, 80, 0.5)', textColor: '#FFFFFF', borderColor: '#00FFFF', glowColor: 'rgba(0,255,255,0.7)' },
                maxButton: { width: 110, bgColor: 'rgba(0, 255, 150, 0.7)', hoverBgColor: 'rgba(0, 255, 180, 1)', disabledBgColor: 'rgba(50, 60, 80, 0.5)', textColor: '#FFFFFF', borderColor: '#39FF14', glowColor: 'rgba(57,255,20,0.7)' }
            },
            scrollbar: { width: 14, x: (canvas.width - 25 - 14 - 5), color: 'rgba(0, 0, 0, 0.4)', handleColor: '#00A8FF', handleHoverColor: '#00FFFF', handleBorderRadius: 4, },
            itemGap: 20
        },
        colors: { canvasBgGradient: [ { stop: 0, color: '#0A0A2A' }, { stop: 1, color: '#14143F' } ], topBarBg: 'rgba(0, 0, 0, 0.0)', topBarSeparatorColor: 'rgba(0, 255, 255, 0.5)', textLight: '#F0F8FF', gold: '#FFD700', gps: '#39FF14', iconPlaceholderText: '#00FFFF', statLabelColor: '#B0C4DE', },
        fonts: { header: 'bold 24px "Exo 2", Verdana, sans-serif', }
    };

    let buyButtonRects = [];
    let mainClickerRect = LAYOUT.mainClicker;
    let shopScrollY = 0;
    let totalShopContentHeight = 0;
    let lastUpdateTime = 0;
    let mouse = { x: 0, y: 0, down: false };
    let scrollbarHover = false;

    // --- Utility Functions ---
    function formatNumber(num) { if (num === null || num === undefined) return '0'; if (num < 1000) { let fixed = num.toFixed(2); if (fixed.endsWith('.00')) return fixed.substring(0, fixed.length - 3); if (fixed.endsWith('0') && fixed.includes('.')) { let temp = fixed.substring(0, fixed.length - 1); if (temp.endsWith('.0')) return temp.substring(0, temp.length-2); return temp; } return fixed; } const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"]; const i = Math.floor(Math.log10(Math.abs(num)) / 3); if (i >= suffixes.length) return num.toExponential(2); const scaledNum = num / Math.pow(1000, i); let precision = 2; if (scaledNum >= 100) precision = 0; else if (scaledNum >= 10) precision = 1; let sNum = scaledNum.toFixed(precision); if (precision > 0 && sNum.includes('.')) sNum = sNum.replace(/0+$/, '').replace(/\.$/, ''); return sNum + suffixes[i]; }
    function calculateCurrentCost(item) { return item.baseCost * Math.pow(1.0, item.owned); } // Cost does not increase
    function recalculateGPS() { goldPerSecond = equipment.reduce((totalGPS, item) => totalGPS + (item.production * item.owned), 0); }
    
    function loadItemImages() {
        equipment.forEach(item => {
            if (!item.imageFile) {
                console.warn(`Item ${item.id} is missing the 'imageFile' property.`);
                itemImageLoaded[item.id] = 'error';
                return;
            }
            const img = new Image();
            itemImageLoaded[item.id] = false;
            img.onload = () => { itemImageLoaded[item.id] = true; itemImages[item.id] = img; };
            img.onerror = () => { itemImageLoaded[item.id] = 'error'; console.warn(`Could not load image for ${item.name} at pics/main_prod/${item.imageFile}.png`); };
            img.src = `pics/main_prod/${item.imageFile}.png`;
        });
    }

    // --- Drawing Functions ---
    function drawTechRect(x, y, width, height, radius, fillColor, borderColor, borderWidth = 1, shadowColor, shadowBlur, inset) { ctx.save(); if (shadowColor && shadowBlur && !inset) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; } ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y); if (radius > 0) ctx.arcTo(x + width, y, x + width, y + radius, radius); else ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + height - radius); if (radius > 0) ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); else ctx.lineTo(x + width, y + height); ctx.lineTo(x + radius, y + height); if (radius > 0) ctx.arcTo(x, y + height, x, y + height - radius, radius); else ctx.lineTo(x, y + height); ctx.lineTo(x, y + radius); if (radius > 0) ctx.arcTo(x, y, x + radius, y, radius); else ctx.lineTo(x,y); ctx.closePath(); if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); } ctx.restore(); if (inset && shadowColor && shadowBlur) { ctx.save(); ctx.clip(); ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; ctx.shadowOffsetX = (width + shadowBlur*2); ctx.fillRect(x - (width + shadowBlur*2), y - shadowBlur, width + shadowBlur*2, height + shadowBlur*2); ctx.restore(); } if (borderColor) { ctx.strokeStyle = borderColor; ctx.lineWidth = borderWidth; ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y); if (radius > 0) ctx.arcTo(x + width, y, x + width, y + radius, radius); else ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + height - radius); if (radius > 0) ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); else ctx.lineTo(x + width, y + height); ctx.lineTo(x + radius, y + height); if (radius > 0) ctx.arcTo(x, y + height, x, y + height - radius, radius); else ctx.lineTo(x, y + height); ctx.lineTo(x, y + radius); if (radius > 0) ctx.arcTo(x, y, x + radius, y, radius); else ctx.lineTo(x,y); ctx.closePath(); ctx.stroke(); } }
    function clearCanvas() { const grad = ctx.createLinearGradient(0, 0, 0, canvas.height); LAYOUT.colors.canvasBgGradient.forEach(stop => grad.addColorStop(stop.stop, stop.color)); ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'; ctx.lineWidth = 0.5; for (let i = 0; i < canvas.width; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); } for (let i = 0; i < canvas.height; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); } }
    function drawTopBar() { ctx.beginPath(); ctx.moveTo(0, LAYOUT.topBarHeight); ctx.lineTo(canvas.width, LAYOUT.topBarHeight); ctx.strokeStyle = LAYOUT.colors.topBarSeparatorColor; ctx.lineWidth = 1.5; ctx.shadowColor = 'rgba(0, 255, 255, 0.7)'; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowColor = 'transparent'; ctx.fillStyle = LAYOUT.colors.gold; ctx.font = LAYOUT.fonts.header; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(255,215,0,0.6)'; ctx.shadowBlur = 8; ctx.fillText(`Gold: ${formatNumber(gold)}`, LAYOUT.padding, LAYOUT.topBarHeight / 2); ctx.fillStyle = LAYOUT.colors.gps; ctx.textAlign = 'right'; ctx.shadowColor = 'rgba(57,255,20,0.6)'; ctx.shadowBlur = 8; ctx.fillText(`GPS: ${formatNumber(goldPerSecond)}/s`, canvas.width - LAYOUT.padding, LAYOUT.topBarHeight / 2); ctx.shadowColor = 'transparent'; ctx.textBaseline = 'alphabetic'; }
    function drawMainClicker(mouseX, mouseY) { const { x, y, width, height, hoverGlowColor, clickPulseColor } = LAYOUT.mainClicker; const isHovered = (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height); if (mainClickImageLoaded) { ctx.save(); if (isHovered) { ctx.shadowColor = hoverGlowColor; ctx.shadowBlur = 25; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; if (mouse.down) { ctx.shadowColor = clickPulseColor; ctx.shadowBlur = 30; ctx.translate(x + width / 2, y + height / 2); ctx.scale(0.96, 0.96); ctx.translate(-(x + width / 2), -(y + height / 2)); } } ctx.drawImage(mainClickImage, x, y, width, height); ctx.restore(); } else { drawTechRect(x, y, width, height, 5, 'rgba(70,70,90,0.7)', '#00A8FF', 2); ctx.fillStyle = LAYOUT.colors.textLight; ctx.font = 'bold 18px "Exo 2", Verdana, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("LOADING...", x + width / 2, y + height / 2); } ctx.shadowColor = 'transparent'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
    function drawShop(mouseX, mouseY) { const shop = LAYOUT.shop; const cardLayout = LAYOUT.shop.card; buyButtonRects = []; totalShopContentHeight = equipment.length * (cardLayout.height + shop.itemGap) - shop.itemGap; if (totalShopContentHeight < shop.height) totalShopContentHeight = shop.height; ctx.save(); ctx.beginPath(); ctx.rect(shop.x, shop.y, shop.width, shop.height); ctx.clip(); let currentCardY = shop.y - shopScrollY; for (let i = 0; i < equipment.length; i++) { const item = equipment[i]; const cardX = shop.x + (shop.width - cardLayout.width - shop.scrollbar.width) / 2; const cardY = currentCardY + i * (cardLayout.height + shop.itemGap); if (cardY + cardLayout.height < shop.y - 20 || cardY > shop.y + shop.height + 20) { continue; } drawTechRect(cardX, cardY, cardLayout.width, cardLayout.height, cardLayout.borderRadius, cardLayout.bgColor, cardLayout.borderColor, cardLayout.borderWidth, 'rgba(0,255,255,0.15)', 15); let contentX = cardX + cardLayout.padding; let contentY = cardY + cardLayout.padding; const iconX = contentX; const iconY = contentY; drawTechRect(iconX, iconY, cardLayout.iconSize, cardLayout.iconSize, 4, cardLayout.iconBgColor, cardLayout.iconBorderColor, 1); if (itemImageLoaded[item.id] === true && itemImages[item.id]) { ctx.drawImage(itemImages[item.id], iconX + 2, iconY + 2, cardLayout.iconSize - 4, cardLayout.iconSize - 4); } else { ctx.fillStyle = LAYOUT.colors.iconPlaceholderText; ctx.font = `bold ${cardLayout.iconSize * 0.5}px "Exo 2", Verdana, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cardLayout.iconPlaceholderSymbol, iconX + cardLayout.iconSize / 2, iconY + cardLayout.iconSize / 2); } ctx.fillStyle = LAYOUT.colors.textLight; ctx.font = cardLayout.titleFont; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; const titleX = iconX + cardLayout.iconSize + 15; const titleMaxWidth = cardLayout.width - cardLayout.padding * 2 - cardLayout.iconSize - 20; ctx.fillText(item.name, titleX, iconY + (cardLayout.iconSize / 2) - (parseInt(cardLayout.titleFont.split('px')[0]) / 2) , titleMaxWidth); let statsY = iconY + cardLayout.iconSize + 18; const statsX = contentX; const valueOffsetX = 120; const statLineHeight = cardLayout.statLineHeight; ctx.font = cardLayout.statLabelFont; ctx.fillStyle = LAYOUT.colors.statLabelColor; ctx.fillText("Cost:", statsX, statsY); ctx.font = cardLayout.statValueFont; ctx.fillStyle = LAYOUT.colors.gold; const cost = calculateCurrentCost(item); ctx.fillText(formatNumber(cost), statsX + valueOffsetX, statsY); statsY += statLineHeight; ctx.font = cardLayout.statLabelFont; ctx.fillStyle = LAYOUT.colors.statLabelColor; ctx.fillText("Prod/Sec:", statsX, statsY); ctx.font = cardLayout.statValueFont; ctx.fillStyle = LAYOUT.colors.gps; ctx.fillText(formatNumber(item.production), statsX + valueOffsetX, statsY); statsY += statLineHeight; ctx.font = cardLayout.statLabelFont; ctx.fillStyle = LAYOUT.colors.statLabelColor; ctx.fillText("Owned:", statsX, statsY); ctx.font = cardLayout.statValueFont; ctx.fillStyle = LAYOUT.colors.textLight; ctx.fillText(String(item.owned), statsX + valueOffsetX, statsY); statsY += statLineHeight; ctx.font = cardLayout.statLabelFont; ctx.fillStyle = LAYOUT.colors.statLabelColor; ctx.fillText("Item GPS:", statsX, statsY); ctx.font = cardLayout.statValueFont; ctx.fillStyle = LAYOUT.colors.gps; ctx.fillText(formatNumber(item.production * item.owned), statsX + valueOffsetX, statsY); const buttonAreaY = cardY + cardLayout.height - cardLayout.padding - cardLayout.buttonHeight; const totalButtonWidth = cardLayout.buyButton.width + cardLayout.maxButton.width + cardLayout.buttonGap; const buttonsStartX = cardX + (cardLayout.width - totalButtonWidth) / 2; const canAfford = gold >= cost; const buyBtnX = buttonsStartX; const buyBtnStyle = cardLayout.buyButton; const buyHover = canAfford && mouseX >= buyBtnX && mouseX <= buyBtnX + buyBtnStyle.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight; let buyFill = canAfford ? (buyHover ? buyBtnStyle.hoverBgColor : buyBtnStyle.bgColor) : buyBtnStyle.disabledBgColor; drawTechRect(buyBtnX, buttonAreaY, buyBtnStyle.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, buyFill, buyBtnStyle.borderColor, 1.5, buyHover && canAfford ? buyBtnStyle.glowColor : null, 15); ctx.fillStyle = buyBtnStyle.textColor; ctx.font = cardLayout.buttonFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = buyHover ? 2 : 0; ctx.shadowOffsetX = buyHover ? 1 : 0; ctx.shadowOffsetY = buyHover ? 1 : 0; ctx.fillText("BUY", buyBtnX + buyBtnStyle.width / 2, buttonAreaY + cardLayout.buttonHeight / 2); ctx.shadowColor = 'transparent'; buyButtonRects.push({ x: buyBtnX, y: buttonAreaY, width: buyBtnStyle.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'BUY', enabled: canAfford }); const maxBtnX = buyBtnX + buyBtnStyle.width + cardLayout.buttonGap; const maxBtnStyle = cardLayout.maxButton; const maxHover = canAfford && mouseX >= maxBtnX && mouseX <= maxBtnX + maxBtnStyle.width && mouseY >= buttonAreaY && mouseY <= buttonAreaY + cardLayout.buttonHeight; let maxFill = canAfford ? (maxHover ? maxBtnStyle.hoverBgColor : maxBtnStyle.bgColor) : maxBtnStyle.disabledBgColor; drawTechRect(maxBtnX, buttonAreaY, maxBtnStyle.width, cardLayout.buttonHeight, cardLayout.buttonBorderRadius, maxFill, maxBtnStyle.borderColor, 1.5, maxHover && canAfford ? maxBtnStyle.glowColor : null, 15); ctx.fillStyle = maxBtnStyle.textColor; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = maxHover ? 2 : 0; ctx.shadowOffsetX = maxHover ? 1 : 0; ctx.shadowOffsetY = maxHover ? 1 : 0; ctx.fillText("MAX", maxBtnX + maxBtnStyle.width / 2, buttonAreaY + cardLayout.buttonHeight / 2); ctx.shadowColor = 'transparent'; buyButtonRects.push({ x: maxBtnX, y: buttonAreaY, width: maxBtnStyle.width, height: cardLayout.buttonHeight, itemIndex: i, type: 'MAX', enabled: canAfford }); } ctx.restore(); if (totalShopContentHeight > shop.height) { scrollbarHover = mouseX >= shop.scrollbar.x && mouseX <= shop.scrollbar.x + shop.scrollbar.width && mouseY >= shop.y && mouseY <= shop.y + shop.height; const scrollbarTrackHeight = shop.height; const scrollbarHandleHeight = Math.max(30, scrollbarTrackHeight * (shop.height / totalShopContentHeight)); const scrollbarHandleY = shop.y + (shopScrollY / Math.max(1, totalShopContentHeight - shop.height)) * (scrollbarTrackHeight - scrollbarHandleHeight); drawTechRect(shop.scrollbar.x, shop.y, shop.scrollbar.width, scrollbarTrackHeight, shop.scrollbar.handleBorderRadius, shop.scrollbar.color, 'rgba(0,0,0,0.2)', 1); drawTechRect(shop.scrollbar.x, Math.max(shop.y, Math.min(scrollbarHandleY, shop.y + shop.height - scrollbarHandleHeight)), shop.scrollbar.width, scrollbarHandleHeight, shop.scrollbar.handleBorderRadius, scrollbarHover ? shop.scrollbar.handleHoverColor : shop.scrollbar.handleColor, 'rgba(0,0,0,0.4)', 1); } ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }

    // --- Game Logic and Interaction ---
    function handleManualClick() { gold += clickValue; }
    function buyEquipmentItem(itemIndex, buyMax = false) { if (itemIndex < 0 || itemIndex >= equipment.length) return; const item = equipment[itemIndex]; const costPerUnit = calculateCurrentCost(item); if (costPerUnit <= 0 && buyMax) { if (gold >= costPerUnit && !buyMax){ item.owned++; recalculateGPS(); } return; } let numToBuy = 0; if (buyMax) { if (gold >= costPerUnit) numToBuy = Math.floor(gold / costPerUnit); } else { if (gold >= costPerUnit) numToBuy = 1; } if (numToBuy > 0) { gold -= numToBuy * costPerUnit; item.owned += numToBuy; recalculateGPS(); saveGameState(); /* Save after purchase */ } }
    
    canvas.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; });
    canvas.addEventListener('mousedown', () => mouse.down = true);
    canvas.addEventListener('mouseup', () => mouse.down = false);
    canvas.addEventListener('mouseleave', () => mouse.down = false);
    canvas.addEventListener('click', (event) => { const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top; if (clickX >= mainClickerRect.x && clickX <= mainClickerRect.x + mainClickerRect.width && clickY >= mainClickerRect.y && clickY <= mainClickerRect.y + mainClickerRect.height) { if (mainClickImageLoaded) handleManualClick(); return; } for (const btn of buyButtonRects) { if (btn.enabled && clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) { buyEquipmentItem(btn.itemIndex, btn.type === 'MAX'); return; } } });
    canvas.addEventListener('wheel', (event) => { if (mouse.x >= LAYOUT.shop.x && mouse.x <= LAYOUT.shop.x + LAYOUT.shop.width + LAYOUT.shop.scrollbar.width && mouse.y >= LAYOUT.shop.y && mouse.y <= LAYOUT.shop.y + LAYOUT.shop.height) { event.preventDefault(); shopScrollY += event.deltaY * 0.3; const maxScrollY = Math.max(0, totalShopContentHeight - LAYOUT.shop.height); if (shopScrollY < 0) shopScrollY = 0; if (shopScrollY > maxScrollY) shopScrollY = maxScrollY; } });

    // --- Game State Save/Load & Offline Progress ---
    const SAVE_KEY = 'myFuturisticClickerGameState_v2'; // Changed key for new state
    function saveGameState() {
        const gameState = {
            gold: gold,
            equipmentOwned: equipment.map(e => ({ id: e.id, owned: e.owned })),
            lastSessionTimestamp: Date.now(),
            lastGoldPerSecond: goldPerSecond
        };
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); /* console.log("Game state saved."); */ }
        catch (e) { console.error("Error saving game state:", e); }
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
                        if (savedItemData) currentItem.owned = savedItemData.owned || 0;
                    });
                }
                recalculateGPS(); // Call once after loading all owned items
                if (savedState.lastSessionTimestamp && typeof savedState.lastGoldPerSecond === 'number') {
                    const currentTime = Date.now();
                    const elapsedTimeMs = currentTime - savedState.lastSessionTimestamp;
                    if (elapsedTimeMs > 0) {
                        const elapsedTimeSec = elapsedTimeMs / 1000;
                        const maxOfflineSeconds = 48 * 60 * 60; // 48 hours
                        const effectiveElapsedTimeSec = Math.min(elapsedTimeSec, maxOfflineSeconds);
                        const offlineGoldEarned = savedState.lastGoldPerSecond * effectiveElapsedTimeSec;
                        if (offlineGoldEarned > 0) {
                            gold += offlineGoldEarned;
                            setTimeout(() => {
                                alert(`Welcome back!\n\nYou earned ${formatNumber(offlineGoldEarned)} gold while away (${formatNumber(effectiveElapsedTimeSec / 60)} mins).\n(Based on GPS: ${formatNumber(savedState.lastGoldPerSecond)}/s)`);
                            }, 200); // Delay alert slightly
                        }
                    }
                }
            } else { /* Start fresh, gold and owned are already 0 */ recalculateGPS(); }
        } catch (e) { console.error("Error loading game state:", e); gold = 0; equipment.forEach(e => e.owned = 0); recalculateGPS(); }
    }
    setInterval(saveGameState, 30000); // Auto-save every 30 seconds
    window.addEventListener('beforeunload', saveGameState);

    // --- Game Loop & Initialization ---
    function update(deltaTime) { if (deltaTime > 0.1) deltaTime = 0.1; gold += goldPerSecond * deltaTime; }
    function draw() { clearCanvas(); drawTopBar(); drawMainClicker(mouse.x, mouse.y); drawShop(mouse.x, mouse.y); }
    let gameLoopStarted = false; 
    function gameLoop(timestamp) { 
        if (!gameLoopStarted) { lastUpdateTime = timestamp; gameLoopStarted = true; } 
        const deltaTime = (timestamp - lastUpdateTime) / 1000; 
        lastUpdateTime = timestamp; 
        update(deltaTime); 
        draw(); 
        requestAnimationFrame(gameLoop); 
    }
    function init() { 
        loadGameState(); // Load first, which also calls recalculateGPS
        loadItemImages(); 
        mainClickImage.onload = () => { mainClickImageLoaded = true; if (!gameLoopStarted) requestAnimationFrame(gameLoop); }; 
        mainClickImage.onerror = () => { mainClickImageLoaded = false; if (!gameLoopStarted) requestAnimationFrame(gameLoop); }; 
        mainClickImage.src = 'pics/manual/Main_click.png'; 
        // Failsafe to start loop if image loads instantly from cache and onload doesn't fire fast enough
        if (mainClickImage.complete && !gameLoopStarted) { 
            mainClickImageLoaded = true; // Assume loaded if complete
            requestAnimationFrame(gameLoop); 
        }
    }
    init();
});
