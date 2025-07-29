// tests/setup.ts
// Jest setup file for ActionDescriptorNavigator testing

/**
 * Setup file for Jest tests
 * Configures the testing environment for ActionDescriptorNavigator
 */

// Extend global namespace to allow Jest mocking
declare global {
    namespace jest {
        interface Matchers<R> {
            // Add custom matchers here if needed
        }
    }

    // Allow assignment to global ExtendScript types for mocking
    var $: any;
    var ActionReference: any;
    var ActionDescriptor: any;
    var ActionList: any;
    var executeActionGet: any;
    var executeAction: any;
    var stringIDToTypeID: any;
    var typeIDToStringID: any;
    var charIDToTypeID: any;
    var typeIDToCharID: any;
}

// Mock ExtendScript globals for testing environment
(global as any).$ = {
    writeln: jest.fn((message: string) => {
        // In test environment, redirect ExtendScript logging to console
        console.log(`[ExtendScript]: ${message}`);
    })
};

// Mock ActionManager globals (these don't exist in Node.js)
(global as any).ActionReference = jest.fn().mockImplementation(() => ({
    putEnumerated: jest.fn(),
    putIndex: jest.fn(),
    putProperty: jest.fn(),
    putName: jest.fn(),
    putIdentifier: jest.fn(),
    putOffset: jest.fn()
}));

(global as any).ActionDescriptor = jest.fn().mockImplementation(() => ({
    count: 0,
    hasKey: jest.fn(() => false),
    getObjectValue: jest.fn(() => new ((global as any).ActionDescriptor)()),
    getList: jest.fn(() => new ((global as any).ActionList)()),
    getString: jest.fn(() => ''),
    getDouble: jest.fn(() => -1),
    getInteger: jest.fn(() => -1),
    getBoolean: jest.fn(() => false),
    getEnumerationValue: jest.fn(() => -1),
    getEnumerationType: jest.fn(() => -1),
    getReference: jest.fn(() => new ((global as any).ActionReference)()),
    getClass: jest.fn(() => -1),
    getPath: jest.fn(() => null),
    getData: jest.fn(() => ''),
    getType: jest.fn(() => -1),
    getUnitDoubleType: jest.fn(() => -1),
    getUnitDoubleValue: jest.fn(() => -1),
    getLargeInteger: jest.fn(() => -1),
    getObjectType: jest.fn(() => -1)
}));

(global as any).ActionList = jest.fn().mockImplementation(() => ({
    count: 0,
    getObjectValue: jest.fn(() => new ((global as any).ActionDescriptor)()),
    getString: jest.fn(() => ''),
    getDouble: jest.fn(() => -1),
    getInteger: jest.fn(() => -1),
    getBoolean: jest.fn(() => false),
    getEnumerationValue: jest.fn(() => -1),
    getReference: jest.fn(() => new ((global as any).ActionReference)()),
    getClass: jest.fn(() => -1),
    getList: jest.fn(() => new ((global as any).ActionList)()),
    getType: jest.fn(() => -1),
    getData: jest.fn(() => ''),
    getPath: jest.fn(() => null),
    getUnitDoubleType: jest.fn(() => -1),
    getUnitDoubleValue: jest.fn(() => -1),
    getLargeInteger: jest.fn(() => -1),
    getObjectType: jest.fn(() => -1),
    getEnumerationType: jest.fn(() => -1)
}));

// Mock ActionManager functions
(global as any).executeActionGet = jest.fn(() => new ((global as any).ActionDescriptor)());
(global as any).executeAction = jest.fn(() => new ((global as any).ActionDescriptor)());
(global as any).stringIDToTypeID = jest.fn((str: string) => str.length);
(global as any).typeIDToStringID = jest.fn((id: number) => `string_${id}`);
(global as any).charIDToTypeID = jest.fn((str: string) => str.charCodeAt(0));
(global as any).typeIDToCharID = jest.fn((id: number) => String.fromCharCode(id));

// Setup test environment
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

export {};

console.log('✅ Jest setup complete - ActionDescriptorNavigator test environment ready');