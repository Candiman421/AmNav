//tests/extendscript-tests/test-simple-title.js
// ExtendScript test file - runs in Photoshop
// Uses your built ADN: dist/ActionDescriptorNavigator.js

#include "../dist/ActionDescriptorNavigator.js"

function testSimpleTitle() {
    try {
        $.writeln("=== Testing Simple Title with ADN ===");

        // Test your actual ADN implementation
        var layer = ActionDescriptorNavigator.forCurrentLayer();

        var results = {
            testName: "simple-title",
            passed: false,
            layerName: layer.getString('name'),
            hasTextKey: layer.hasKey('textKey'),
            fontData: null,
            errors: []
        };

        if (results.hasTextKey) {
            var textObj = layer.getObject('textKey');
            var styleRanges = textObj.getList('textStyleRange');

            // Use criteria-based selection (your ADN feature)
            var firstRange = styleRanges.getFirstWhere(function (range) {
                return range.getInteger('from') === 0;
            });

            if (!firstRange.isSentinel) {
                var textStyle = firstRange.getObject('textStyle');

                results.fontData = {
                    fontName: textStyle.getString('fontPostScriptName'),
                    fontSize: textStyle.getUnitDouble('sizeKey'),
                    syntheticBold: textStyle.getBoolean('syntheticBold')
                };
            }
        }

        results.passed = true;

        $.writeln("Test Results:");
        $.writeln("  Layer Name: " + results.layerName);
        $.writeln("  Has Text: " + results.hasTextKey);
        if (results.fontData) {
            $.writeln("  Font: " + results.fontData.fontName);
            $.writeln("  Size: " + results.fontData.fontSize);
        }

        return results;

    } catch (error) {
        $.writeln("ERROR: " + error.toString());
        return { testName: "simple-title", passed: false, error: error.toString() };
    }
}

// Auto-run when script loads
testSimpleTitle();