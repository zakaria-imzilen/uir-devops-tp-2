/**
 * Test Data Management Strategy for FlowCraft Studio API Tests
 *
 * This module provides utilities for:
 * - Dynamic test data generation
 * - Test data cleanup
 * - Environment-specific data management
 * - Test isolation and parallel execution support
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class TestDataManager {
    constructor() {
        this.testRunId = crypto.randomUUID();
        this.createdResources = [];
        this.config = this.loadConfig();
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../test-data.json');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    /**
     * Generate unique test data for API testing
     */
    generateTestApp(suffix = '') {
        const timestamp = Date.now();
        const uniqueId = crypto.randomBytes(4).toString('hex');

        return {
            name: `API-Test-App-${timestamp}-${uniqueId}${suffix}`,
            html: `<html><body><h1>Test App ${uniqueId}</h1><p>Created: ${new Date().toISOString()}</p></body></html>`,
            css: `body { font-family: Arial, sans-serif; background: #f0f0f0; } h1 { color: #${uniqueId.slice(0, 6)}; }`,
            js: `console.log('Test app ${uniqueId} loaded at ${timestamp}');`
        };
    }

    /**
     * Generate test user data
     */
    generateTestUser(suffix = '') {
        const timestamp = Date.now();
        const uniqueId = crypto.randomBytes(4).toString('hex');

        return {
            email: `test-${uniqueId}-${timestamp}${suffix}@example.com`,
            password: `TestPass123!${uniqueId}`,
            name: `Test User ${uniqueId}`
        };
    }

    /**
     * Track created resources for cleanup
     */
    trackResource(type, id, metadata = {}) {
        this.createdResources.push({
            type,
            id,
            metadata,
            createdAt: new Date().toISOString()
        });
    }

    /**
     * Get invalid test cases for negative testing
     */
    getInvalidTestCases() {
        return this.config.invalidTestCases;
    }

    /**
     * Get environment-specific test data
     */
    getEnvironmentData(environment = 'local') {
        const envConfig = {
            local: {
                baseUrl: 'http://localhost:3000',
                timeout: 5000,
                retries: 3
            },
            staging: {
                baseUrl: process.env.VM_IP ? `http://${process.env.VM_IP}:8080` : 'http://staging.example.com',
                timeout: 10000,
                retries: 5
            }
        };

        return envConfig[environment] || envConfig.local;
    }

    /**
     * Generate data for parallel test execution
     */
    generateParallelTestData(testCount = 5) {
        const testSuites = [];

        for (let i = 0; i < testCount; i++) {
            testSuites.push({
                suite: `parallel-suite-${i}`,
                app: this.generateTestApp(`-parallel-${i}`),
                user: this.generateTestUser(`-parallel-${i}`)
            });
        }

        return testSuites;
    }

    /**
     * Export test data for Newman
     */
    exportForNewman(environment = 'local') {
        const testData = {
            testRunId: this.testRunId,
            environment: this.getEnvironmentData(environment),
            testApp: this.generateTestApp(),
            testUser: this.generateTestUser(),
            invalidCases: this.getInvalidTestCases(),
            timestamp: new Date().toISOString()
        };

        const outputPath = path.join(__dirname, `../generated-data-${this.testRunId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));

        return {
            dataFile: outputPath,
            testData
        };
    }

    /**
     * Cleanup generated test data files
     */
    cleanup() {
        const dataDir = path.join(__dirname, '../');
        const files = fs.readdirSync(dataDir);

        files.forEach(file => {
            if (file.startsWith('generated-data-') && file.endsWith('.json')) {
                const filePath = path.join(dataDir, file);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Cleaned up test data file: ${file}`);
                } catch (error) {
                    console.warn(`Failed to cleanup file ${file}:`, error.message);
                }
            }
        });
    }

    /**
     * Generate Newman globals for dynamic test data
     */
    generateNewmanGlobals(environment = 'local') {
        const envData = this.getEnvironmentData(environment);
        const testApp = this.generateTestApp();

        return [
            { key: 'TEST_RUN_ID', value: this.testRunId },
            { key: 'BASE_URL', value: envData.baseUrl },
            { key: 'TEST_APP_NAME', value: testApp.name },
            { key: 'TEST_APP_HTML', value: testApp.html },
            { key: 'TEST_APP_CSS', value: testApp.css },
            { key: 'TEST_APP_JS', value: testApp.js },
            { key: 'TEST_TIMEOUT', value: envData.timeout.toString() },
            { key: 'TIMESTAMP', value: Date.now().toString() }
        ];
    }
}

// Export for use in tests and scripts
module.exports = TestDataManager;

// CLI interface for direct usage
if (require.main === module) {
    const manager = new TestDataManager();
    const command = process.argv[2];
    const environment = process.argv[3] || 'local';

    switch (command) {
        case 'generate':
            const result = manager.exportForNewman(environment);
            console.log(`Test data generated: ${result.dataFile}`);
            console.log('Test data preview:', JSON.stringify(result.testData, null, 2));
            break;

        case 'globals':
            const globals = manager.generateNewmanGlobals(environment);
            console.log('Newman globals:', JSON.stringify(globals, null, 2));
            break;

        case 'cleanup':
            manager.cleanup();
            break;

        case 'parallel':
            const parallelData = manager.generateParallelTestData(parseInt(process.argv[3]) || 5);
            console.log('Parallel test data:', JSON.stringify(parallelData, null, 2));
            break;

        default:
            console.log('Usage: node test-data-manager.js <command> [environment]');
            console.log('Commands:');
            console.log('  generate [env]  - Generate test data file');
            console.log('  globals [env]   - Generate Newman global variables');
            console.log('  cleanup         - Clean up generated data files');
            console.log('  parallel [count] - Generate parallel test data');
            break;
    }
}