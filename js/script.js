// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    // === Crucial Check: Ensure canvas element was found ===
    if (!canvas) {
        console.error("FATAL ERROR: Canvas element with ID 'gameCanvas' was not found in your HTML.");
        alert("FATAL ERROR: Canvas element with ID 'gameCanvas' not found. Please check your index.html and the canvas ID. The game cannot start.");
        return; // Stop script execution if canvas is missing
    }
    // =======================================================

    const ctx = canvas.getContext('2d');

    // Game State Variables
    let gold = 0;
    let goldPerSecond = 0;
    const clickValue = 1; // Gold earned per manual click

    // Equipment Data (with baseCost, production, and owned count)
    const equipment = [
        { id: "safety_glasses", name: "Safety Glasses", description: "Protects eyes from debris during basic tasks.", baseCost: 30.00, production: 0.30, owned: 0 },
        { id: "gloves", name: "Gloves", description: "Provides hand protection for manual labor.", baseCost: 150.00, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", description: "A basic tool for driving nails or shaping materials.", baseCost: 750.00, production: 7.80, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", description: "Used for inserting and removing screws.", baseCost: 3750.00, production: 39.80, owned: 0 },
        { id: "pliers", name: "Pliers", description: "Grips and manipulates small objects and wires.", baseCost: 18750.00, production: 202.96, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", description: "Tightens and loosens nuts and bolts.", baseCost: 93750.00, production: 1035.08, owned: 0 },
        { id: "utility_knife", name: "Utility Knife/Box Cutter", description: "Cuts various thin materials precisely.", baseCost: 468750.00, production: 5278.89, owned: 0 },
        { id: "measuring_tape", name: "Measuring Tape", description: "Ensures accurate measurements for fabrication.", baseCost: 2343750.00, production: 26922.32, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", description: "Manually cuts wood or other soft materials.", baseCost: 11718750.00, production: 137303.83, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", description: "Shapes or carves wood and metal by hand.", baseCost: 58593750.00, production: 700249.55, owned: 0 },
        { id: "file_set", name: "File Set", description: "Smooths and shapes metal or wood surfaces.", baseCost: 292968750.00, production: 3571272.71, owned: 0 },
        { id: "manual_clamps", name: "Manual Clamps", description: "Securely holds workpieces in place.", baseCost: 1464843750.00, production: 18213490.85, owned: 0 },
        { id: "manual_hand_drill", name: "Manual Hand Drill", description: "Creates small holes with manual power.", baseCost: 7324218750.00, production: 92888803.31, owned: 0 },
        { id: "pop_rivet_gun", name: "Pop Rivet Gun (Manual)", description: "Joins sheet materials with rivets by hand.", baseCost: 36621093750.00, production: 473732896.89, owned: 0 },
        { id: "workbench", name: "Workbench", description: "A sturdy surface for all manufacturing tasks.", baseCost: 183105468750.00, production: 2416037774.16, owned: 0 },
        { id: "vise", name: "Vise", description: "A bench-mounted tool for firmly holding items.", baseCost: 915527343750.00, production: 12321792648.23, owned: 0 },
        { id: "manual_grease_gun", name: "Manual Grease Gun", description: "Applies lubricant to machine parts.", baseCost: 4577636718750.00, production: 62841142505.98, owned: 0 },
        { id: "caulking_gun", name: "Caulking Gun", description: "Applies sealants and adhesives from tubes.", baseCost: 22888183593750.00, production: 320489826780.49, owned: 0 },
        { id: "broom_dustpan", name: "Broom & Dustpan", description: "Keeps the workshop clean and operational.", baseCost: 114440917968750.00, production: 1634498116580.51, owned: 0 },
        { id: "basic_soldering_iron", name: "Basic Soldering Iron", description: "Joins electronic components with solder.", baseCost: 572204589843750.00, production: 8335940394560.60, owned: 0 },
        { id: "electric_drill", name: "Electric Drill", description: "A powered tool for drilling holes quickly.", baseCost: 2861022949218750.00, production: 42513296012259.10, owned: 0 },
        { id: "jigsaw", name: "Jigsaw", description: "Cuts intricate curves and shapes in various materials.", baseCost: 14305114746093700.00, production: 216817809662521.00, owned: 0 },
        { id: "circular_saw", name: "Circular Saw", description: "Makes straight cuts in wood and other materials.", baseCost: 71525573730468800.00, production: 1105770829278860.00, owned: 0 },
        { id: "orbital_sander", name: "Orbital Sander", description: "Smooths surfaces with a random orbital motion.", baseCost: 357627868652344000.00, production: 5639431229322180.00, owned: 0 },
        { id: "angle_grinder", name: "Angle Grinder", description: "Grinds, cuts, and polishes metal and masonry.", baseCost: 1788139343261720000.00, production: 28761099269543100.00, owned: 0 },
        { id: "power_screwdriver", name: "Power Screwdriver/Impact Driver", description: "Drives screws with electric power, faster than manual.", baseCost: 8940696716308590000.00, production: 146681606274670000.00, owned: 0 },
        { id: "heat_gun", name: "Heat Gun", description: "Emits hot air for tasks like stripping paint or shrinking tubing.", baseCost: 44703483581543000000.00, production: 748076192000816000.00, owned: 0 },
        { id: "rotary_tool", name: "Rotary Tool", description: "A versatile handheld tool for grinding, sanding, and polishing small parts.", baseCost: 223517417907715000000.00, production: 3815188579204160000.00, owned: 0 },
        { id: "bench_grinder", name: "Bench Grinder", description: "Sharpens tools and grinds metal on a stationary wheel.", baseCost: 1117587089538570000000.00, production: 19457461753941200000.00, owned: 0 },
        { id: "belt_sander", name: "Belt Sander", description: "Rapidly sands flat surfaces with a continuous abrasive belt.", baseCost: 5587935447692870000000.00, production: 99233054945100200000.00, owned: 0 },
    ];

    // UI Layout and Styling Constants
    // This definition now happens *after* we've confirmed canvas exists and is not null.
    const LAYOUT = {
        padding: 20,
        topBarHeight: 60,
        mainClicker: { x: 20, y: 80, width: 200, height: 150, color: '#4CAF50', hoverColor: '#45a049', textColor: 'white' },
        shop: {
            x: 250,
            y: 80,
            width: canvas.width - 250 - 20, // This should now be safe
            itemHeight: 65,
            itemsPerPage: 9,
            buttonWidth: 80,
            buttonHeight: 30,
            buttonColor: '#007bff',
            buttonHoverColor: '#0056b3',
            buttonDisabledColor: '#cccccc',
            textColor: 'white'
        },
        colors: {
            background: '#f0f2f5',
            canvasBackground: '#ffffff',
            textDark: '#333333',
            textLight: '#ffffff',
            gold: '#FFD700',
            gps: '#40C040',
        },
        fonts: {
            header: '24px Arial',
            item: '14px Arial',
            button: '14px Arial bold',
            stats: '18px Arial'
        }
    };

    // This is approximately where your line 87 was.
    // 'LAYOUT' should now be properly defined if canvas was found.
    let buyButtonRects = [];
    let mainClickerRect = LAYOUT.mainClicker;

    let lastUpdateTime = 0;

    // --- Utility Functions ---
    function formatNumber(num) {
        if (num === null || num === undefined) return '0';
        if (num < 1000) {
            // For small numbers, show up to 2 decimal places, but remove them if they are .00
            let fixed = num.toFixed(2);
            if (fixed.endsWith('.00')) {
                return fixed.substring(0, fixed.length - 3);
            }
            // If it ends with x.y0, remove the trailing 0
            if (fixed.endsWith('0') && fixed.includes('.')) {
                 // Check again if it became .0 after removing trailing 0
                let temp = fixed.substring(0, fixed.length - 1);
                if (temp.endsWith('.0')) {
                    return temp.substring(0, temp.length-2);
                }
                return temp;
            }
            return fixed;
        }


        const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"];
        const i = Math.floor(Math.log10(Math.abs(num)) / 3);
        
        if (i >= suffixes.length) { // Fallback to scientific if too large for defined suffixes
            return num.toExponential(2);
        }
        
        const scaledNum = num / Math.pow(1000, i);
        let precision = 2;
        if (scaledNum >= 100) precision = 0;
        else if (scaledNum >= 10) precision = 1;

        // Format and remove trailing zeros from decimals robustly
        let Snum = scaledNum.toFixed(precision);
        if (precision > 0 && Snum.includes('.')) {
            Snum = Snum.replace(/0+$/, '').replace(/\.$/, '');
        }
        return Snum + suffixes[i];
    }


    function calculateCurrentCost(item) {
        return item.baseCost * Math.pow(1.15, item.owned);
    }

    function recalculateGPS() {
        goldPerSecond = equipment.reduce((totalGPS, item) => {
            return totalGPS + (item.production * item.owned);
        }, 0);
    }

    // --- Drawing Functions ---
    function clearCanvas() {
        ctx.fillStyle = LAYOUT.colors.canvasBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawTopBar() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, LAYOUT.topBarHeight);

        ctx.fillStyle = LAYOUT.colors.gold;
        ctx.font = LAYOUT.fonts.header;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle'; // Better vertical alignment for text in a bar
        ctx.fillText(`Gold: ${formatNumber(gold)}`, LAYOUT.padding, LAYOUT.topBarHeight / 2);

        ctx.fillStyle = LAYOUT.colors.gps;
        ctx.textAlign = 'right';
        ctx.fillText(`GPS: ${formatNumber(goldPerSecond)}/s`, canvas.width - LAYOUT.padding, LAYOUT.topBarHeight / 2);
        ctx.textBaseline = 'alphabetic'; // Reset baseline
    }

    function drawMainClicker(mouseX, mouseY) {
        const { x, y, width, height, color, hoverColor, textColor } = LAYOUT.mainClicker;
        let currentFill = color;

        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
            currentFill = hoverColor;
        }

        ctx.fillStyle = currentFill;
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = LAYOUT.colors.textDark; // Add a border
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);


        ctx.fillStyle = textColor;
        ctx.font = LAYOUT.fonts.header;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Click for Gold!", x + width / 2, y + height / 2);
        ctx.textBaseline = 'alphabetic'; // Reset baseline
        ctx.textAlign = 'left'; // Reset align
    }

    function drawShop(mouseX, mouseY) {
        const shopLayout = LAYOUT.shop;
        buyButtonRects = [];

        ctx.textBaseline = 'top';

        for (let i = 0; i < Math.min(equipment.length, shopLayout.itemsPerPage); i++) {
            const item = equipment[i];
            const currentCost = calculateCurrentCost(item);
            const itemX = shopLayout.x + LAYOUT.padding; // Add padding to item content
            const itemY = shopLayout.y + i * shopLayout.itemHeight + LAYOUT.padding / 2; // Adjust spacing a bit
            const itemContentWidth = shopLayout.width - (LAYOUT.padding * 2);


            // Item Name
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.font = LAYOUT.fonts.item;
            ctx.textAlign = 'left';
            ctx.fillText(`${item.name} (Owned: ${item.owned})`, itemX, itemY);

            // Item Stats (Cost & Production)
            ctx.font = LAYOUT.fonts.stats; // Corrected from item to stats
            ctx.fillText(`Cost: ${formatNumber(currentCost)}`, itemX, itemY + 20);
            ctx.fillStyle = LAYOUT.colors.gps;
            ctx.fillText(`GPS: +${formatNumber(item.production)}`, itemX, itemY + 40);

            // Buy Button
            const buttonX = itemX + itemContentWidth - shopLayout.buttonWidth; // Position button within padded area
            const buttonY = itemY + (shopLayout.itemHeight - shopLayout.buttonHeight -10 ) / 2 -5 ; // Adjusted for new itemY
            const buttonRect = { x: buttonX, y: buttonY, width: shopLayout.buttonWidth, height: shopLayout.buttonHeight, itemIndex: i };
            buyButtonRects.push(buttonRect);

            let btnFill = gold >= currentCost ? shopLayout.buttonColor : shopLayout.buttonDisabledColor;
            if (gold >= currentCost && mouseX >= buttonX && mouseX <= buttonX + shopLayout.buttonWidth && mouseY >= buttonY && mouseY <= buttonY + shopLayout.buttonHeight) {
                btnFill = shopLayout.buttonHoverColor;
            }

            ctx.fillStyle = btnFill;
            ctx.fillRect(buttonX, buttonY, shopLayout.buttonWidth, shopLayout.buttonHeight);
            
            // Button border
            ctx.strokeStyle = LAYOUT.colors.textDark;
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, shopLayout.buttonWidth, shopLayout.buttonHeight);


            ctx.fillStyle = LAYOUT.shop.textColor; // Ensure text color is set for button
            ctx.font = LAYOUT.fonts.button;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Buy", buttonX + shopLayout.buttonWidth / 2, buttonY + shopLayout.buttonHeight / 2);
            ctx.textBaseline = 'alphabetic'; // Reset
            ctx.textAlign = 'left'; // Reset
        }
        if (equipment.length > shopLayout.itemsPerPage) {
            ctx.fillStyle = LAYOUT.colors.textDark;
            ctx.font = LAYOUT.fonts.item;
            ctx.textAlign = 'center';
            const shopBottom = shopLayout.y + shopLayout.itemsPerPage * shopLayout.itemHeight + LAYOUT.padding + 30; // Increased spacing
            ctx.fillText(`Showing ${shopLayout.itemsPerPage} of ${equipment.length} items.`, shopLayout.x + shopLayout.width/2, shopBottom);
            // (Pagination controls would be drawn here)
            ctx.textAlign = 'left'; // Reset
        }
    }

    // --- Game Logic and Interaction ---
    function handleManualClick() {
        gold += clickValue;
    }

    function buyEquipment(itemIndex) {
        if (itemIndex < 0 || itemIndex >= equipment.length) return; // Bounds check

        const item = equipment[itemIndex];
        const currentCost = calculateCurrentCost(item);

        if (gold >= currentCost) {
            gold -= currentCost;
            item.owned++;
            recalculateGPS();
        } else {
            console.log("Not enough gold for " + item.name);
        }
    }

    let mouse = { x: 0, y: 0 };
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Check main clicker
        if (clickX >= mainClickerRect.x && clickX <= mainClickerRect.x + mainClickerRect.width &&
            clickY >= mainClickerRect.y && clickY <= mainClickerRect.y + mainClickerRect.height) {
            handleManualClick();
            return;
        }

        // Check buy buttons
        for (const btn of buyButtonRects) {
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                const item = equipment[btn.itemIndex];
                if (gold >= calculateCurrentCost(item)) { // Check affordability again before buying
                     buyEquipment(btn.itemIndex);
                } else {
                    console.log("Clicked disabled buy button for " + item.name);
                }
                return;
            }
        }
    });

    // --- Game Loop ---
    function update(deltaTime) {
        if (deltaTime > 0.1) { // Prevent huge jump if tab was inactive for a long time
            deltaTime = 0.1;
        }
        const goldEarnedThisFrame = goldPerSecond * deltaTime;
        gold += goldEarnedThisFrame;
    }

    function draw() {
        clearCanvas();
        drawTopBar();
        drawMainClicker(mouse.x, mouse.y);
        drawShop(mouse.x, mouse.y);
    }

    function gameLoop(timestamp) {
        const deltaTime = (timestamp - lastUpdateTime) / 1000;
        lastUpdateTime = timestamp;

        update(deltaTime);
        draw();

        requestAnimationFrame(gameLoop);
    }

    // --- Initialization ---
    function init() {
        recalculateGPS();
        lastUpdateTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    init();
});
