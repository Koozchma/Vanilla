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
        // Items 1-25 from your provided image data (image_d43f91.png)
        { id: "safety_glasses", name: "Safety Glasses", imageFile: "1. Safety Glasses", baseCost: 30, production: 1.53, owned: 0 },
        { id: "gloves", name: "Gloves", imageFile: "2. Gloves", baseCost: 150, production: 7.65, owned: 0 },
        { id: "hammer", name: "Hammer", imageFile: "3. Hammer", baseCost: 750, production: 39, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", imageFile: "4. Screwdriver Set", baseCost: 3750, production: 199, owned: 0 },
        { id: "pliers", name: "Pliers", imageFile: "5. Pliers", baseCost: 18750, production: 1014.78, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", imageFile: "6. Wrench Set", baseCost: 93750, production: 5278.89, owned: 0 },
        { id: "utility_knife", name: "Utility Knife", imageFile: "7. Utility Knife", baseCost: 468750, production: 26922.32, owned: 0 },
        { id: "hand_saw_manual", name: "Hand Saw", imageFile: "8. Hand Saw", baseCost: 11718750, production: 137303.83, owned: 0 },
        { id: "file_set_smooths", name: "File Set", imageFile: "9. File Set", baseCost: 292968750, production: 3571272.71, owned: 0 },
        { id: "manual_h_drill_creates_sm", name: "Manual H. Drill", imageFile: "10. Manual H. Drill", baseCost: 7324218750, production: 9.28888E+7, owned: 0 },
        { id: "workbench_a_sturdy_su", name: "Workbench", imageFile: "11. Workbench", baseCost: 1.83105E+11, production: 2.416038E+9, owned: 0 },
        { id: "manual_g_applies_lu", name: "Manual G. Gun", imageFile: "12. Manual G. Gun", baseCost: 4.57764E+12, production: 6.284114E+10, owned: 0 },
        { id: "broom_dustpan_keeps_the", name: "Broom & D.", imageFile: "13. Broom & D.", baseCost: 1.14441E+14, production: 1.6345E+12, owned: 0 },
        { id: "electric_drill_a_powerc", name: "Electric Drill", imageFile: "14. Electric Drill", baseCost: 2.86102E+15, production: 4.25133E+13, owned: 0 },
        { id: "circular_saw_makes_str", name: "Circular Saw", imageFile: "15. Circular Saw", baseCost: 7.15256E+16, production: 1.105771E+15, owned: 0 },
        { id: "angle_grinder_grinds", name: "Angle Grinder", imageFile: "16. Angle Grinder", baseCost: 1.78814E+18, production: 2.87611E+16, owned: 0 },
        { id: "rotary_tool_a_ver", name: "Rotary Tool", imageFile: "17. Rotary Tool", baseCost: 2.23517E+20, production: 3.815189E+18, owned: 0 },
        { id: "belt_sander_rapidly_s", name: "Belt Sander", imageFile: "18. Belt Sander", baseCost: 5.58794E+21, production: 9.923305E+19, owned: 0 },
        { id: "scroll_saw_cuts_intric", name: "Scroll Saw", imageFile: "19. Scroll Saw", baseCost: 1.39698E+23, production: 2.581052E+21, owned: 0 },
        { id: "pneumatic_drives_nai", name: "Pneumatic Nail", imageFile: "20. Pneumatic Nail", baseCost: 3.49246E+24, production: 6.713316E+22, owned: 0 },
        { id: "soldering_provides_t", name: "Soldering Station", imageFile: "21. Soldering Station", baseCost: 8.73115E+25, production: 1.746133E+24, owned: 0 },
        { id: "manual_s_bends_shee", name: "Manual S. Bender", imageFile: "22. Manual S. Bender", baseCost: 2.18279E+27, production: 4.541693E+25, owned: 0 },
        { id: "small_tum_removes_bu", name: "Small Tumbler", imageFile: "23. Small Tumbler", baseCost: 5.45697E+28, production: 1.181294E+27, owned: 0 },
        { id: "miter_saw_makes_accu", name: "Miter Saw", imageFile: "24. Miter Saw", baseCost: 1.36424E+30, production: 3.072547E+28, owned: 0 },
        { id: "jointer_creates_flat", name: "Jointer", imageFile: "25. Jointer", baseCost: 3.41061E+31, production: 7.991694E+29, owned: 0 },
    
        // Items 26-100: Names from original general list, Cost/Production styled after your image data, escalating.
        // Ensure you have images like "26. Planer.png", etc. in 'pics/main_prod/'
        { id: "planer", name: "Planer", imageFile: "26. Planer", baseCost: 8.52651E+32, production: 2.07784E+31, owned: 0 },
        { id: "lathe_small_manual", name: "Lathe (Small)", imageFile: "27. Lathe (Small)", baseCost: 2.13163E+34, production: 5.40238E+32, owned: 0 },
        { id: "milling_machine_small", name: "Milling Machine (Small)", imageFile: "28. Milling Machine (Small)", baseCost: 5.32907E+35, production: 1.40462E+34, owned: 0 },
        { id: "welder_basic", name: "Welder (Basic)", imageFile: "29. Welder (Basic)", baseCost: 1.33227E+37, production: 3.65191E+35, owned: 0 },
        { id: "plasma_cutter_handheld", name: "Plasma Cutter (Handheld)", imageFile: "30. Plasma Cutter (Handheld)", baseCost: 3.33067E+38, production: 9.5000E+36, owned: 0 },
        { id: "hydraulic_press_manual", name: "Hydraulic Press (Manual)", imageFile: "31. Hydraulic Press (Manual)", baseCost: 8.32667E+39, production: 2.4700E+38, owned: 0 },
        { id: "powder_coating_gun", name: "Powder Coating Gun", imageFile: "32. Powder Coating Gun", baseCost: 2.08167E+41, production: 6.4220E+39, owned: 0 },
        { id: "sandblasting_cabinet", name: "Sandblasting Cabinet", imageFile: "33. Sandblasting Cabinet", baseCost: 5.20417E+42, production: 1.6697E+41, owned: 0 },
        { id: "pedestal_grinder", name: "Pedestal Grinder", imageFile: "34. Pedestal Grinder", baseCost: 1.30104E+44, production: 4.3412E+42, owned: 0 },
        { id: "engine_hoist", name: "Engine Hoist", imageFile: "35. Engine Hoist", baseCost: 3.25261E+45, production: 1.1287E+44, owned: 0 },
        { id: "conveyor_belt_basic", name: "Basic Conveyor", imageFile: "36. Basic Conveyor", baseCost: 8.13152E+46, production: 2.9346E+45, owned: 0 },
        { id: "industrial_shelving", name: "Industrial Shelving", imageFile: "37. Industrial Shelving", baseCost: 2.03288E+48, production: 7.6299E+46, owned: 0 },
        { id: "pallet_jack_manual", name: "Pallet Jack (Manual)", imageFile: "38. Pallet Jack (Manual)", baseCost: 5.0822E+49, production: 1.9838E+48, owned: 0 },
        { id: "benchtop_injection_molder", name: "Benchtop Injection Molder", imageFile: "39. Benchtop Injection Molder", baseCost: 1.27055E+51, production: 5.1578E+49, owned: 0 },
        { id: "vacuum_former_small", name: "Vacuum Former (Small)", imageFile: "40. Vacuum Former (Small)", baseCost: 3.17637E+52, production: 1.3409E+51, owned: 0 },
        { id: "ultrasonic_cleaner_bench", name: "Ultrasonic Cleaner", imageFile: "41. Ultrasonic Cleaner", baseCost: 7.94093E+53, production: 3.4864E+52, owned: 0 },
        { id: "air_compressor_industrial", name: "Industrial Air Compressor", imageFile: "42. Industrial Air Compressor", baseCost: 1.98523E+55, production: 9.0647E+53, owned: 0 },
        { id: "forklift", name: "Forklift", imageFile: "43. Forklift", baseCost: 4.96308E+56, production: 2.3568E+55, owned: 0 },
        { id: "tig_welder", name: "TIG Welder", imageFile: "44. TIG Welder", baseCost: 1.24077E+58, production: 6.1279E+56, owned: 0 },
        { id: "cnc_router_small", name: "CNC Router (Small)", imageFile: "45. CNC Router (Small)", baseCost: 3.10193E+59, production: 1.5932E+58, owned: 0 },
        { id: "cnc_plasma_table", name: "CNC Plasma Table", imageFile: "46. CNC Plasma Table", baseCost: 7.75482E+60, production: 4.1422E+59, owned: 0 },
        { id: "press_brake_basic_cnc", name: "Press Brake (Basic CNC)", imageFile: "47. Press Brake (Basic CNC)", baseCost: 1.9387E+62, production: 1.0769E+61, owned: 0 },
        { id: "sheet_metal_shear_powered", name: "Sheet Metal Shear (Powered)", imageFile: "48. Sheet Metal Shear (Powered)", baseCost: 4.84676E+63, production: 2.8000E+62, owned: 0 },
        { id: "turret_punch_press_basic", name: "Turret Punch Press", imageFile: "49. Turret Punch Press", baseCost: 1.21169E+65, production: 7.2800E+63, owned: 0 },
        { id: "industrial_oven", name: "Industrial Oven", imageFile: "50. Industrial Oven", baseCost: 3.02923E+66, production: 1.8928E+65, owned: 0 },
        { id: "surface_grinder_manual", name: "Surface Grinder", imageFile: "51. Surface Grinder", baseCost: 7.57306E+67, production: 4.9213E+66, owned: 0 },
        { id: "cylindrical_grinder_manual", name: "Cylindrical Grinder", imageFile: "52. Cylindrical Grinder", baseCost: 1.89327E+69, production: 1.2795E+68, owned: 0 },
        { id: "industrial_mixer", name: "Industrial Mixer", imageFile: "53. Industrial Mixer", baseCost: 4.73317E+70, production: 3.3268E+69, owned: 0 },
        { id: "packaging_machine_semi_auto", name: "Packaging Machine (Semi)", imageFile: "54. Packaging Machine (Semi)", baseCost: 1.18329E+72, production: 8.6496E+70, owned: 0 },
        { id: "industrial_3d_printer_fdm", name: "Industrial 3D Printer (FDM)", imageFile: "55. Industrial 3D Printer (FDM)", baseCost: 2.95823E+73, production: 2.2489E+72, owned: 0 },
        { id: "water_jet_cutter_small", name: "Water Jet Cutter", imageFile: "56. Water Jet Cutter", baseCost: 7.39558E+74, production: 5.8471E+73, owned: 0 },
        { id: "laser_engraver_co2", name: "Laser Engraver (CO2)", imageFile: "57. Laser Engraver (CO2)", baseCost: 1.84889E+76, production: 1.5202E+75, owned: 0 },
        { id: "paint_booth_industrial", name: "Paint Booth (Industrial)", imageFile: "58. Paint Booth (Industrial)", baseCost: 4.62224E+77, production: 3.9526E+76, owned: 0 },
        { id: "agv_simple", name: "AGV (Simple)", imageFile: "59. AGV (Simple)", baseCost: 1.15556E+79, production: 1.0277E+78, owned: 0 },
        { id: "plc_system_basic", name: "PLC System (Basic)", imageFile: "60. PLC System (Basic)", baseCost: 2.8889E+80, production: 2.672E+79, owned: 0 },
        { id: "industrial_robot_arm_basic", name: "Robot Arm (Basic)", imageFile: "61. Robot Arm (Basic)", baseCost: 7.22224E+81, production: 6.9472E+80, owned: 0 },
        { id: "cnc_milling_machine_vmc_3axis", name: "CNC Mill (3-Axis VMC)", imageFile: "62. CNC Mill (3-Axis VMC)", baseCost: 1.80556E+83, production: 1.8063E+82, owned: 0 },
        { id: "cnc_lathe_turning_center_basic", name: "CNC Lathe (Basic)", imageFile: "63. CNC Lathe (Basic)", baseCost: 4.5139E+84, production: 4.6963E+83, owned: 0 },
        { id: "edm_machine_sinker", name: "EDM (Sinker)", imageFile: "64. EDM (Sinker)", baseCost: 1.12847E+86, production: 1.221E+85, owned: 0 },
        { id: "coordinate_measuring_machine_cmm", name: "CMM", imageFile: "65. CMM", baseCost: 2.82119E+87, production: 3.1747E+86, owned: 0 },
        { id: "robotic_welding_cell_single", name: "Robotic Welding Cell", imageFile: "66. Robotic Welding Cell", baseCost: 7.05297E+88, production: 8.2543E+87, owned: 0 },
        { id: "automated_assembly_station", name: "Automated Assembly Station", imageFile: "67. Automated Assembly Station", baseCost: 1.76324E+90, production: 2.1461E+89, owned: 0 },
        { id: "high_speed_stamping_press_small", name: "Stamping Press (High Speed)", imageFile: "68. Stamping Press (High Speed)", baseCost: 4.4081E+91, production: 5.5799E+90, owned: 0 },
        { id: "injection_molding_machine_medium", name: "Injection Molder (Medium)", imageFile: "69. Injection Molder (Medium)", baseCost: 1.10203E+93, production: 1.4508E+92, owned: 0 },
        { id: "blow_molding_machine_small", name: "Blow Molder (Small)", imageFile: "70. Blow Molder (Small)", baseCost: 2.75507E+94, production: 3.772E+93, owned: 0 },
        { id: "extrusion_machine_plastic", name: "Extrusion Machine (Plastic)", imageFile: "71. Extrusion Machine (Plastic)", baseCost: 6.88767E+95, production: 9.8073E+94, owned: 0 },
        { id: "advanced_packaging_station", name: "Advanced Packaging Station", imageFile: "72. Advanced Packaging Station", baseCost: 1.72192E+97, production: 2.5499E+96, owned: 0 },
        { id: "industrial_ct_scanner_small", name: "Industrial CT Scanner", imageFile: "73. Industrial CT Scanner", baseCost: 4.30479E+98, production: 6.6297E+97, owned: 0 },
        { id: "asrs_small", name: "AS/RS (Small)", imageFile: "74. AS/RS (Small)", baseCost: 1.0762E+100, production: 1.7237E+99, owned: 0 },
        { id: "cnc_gear_hobbing_machine", name: "CNC Gear Hobber", imageFile: "75. CNC Gear Hobber", baseCost: 2.6905E+101, production: 4.4817E+100, owned: 0 },
        { id: "electron_beam_welder_small", name: "Electron Beam Welder", imageFile: "76. Electron Beam Welder", baseCost: 6.72624E+102, production: 1.1652E+102, owned: 0 },
        { id: "laser_powder_bed_fusion_small", name: "Metal 3D Printer (LPBF)", imageFile: "77. Metal 3D Printer (LPBF)", baseCost: 1.68156E+104, production: 3.0296E+103, owned: 0 },
        { id: "flexible_manufacturing_cell", name: "Flexible Manufacturing Cell", imageFile: "78. Flexible Manufacturing Cell", baseCost: 4.2039E+105, production: 7.877E+104, owned: 0 },
        { id: "photolithography_stepper_basic", name: "Photolithography Stepper", imageFile: "79. Photolithography Stepper", baseCost: 1.05098E+107, production: 2.048E+106, owned: 0 },
        { id: "automated_fiber_placement_small", name: "AFP Machine (Small)", imageFile: "80. AFP Machine (Small)", baseCost: 2.62744E+108, production: 5.3247E+107, owned: 0 },
        { id: "cnc_5axis_machining_center", name: "CNC Mill (5-Axis)", imageFile: "81. CNC Mill (5-Axis)", baseCost: 6.5686E+109, production: 1.3844E+109, owned: 0 },
        { id: "multi_spindle_cnc_lathe", name: "CNC Lathe (Multi-Spindle)", imageFile: "82. CNC Lathe (Multi-Spindle)", baseCost: 1.64215E+111, production: 3.5995E+110, owned: 0 },
        { id: "wire_edm_machine", name: "EDM (Wire)", imageFile: "83. EDM (Wire)", baseCost: 4.10538E+112, production: 9.3587E+111, owned: 0 },
        { id: "optical_cmm", name: "Optical CMM", imageFile: "84. Optical CMM", baseCost: 1.02634E+114, production: 2.4333E+113, owned: 0 },
        { id: "advanced_robotic_cell", name: "Advanced Robotic Cell", imageFile: "85. Advanced Robotic Cell", baseCost: 2.56586E+115, production: 6.3265E+114, owned: 0 },
        { id: "fully_automated_assembly_line", name: "Automated Assembly Line", imageFile: "86. Automated Assembly Line", baseCost: 6.41465E+116, production: 1.6449E+116, owned: 0 },
        { id: "servo_stamping_press", name: "Servo Stamping Press", imageFile: "87. Servo Stamping Press", baseCost: 1.60366E+118, production: 4.2767E+117, owned: 0 },
        { id: "large_tonnage_injection_molder", name: "Injection Molder (Large)", imageFile: "88. Injection Molder (Large)", baseCost: 4.00916E+119, production: 1.1119E+119, owned: 0 },
        { id: "rotary_blow_molding_machine", name: "Blow Molder (Rotary)", imageFile: "89. Blow Molder (Rotary)", baseCost: 1.00229E+121, production: 2.891E+120, owned: 0 },
        { id: "metal_extrusion_press", name: "Metal Extrusion Press", imageFile: "90. Metal Extrusion Press", baseCost: 2.50572E+122, production: 7.5166E+121, owned: 0 },
        { id: "robotic_palletizing_system", name: "Robotic Palletizer", imageFile: "91. Robotic Palletizer", baseCost: 6.26431E+123, production: 1.9543E+123, owned: 0 },
        { id: "high_resolution_ct_scanner", name: "CT Scanner (High Res)", imageFile: "92. CT Scanner (High Res)", baseCost: 1.56608E+125, production: 5.0812E+124, owned: 0 },
        { id: "large_scale_asrs", name: "AS/RS (Large Scale)", imageFile: "93. AS/RS (Large Scale)", baseCost: 3.91519E+126, production: 1.3211E+126, owned: 0 },
        { id: "cnc_universal_grinding_machine", name: "CNC Universal Grinder", imageFile: "94. CNC Universal Grinder", baseCost: 9.78798E+127, production: 3.4349E+127, owned: 0 },
        { id: "vacuum_furnace", name: "Vacuum Furnace", imageFile: "95. Vacuum Furnace", baseCost: 2.44699E+129, production: 8.9306E+128, owned: 0 },
        { id: "direct_metal_laser_sintering", name: "Metal 3D Printer (DMLS)", imageFile: "96. Metal 3D Printer (DMLS)", baseCost: 6.11749E+130, production: 2.3219E+130, owned: 0 },
        { id: "fully_integrated_fms", name: "Integrated FMS", imageFile: "97. Integrated FMS", baseCost: 1.52937E+132, production: 6.037E+131, owned: 0 },
        { id: "euv_lithography_system", name: "EUV Lithography System", imageFile: "98. EUV Lithography System", baseCost: 3.82343E+133, production: 1.5696E+133, owned: 0 },
        { id: "large_scale_afp_machine", name: "AFP Machine (Large)", imageFile: "99. AFP Machine (Large)", baseCost: 9.55857E+134, production: 4.081E+134, owned: 0 },
        { id: "lights_out_smart_factory_module", name: "Smart Factory Module", imageFile: "100. Smart Factory Module", baseCost: 2.38964E+136, production: 1.061E+136, owned: 0 },
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
