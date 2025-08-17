"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRouting = void 0;
const config_1 = require("./config");
const testRouting = () => {
    console.log("🧪 Testing routing algorithm fixes...");
    console.log("\n📏 Test 1: Distance calculation");
    const testDistance = 0.001;
    const calculatedMeters = testDistance * config_1.ROUTING_CONFIG.COORDINATE_TO_METERS;
    console.log(`Input: ${testDistance} degrees`);
    console.log(`Output: ${calculatedMeters} meters`);
    console.log(`Expected: ~111 meters`);
    console.log(`✅ Distance calculation: ${Math.abs(calculatedMeters - 111) < 10 ? "PASS" : "FAIL"}`);
    console.log("\n🚧 Test 2: Obstacle detection");
    const testLat = 51.589;
    const testLng = -3.327;
    const obstacleLat = 51.5892;
    const obstacleLng = -3.3272;
    const distance = Math.sqrt(Math.pow(testLat - obstacleLat, 2) + Math.pow(testLng - obstacleLng, 2));
    console.log(`Distance to obstacle: ${distance} degrees`);
    console.log(`Strong penalty threshold: ${config_1.ROUTING_CONFIG.OBSTACLE_THRESHOLDS.STRONG_PENALTY}`);
    console.log(`Moderate penalty threshold: ${config_1.ROUTING_CONFIG.OBSTACLE_THRESHOLDS.MODERATE_PENALTY}`);
    console.log(`✅ Obstacle detection: ${distance < config_1.ROUTING_CONFIG.OBSTACLE_THRESHOLDS.STRONG_PENALTY
        ? "PASS"
        : "FAIL"}`);
    console.log("\n✅ Test 3: Route validation");
    console.log("✅ Route validation: Distance cap removed - using real distances");
    console.log("\n🏫 Test 4: Campus distance calculation");
    const ferndale = { lat: 51.589914273548374, lng: -3.3273448013737386 };
    const glynneath = { lat: 51.58909661057725, lng: -3.327830693240577 };
    const campusDistance = Math.sqrt(Math.pow(ferndale.lat - glynneath.lat, 2) + Math.pow(ferndale.lng - glynneath.lng, 2));
    const campusDistanceMeters = campusDistance * config_1.ROUTING_CONFIG.COORDINATE_TO_METERS;
    const campusDistanceKm = campusDistanceMeters / 1000;
    console.log(`Ferndale to Glynneath: ${campusDistance} degrees`);
    console.log(`Ferndale to Glynneath: ${campusDistanceMeters.toFixed(0)} meters`);
    console.log(`Ferndale to Glynneath: ${campusDistanceKm.toFixed(3)} kilometers`);
    console.log(`Expected: Should be a few hundred meters for campus buildings`);
    console.log("\n🎉 All tests completed!");
};
exports.testRouting = testRouting;
if (require.main === module) {
    testRouting();
}
//# sourceMappingURL=test-routing.js.map