#!/usr/bin/env ts-node
// tests/run-all-tests.ts

import * as fs from 'fs';
import * as path from 'path';

/**
 * Test runner that validates the complete ADN testing framework
 * This script verifies everything is working before running Jest
 */
class TestRunner {

    private static expectedDir = './tests/expected';
    private static assetsDir = './tests/assets';
    private static xmlDir = './tests/xml-dumps';
    private static actionManagerDir = './ActionManager';

    /**
     * Validate the complete test setup
     */
    static validateTestSetup(): boolean {
        console.log('🧪 ADN Testing Framework Validation\n');

        let allGood = true;

        // Check 1: Expected results
        console.log('📊 Checking expected results...');
        const expectedFiles = ['simple-title.json', 'complex-text.json', 'multi-layer-bounds.json'];

        for (const file of expectedFiles) {
            const filePath = path.join(this.expectedDir, file);
            if (fs.existsSync(filePath)) {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`  ✅ ${file}: ${content.testCase || 'structure OK'}`);
            } else {
                console.log(`  ❌ Missing: ${file}`);
                allGood = false;
            }
        }

        // Check 2: Test assets (focus on _updated01.psd files)
        console.log('\n📁 Checking test assets...');
        const assetFiles = fs.readdirSync(this.assetsDir).filter(f => f.endsWith('.psd'));
        const updatedFiles = assetFiles.filter(f => f.includes('_updated01'));
        console.log(`  ✅ Found ${assetFiles.length} PSD files (${updatedFiles.length} updated):`);
        updatedFiles.forEach(file => console.log(`    • ${file} (✓ XML source)`));

        // Check 3: XML dumps
        console.log('\n🔍 Checking XML dumps...');
        const xmlFiles = fs.readdirSync(this.xmlDir).filter(f => f.endsWith('.xml'));
        console.log(`  ✅ Found ${xmlFiles.length} XML files:`);
        xmlFiles.forEach(file => console.log(`    • ${file}`));

        // Check 4: Production ActionManager files
        console.log('\n🔧 Checking ActionManager production files...');
        const requiredFiles = [
            'ActionDescriptorNavigator.ts',
            'types.ts'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.actionManagerDir, file);
            if (fs.existsSync(filePath)) {
                const size = fs.statSync(filePath).size;
                console.log(`  ✅ ${file}: ${size} bytes (production file)`);
            } else {
                console.log(`  ❌ Missing: ${file}`);
                allGood = false;
            }
        }

        // Check 5: Dependencies
        console.log('\n📦 Checking dependencies...');
        try {
            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;
            const hasTsJest = packageJson.devDependencies?.['ts-jest'] || packageJson.dependencies?.['ts-jest'];

            console.log(`  ${hasJest ? '✅' : '❌'} Jest: ${hasJest ? 'installed' : 'missing'}`);
            console.log(`  ${hasTsJest ? '✅' : '❌'} ts-jest: ${hasTsJest ? 'installed' : 'missing'}`);

            if (!hasJest || !hasTsJest) {
                console.log('\n💡 Install missing dependencies:');
                console.log('   npm install --save-dev jest ts-jest @types/jest');
                allGood = false;
            }
        } catch (e) {
            console.log('  ❌ Error reading package.json');
            allGood = false;
        }

        // Summary
        console.log(`\n${allGood ? '🎉' : '⚠️ '} Test Setup Status: ${allGood ? 'READY' : 'NEEDS FIXES'}`);

        if (allGood) {
            console.log('\n🚀 Ready to run tests!');
            console.log('   npm test');
            console.log('\n📋 Test Coverage:');
            console.log('   • ActionDescriptorNavigator instantiation');
            console.log('   • Sentinel error handling');
            console.log('   • Criteria-based selection');
            console.log('   • Enumerable operations');
            console.log('   • Complex chaining safety');
            console.log('   • Production usage patterns');
        } else {
            console.log('\n🔧 Fix the issues above, then run:');
            console.log('   npx ts-node tests/run-all-tests.ts');
        }

        return allGood;
    }

    /**
     * Display expected results summary
     */
    static showExpectedResults(): void {
        console.log('\n📊 Expected Results Summary:');

        const expectedFiles = fs.readdirSync(this.expectedDir).filter(f => f.endsWith('.json'));

        for (const file of expectedFiles) {
            const filePath = path.join(this.expectedDir, file);
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`\n  📄 ${file}:`);
                console.log(`     Test Case: ${content.testCase || 'unknown'}`);
                console.log(`     Description: ${content.description || 'N/A'}`);

                if (content.validationCriteria) {
                    const criteria = Object.keys(content.validationCriteria);
                    console.log(`     Validation: ${criteria.length} criteria`);
                }
            } catch (e) {
                console.log(`  ❌ ${file}: Invalid JSON`);
            }
        }
    }

    /**
     * Show next steps
     */
    static showNextSteps(): void {
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Install Jest dependencies if missing');
        console.log('2. Run: npm test');
        console.log('3. Validate all tests pass');
        console.log('4. Copy proven ActionManager files to work project');

        console.log('\n📝 Commands:');
        console.log('   # Install dependencies (if needed):');
        console.log('   npm install --save-dev jest ts-jest @types/jest');
        console.log('');
        console.log('   # Run tests:');
        console.log('   npm test');
        console.log('');
        console.log('   # After tests pass, copy to work project:');
        console.log('   cp ActionManager/ActionDescriptorNavigator.ts /path/to/work/project/');
        console.log('   cp ActionManager/types.ts /path/to/work/project/');
        console.log('   cp es5-polyfills.js /path/to/work/project/');
    }
}

// Main execution
async function main() {
    try {
        const isReady = TestRunner.validateTestSetup();

        if (isReady) {
            TestRunner.showExpectedResults();
            console.log('\n✅ ALL SYSTEMS GO - Ready for testing!');
        } else {
            TestRunner.showNextSteps();
        }

    } catch (error) {
        console.error('❌ Error during validation:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}