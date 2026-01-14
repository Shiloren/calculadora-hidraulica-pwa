/**
 * Engine Test Runner (Node.js)
 * Usage: node tests/engine.spec.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Engine } from '../src/js/engine/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CASES_PATH = path.join(__dirname, 'cases.json');

const loadCases = () => {
    return JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
};

const run = () => {
    console.log("=== HYDRO ENGINE TEST RUNNER ===");
    const cases = loadCases();
    let passed = 0;
    let failed = 0;

    cases.forEach(c => {
        console.log(`\n▶ Test: ${c.id} - ${c.description}`);

        try {
            const res = Engine.calculate(c.inputs);

            // Check Expectations
            let casePassed = true;
            for (const [key, expectedVal] of Object.entries(c.expected)) {
                const actual = res[key];

                // Numeric comparison with tolerance
                if (typeof expectedVal === 'number') {
                    const diff = Math.abs(actual - expectedVal);
                    if (diff > 0.05) { // 5% or absolute small number tolerance
                        console.error(`  ❌ Failed ${key}: Expected ~${expectedVal}, got ${actual}`);
                        casePassed = false;
                    }
                } else {
                    if (actual !== expectedVal) {
                        console.error(`  ❌ Failed ${key}: Expected '${expectedVal}', got '${actual}'`);
                        casePassed = false;
                    }
                }
            }

            if (casePassed) {
                console.log("  ✅ Passed");
                passed++;
            } else {
                console.error("  ❌ Failed"); // Added this line for overall test case failure
                failed++;
            }
        } catch (e) {
            console.error("  ❌ Exception:", e);
            failed++;
        }
    });

    console.log(`\n=== RESULT: ${passed}/${cases.length} PASSED ===`);
    if (failed > 0) process.exit(1);
};

run();
