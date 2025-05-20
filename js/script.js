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
        { id: "safety_glasses", name: "Safety Glasses", imageFile: "1. Safety Glasses", baseCost: 30, production: 0.3, owned: 0 },
        { id: "gloves", name: "Gloves", imageFile: "2. Gloves", baseCost: 150, production: 1.53, owned: 0 },
        { id: "hammer", name: "Hammer", imageFile: "3. Hammer", baseCost: 750, production: 7.803, owned: 0 },
        { id: "screwdriver_set", name: "Screwdriver Set", imageFile: "4. Screwdriver Set", baseCost: 3750, production: 39.7953, owned: 0 },
        { id: "pliers", name: "Pliers", imageFile: "5. Pliers", baseCost: 18750, production: 202.95603, owned: 0 },
        { id: "wrench_set", name: "Wrench Set", imageFile: "6. Wrench Set", baseCost: 93750, production: 1035.075753, owned: 0 },
        { id: "utility_knife_box_cutter", name: "Utility Knife/Box Cutter", imageFile: "7. Utility Knife/Box Cutter", baseCost: 468750, production: 5278.88634, owned: 0 },
        { id: "measuring_tape", name: "Measuring Tape", imageFile: "8. Measuring Tape", baseCost: 2343750, production: 26922.32034, owned: 0 },
        { id: "hand_saw", name: "Hand Saw", imageFile: "9. Hand Saw", baseCost: 11718750, production: 137303.8337, owned: 0 },
        { id: "chisel_set", name: "Chisel Set", imageFile: "10. Chisel Set", baseCost: 58593750, production: 700249.5519, owned: 0 },
        { id: "file_set", name: "File Set", imageFile: "11. File Set", baseCost: 292968750, production: 3571272.715, owned: 0 },
        { id: "manual_clamps", name: "Manual Clamps", imageFile: "12. Manual Clamps", baseCost: 1464843750, production: 18213490.85, owned: 0 },
        { id: "manual_hand_drill", name: "Manual Hand Drill", imageFile: "13. Manual Hand Drill", baseCost: 7324218750, production: 92888803.31, owned: 0 },
        { id: "pop_rivet_gun_manual", name: "Pop Rivet Gun (Manual)", imageFile: "14. Pop Rivet Gun (Manual)", baseCost: 36621093750, production: 473732896.9, owned: 0 },
        { id: "workbench", name: "Workbench", imageFile: "15. Workbench", baseCost: 1.83105E+11, production: 2416037774, owned: 0 },
        { id: "vise", name: "Vise", imageFile: "16. Vise", baseCost: 9.15527E+11, production: 12321792648, owned: 0 },
        { id: "manual_grease_gun", name: "Manual Grease Gun", imageFile: "17. Manual Grease Gun", baseCost: 4.57764E+12, production: 62841142506, owned: 0 },
        { id: "caulking_gun", name: "Caulking Gun", imageFile: "18. Caulking Gun", baseCost: 2.28882E+13, production: 3.2049E+11, owned: 0 },
        { id: "broom_and_dustpan", name: "Broom & Dustpan", imageFile: "19. Broom & Dustpan", baseCost: 1.14441E+14, production: 1.6345E+12, owned: 0 },
        { id: "basic_soldering_iron", name: "Basic Soldering Iron", imageFile: "20. Basic Soldering Iron", baseCost: 5.72205E+14, production: 8.33594E+12, owned: 0 },
        { id: "electric_drill", name: "Electric Drill", imageFile: "21. Electric Drill", baseCost: 2.86102E+15, production: 4.25133E+13, owned: 0 },
        { id: "jigsaw", name: "Jigsaw", imageFile: "22. Jigsaw", baseCost: 1.43051E+16, production: 2.16818E+14, owned: 0 },
        { id: "circular_saw", name: "Circular Saw", imageFile: "23. Circular Saw", baseCost: 7.15256E+16, production: 1.10577E+15, owned: 0 },
        { id: "orbital_sander", name: "Orbital Sander", imageFile: "24. Orbital Sander", baseCost: 3.57628E+17, production: 5.63943E+15, owned: 0 },
        { id: "angle_grinder", name: "Angle Grinder", imageFile: "25. Angle Grinder", baseCost: 1.78814E+18, production: 2.87611E+16, owned: 0 },
        { id: "power_screwdriver_impact_driver", name: "Power Screwdriver/Impact Driver", imageFile: "26. Power Screwdriver/Impact Driver", baseCost: 8.9407E+18, production: 1.46682E+17, owned: 0 },
        { id: "heat_gun", name: "Heat Gun", imageFile: "27. Heat Gun", baseCost: 4.47035E+19, production: 7.48076E+17, owned: 0 },
        { id: "rotary_tool", name: "Rotary Tool", imageFile: "28. Rotary Tool", baseCost: 2.23517E+20, production: 3.81519E+18, owned: 0 },
        { id: "bench_grinder", name: "Bench Grinder", imageFile: "29. Bench Grinder", baseCost: 1.11759E+21, production: 1.94575E+19, owned: 0 },
        { id: "belt_sander", name: "Belt Sander", imageFile: "30. Belt Sander", baseCost: 5.58794E+21, production: 9.92331E+19, owned: 0 },
        { id: "drill_press", name: "Drill Press", imageFile: "31. Drill Press", baseCost: 2.79397E+22, production: 5.06089E+20, owned: 0 },
        { id: "scroll_saw", name: "Scroll Saw", imageFile: "32. Scroll Saw", baseCost: 1.39698E+23, production: 2.58105E+21, owned: 0 },
        { id: "small_air_compressor", name: "Small Air Compressor", imageFile: "33. Small Air Compressor", baseCost: 6.98492E+23, production: 1.31634E+22, owned: 0 },
        { id: "pneumatic_nail_gun_stapler", name: "Pneumatic Nail Gun/Stapler", imageFile: "34. Pneumatic Nail Gun/Stapler", baseCost: 3.49246E+24, production: 6.71332E+22, owned: 0 },
        { id: "shop_vacuum", name: "Shop Vacuum", imageFile: "35. Shop Vacuum", baseCost: 1.74623E+25, production: 3.42379E+23, owned: 0 },
        { id: "soldering_station", name: "Soldering Station", imageFile: "36. Soldering Station", baseCost: 8.73115E+25, production: 1.74613E+24, owned: 0 },
        { id: "manual_arbor_press", name: "Manual Arbor Press", imageFile: "37. Manual Arbor Press", baseCost: 4.36557E+26, production: 8.90528E+24, owned: 0 },
        { id: "manual_sheet_metal_bender", name: "Manual Sheet Metal Bender", imageFile: "38. Manual Sheet Metal Bender", baseCost: 2.18279E+27, production: 4.54169E+25, owned: 0 },
        { id: "parts_washer", name: "Parts Washer", imageFile: "39. Parts Washer", baseCost: 1.09139E+28, production: 2.31626E+26, owned: 0 },
        { id: "small_tumbler_deburring_machine", name: "Small Tumbler/Deburring Machine", imageFile: "40. Small Tumbler/Deburring Machine", baseCost: 5.45697E+28, production: 1.18129E+27, owned: 0 },
        { id: "table_saw", name: "Table Saw", imageFile: "41. Table Saw", baseCost: 2.72848E+29, production: 6.0246E+27, owned: 0 },
        { id: "miter_saw_chop_saw", name: "Miter Saw / Chop Saw", imageFile: "42. Miter Saw / Chop Saw", baseCost: 1.36424E+30, production: 3.07255E+28, owned: 0 },
        { id: "band_saw", name: "Band Saw", imageFile: "43. Band Saw", baseCost: 6.82121E+30, production: 1.567E+29, owned: 0 },
        { id: "jointer", name: "Jointer", imageFile: "44. Jointer", baseCost: 3.41061E+31, production: 7.99169E+29, owned: 0 },
        { id: "planer_thicknesser", name: "Planer/Thicknesser", imageFile: "45. Planer/Thicknesser", baseCost: 1.7053E+32, production: 4.07576E+30, owned: 0 },
        { id: "lathe", name: "Lathe", imageFile: "46. Lathe", baseCost: 8.52651E+32, production: 2.07864E+31, owned: 0 },
        { id: "milling_machine", name: "Milling Machine", imageFile: "47. Milling Machine", baseCost: 4.26326E+33, production: 1.06011E+32, owned: 0 },
        { id: "welder_basic_stick_or_mig", name: "Welder (Basic Stick or MIG)", imageFile: "48. Welder (Basic Stick or MIG)", baseCost: 2.13163E+34, production: 5.40654E+32, owned: 0 },
        { id: "plasma_cutter_handheld_small", name: "Plasma Cutter (Handheld small)", imageFile: "49. Plasma Cutter (Handheld small)", baseCost: 1.06581E+35, production: 2.75734E+33, owned: 0 },
        { id: "hydraulic_press_manual_pump", name: "Hydraulic Press (Manual pump)", imageFile: "50. Hydraulic Press (Manual pump)", baseCost: 5.32907E+35, production: 1.40624E+34, owned: 0 },
        { id: "powder_coating_gun_and_small_oven", name: "Powder Coating Gun & Small Oven", imageFile: "51. Powder Coating Gun & Small Oven", baseCost: 2.66454E+36, production: 7.17183E+34, owned: 0 },
        { id: "sandblasting_cabinet", name: "Sandblasting Cabinet", imageFile: "52. Sandblasting Cabinet", baseCost: 1.33227E+37, production: 3.65763E+35, owned: 0 },
        { id: "pedestal_grinder", name: "Pedestal Grinder", imageFile: "53. Pedestal Grinder", baseCost: 6.66134E+37, production: 1.86539E+36, owned: 0 },
        { id: "engine_hoist_shop_crane", name: "Engine Hoist/Shop Crane", imageFile: "54. Engine Hoist/Shop Crane", baseCost: 3.33067E+38, production: 9.51351E+36, owned: 0 },
        { id: "basic_conveyor_belt_section", name: "Basic Conveyor Belt Section", imageFile: "55. Basic Conveyor Belt Section", baseCost: 1.66533E+39, production: 4.85189E+37, owned: 0 },
        { id: "industrial_shelving_racking", name: "Industrial Shelving/Racking", imageFile: "56. Industrial Shelving/Racking", baseCost: 8.32667E+39, production: 2.47446E+38, owned: 0 },
        { id: "pallet_jack_manual", name: "Pallet Jack (Manual)", imageFile: "57. Pallet Jack (Manual)", baseCost: 4.16334E+40, production: 1.26198E+39, owned: 0 },
        { id: "benchtop_injection_molding_machine", name: "Benchtop Injection Molding Machine", imageFile: "58. Benchtop Injection Molding Machine", baseCost: 2.08167E+41, production: 6.43608E+39, owned: 0 },
        { id: "vacuum_former", name: "Vacuum Former", imageFile: "59. Vacuum Former", baseCost: 1.04083E+42, production: 3.2824E+40, owned: 0 },
        { id: "ultrasonic_cleaner", name: "Ultrasonic Cleaner", imageFile: "60. Ultrasonic Cleaner", baseCost: 5.20417E+42, production: 1.67402E+41, owned: 0 },
        { id: "larger_air_compressor", name: "Larger Air Compressor", imageFile: "61. Larger Air Compressor", baseCost: 2.60209E+43, production: 8.53752E+41, owned: 0 },
        { id: "forklift", name: "Forklift", imageFile: "62. Forklift", baseCost: 1.30104E+44, production: 4.35414E+42, owned: 0 },
        { id: "tig_welder", name: "TIG Welder", imageFile: "63. TIG Welder", baseCost: 6.50521E+44, production: 2.22061E+43, owned: 0 },
        { id: "cnc_router_small_3_axis", name: "CNC Router (Small 3-axis)", imageFile: "64. CNC Router (Small 3-axis)", baseCost: 3.25261E+45, production: 1.13251E+44, owned: 0 },
        { id: "cnc_plasma_cutter_table", name: "CNC Plasma Cutter Table", imageFile: "65. CNC Plasma Cutter Table", baseCost: 1.6263E+46, production: 5.77581E+44, owned: 0 },
        { id: "press_brake_hydraulic_basic_cnc", name: "Press Brake (Hydraulic basic CNC)", imageFile: "66. Press Brake (Hydraulic basic CNC)", baseCost: 8.13152E+46, production: 2.94566E+45, owned: 0 },
        { id: "sheet_metal_shear_powered", name: "Sheet Metal Shear (Powered)", imageFile: "67. Sheet Metal Shear (Powered)", baseCost: 4.06576E+47, production: 1.50229E+46, owned: 0 },
        { id: "turret_punch_press", name: "Turret Punch Press", imageFile: "68. Turret Punch Press", baseCost: 2.03288E+48, production: 7.66166E+46, owned: 0 },
        { id: "industrial_oven_furnace", name: "Industrial Oven/Furnace", imageFile: "69. Industrial Oven/Furnace", baseCost: 1.01644E+49, production: 3.90745E+47, owned: 0 },
        { id: "surface_grinder", name: "Surface Grinder", imageFile: "70. Surface Grinder", baseCost: 5.0822E+49, production: 1.9928E+48, owned: 0 },
        { id: "cylindrical_grinder", name: "Cylindrical Grinder", imageFile: "71. Cylindrical Grinder", baseCost: 2.5411E+50, production: 1.01633E+49, owned: 0 },
        { id: "industrial_mixer_blender", name: "Industrial Mixer/Blender", imageFile: "72. Industrial Mixer/Blender", baseCost: 1.27055E+51, production: 5.18327E+49, owned: 0 },
        { id: "packaging_machine_semi_auto", name: "Packaging Machine (Semi-auto)", imageFile: "73. Packaging Machine (Semi-auto)", baseCost: 6.35275E+51, production: 2.64347E+50, owned: 0 },
        { id: "industrial_3d_printer_fdm_sla", name: "Industrial 3D Printer (FDM/SLA)", imageFile: "74. Industrial 3D Printer (FDM/SLA)", baseCost: 3.17637E+52, production: 1.34817E+51, owned: 0 },
        { id: "water_jet_cutter", name: "Water Jet Cutter", imageFile: "75. Water Jet Cutter", baseCost: 1.58819E+53, production: 6.87566E+51, owned: 0 },
        { id: "laser_engraver_cutter", name: "Laser Engraver/Cutter", imageFile: "76. Laser Engraver/Cutter", baseCost: 7.94093E+53, production: 3.50659E+52, owned: 0 },
        { id: "paint_booth_basic_industrial", name: "Paint Booth (Basic industrial)", imageFile: "77. Paint Booth (Basic industrial)", baseCost: 3.97047E+54, production: 1.78836E+53, owned: 0 },
        { id: "automated_guided_vehicle_agv", name: "Automated Guided Vehicle (AGV)", imageFile: "78. Automated Guided Vehicle (AGV)", baseCost: 1.98523E+55, production: 9.12063E+53, owned: 0 },
        { id: "programmable_logic_controller_plc_system", name: "Programmable Logic Controller (PLC) System", imageFile: "79. Programmable Logic Controller (PLC) System", baseCost: 9.92617E+55, production: 4.65152E+54, owned: 0 },
        { id: "industrial_robot_arm_pick_and_place", name: "Industrial Robot Arm (Pick-and-Place)", imageFile: "80. Industrial Robot Arm (Pick-and-Place)", baseCost: 4.96308E+56, production: 2.37228E+55, owned: 0 },
        { id: "cnc_milling_machine_vmc_3_5_axis", name: "CNC Milling Machine (VMC 3-5 axis)", imageFile: "81. CNC Milling Machine (VMC 3-5 axis)", baseCost: 2.48154E+57, production: 1.20986E+56, owned: 0 },
        { id: "cnc_lathe_turning_center", name: "CNC Lathe/Turning Center", imageFile: "82. CNC Lathe/Turning Center", baseCost: 1.24077E+58, production: 6.17029E+56, owned: 0 },
        { id: "electrical_discharge_machine_edm", name: "Electrical Discharge Machine (EDM)", imageFile: "83. Electrical Discharge Machine (EDM)", baseCost: 6.20385E+58, production: 3.14685E+57, owned: 0 },
        { id: "coordinate_measuring_machine_cmm", name: "Coordinate Measuring Machine (CMM)", imageFile: "84. Coordinate Measuring Machine (CMM)", baseCost: 3.10193E+59, production: 1.60489E+58, owned: 0 },
        { id: "robotic_welding_cell", name: "Robotic Welding Cell", imageFile: "85. Robotic Welding Cell", baseCost: 1.55096E+60, production: 8.18495E+58, owned: 0 },
        { id: "automated_assembly_line", name: "Automated Assembly Line", imageFile: "86. Automated Assembly Line", baseCost: 7.75482E+60, production: 4.17432E+59, owned: 0 },
        { id: "high_speed_stamping_press", name: "High-Speed Stamping Press", imageFile: "87. High-Speed Stamping Press", baseCost: 3.87741E+61, production: 2.12891E+60, owned: 0 },
        { id: "injection_molding_machine_large", name: "Injection Molding Machine (Large)", imageFile: "88. Injection Molding Machine (Large)", baseCost: 1.9387E+62, production: 1.08574E+61, owned: 0 },
        { id: "blow_molding_machine", name: "Blow Molding Machine", imageFile: "89. Blow Molding Machine", baseCost: 9.69352E+62, production: 5.53728E+61, owned: 0 },
        { id: "extrusion_machine", name: "Extrusion Machine", imageFile: "90. Extrusion Machine", baseCost: 4.84676E+63, production: 2.82401E+62, owned: 0 },
        { id: "advanced_packaging_line", name: "Advanced Packaging Line", imageFile: "91. Advanced Packaging Line", baseCost: 2.42338E+64, production: 1.44025E+63, owned: 0 },
        { id: "industrial_ct_scanner", name: "Industrial CT Scanner", imageFile: "92. Industrial CT Scanner", baseCost: 1.21169E+65, production: 7.34526E+63, owned: 0 },
        { id: "automated_storage_and_retrieval_system_asrs", name: "Automated Storage and Retrieval System (AS/RS)", imageFile: "93. Automated Storage and Retrieval System (AS/RS)", baseCost: 6.05845E+65, production: 3.74608E+64, owned: 0 },
        { id: "cnc_gear_hobbing_shaping_machine", name: "CNC Gear Hobbing/Shaping Machine", imageFile: "94. CNC Gear Hobbing/Shaping Machine", baseCost: 3.02923E+66, production: 1.9105E+65, owned: 0 },
        { id: "electron_beam_welder", name: "Electron Beam Welder", imageFile: "95. Electron Beam Welder", baseCost: 1.51461E+67, production: 9.74356E+65, owned: 0 },
        { id: "laser_powder_bed_fusion_lpbf_metal_3d_printer", name: "Laser Powder Bed Fusion (LPBF) Metal 3D Printer", imageFile: "96. Laser Powder Bed Fusion (LPBF) Metal 3D Printer", baseCost: 7.57306E+67, production: 4.96922E+66, owned: 0 },
        { id: "flexible_manufacturing_system_fms", name: "Flexible Manufacturing System (FMS)", imageFile: "97. Flexible Manufacturing System (FMS)", baseCost: 3.78653E+68, production: 2.5343E+67, owned: 0 },
        { id: "semiconductor_photolithography_stepper_scanner", name: "Semiconductor Photolithography Stepper/Scanner", imageFile: "98. Semiconductor Photolithography Stepper/Scanner", baseCost: 1.89327E+69, production: 1.29249E+68, owned: 0 },
        { id: "automated_fiber_placement_afp_machine", name: "Automated Fiber Placement (AFP) Machine", imageFile: "99. Automated Fiber Placement (AFP) Machine", baseCost: 9.46633E+69, production: 6.59172E+68, owned: 0 },
        { id: "fully_autonomous_lights_out_smart_factory_module", name: "Fully Autonomous 'Lights-Out' Smart Factory Module", imageFile: "100. Fully Autonomous 'Lights-Out' Smart Factory Module", baseCost: 4.73317E+70, production: 3.36178E+69, owned: 0 },
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
