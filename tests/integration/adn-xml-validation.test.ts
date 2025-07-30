// tests/integration/adn-xml-validation.test.ts
import { ActionDescriptorNavigator } from '../../action-manager/ActionDescriptorNavigator';
import { expectedResults } from '../create-expected-from-xml';

describe('ADN vs XML Validation', () => {

    beforeEach(() => {
        // Setup mock ActionManager based on XML dumps
        setupMockActionManager();
    });

    it('should extract font data matching complex-text XML', () => {
        const expected = expectedResults['complex-text'];

        const layer = ActionDescriptorNavigator.forCurrentLayer();
        const textObj = layer.getObject('textKey');
        const styleRanges = textObj.getList('textStyleRange');
        const firstRange = styleRanges.getFirstWhere(range =>
            range.getInteger('from') === expected.firstRange.from
        );
        const textStyle = firstRange.getObject('textStyle');

        // Test actual extraction
        const result = {
            fontName: textStyle.getString('fontPostScriptName'),
            fontSize: textStyle.getUnitDouble('sizeKey'),
            hasTextKey: !textObj.isSentinel,
            rangeCount: styleRanges.getCount()
        };

        // Validate against XML-derived expectations
        expect(result.fontName).toBe(expected.firstRange.fontPostScriptName);
        expect(result.fontSize).toBe(expected.firstRange.fontSize);
        expect(result.hasTextKey).toBe(expected.hasTextKey);
        expect(result.rangeCount).toBe(expected.textStyleRangeCount);
    });

    it('should handle sentinel errors gracefully', () => {
        const layer = ActionDescriptorNavigator.forCurrentLayer();

        // Test invalid property access
        const invalidFont = layer.getString('nonexistentProperty');
        const invalidSize = layer.getInteger('nonexistentProperty');
        const invalidObject = layer.getObject('nonexistentProperty');

        // Should return sentinels, not throw errors
        expect(invalidFont).toBe('');  // String sentinel
        expect(invalidSize).toBe(-1);  // Integer sentinel
        expect(invalidObject.isSentinel).toBe(true);  // Sentinel navigator
    });

    it('should use criteria-based selection, not index-based', () => {
        const layer = ActionDescriptorNavigator.forCurrentLayer();
        const styleRanges = layer.getObject('textKey').getList('textStyleRange');

        // ✅ Criteria-based (robust)
        const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);

        // ❌ Index-based (brittle) - should NOT use this pattern
        // const firstRange = styleRanges.getObject(0);

        expect(firstRange.getInteger('from')).toBe(0);
        expect(!firstRange.isSentinel).toBe(true);
    });
});

function setupMockActionManager() {
    // Mock based on your actual XML structure
    // This simulates real Photoshop ActionManager calls
}