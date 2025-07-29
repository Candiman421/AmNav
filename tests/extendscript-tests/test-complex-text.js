//tests/extendscript-tests/test-complex-text.js

#include "../dist/ActionDescriptorNavigator.js"

function testComplexText() {
    try {
        $.writeln("=== Testing Complex Text with ADN ===");

        var layer = ActionDescriptorNavigator.forCurrentLayer();
        var textObj = layer.getObject('textKey');
        var styleRanges = textObj.getList('textStyleRange');

        // Test multiple range processing (your ADN feature)
        var allRanges = styleRanges.getAllWhere(function (range) {
            return range.getInteger('to') > range.getInteger('from');
        });

        var results = {
            testName: "complex-text",
            totalRanges: allRanges.length,
            rangeDetails: []
        };

        for (var i = 0; i < allRanges.length; i++) {
            var range = allRanges[i];
            var style = range.getObject('textStyle');

            results.rangeDetails.push({
                from: range.getInteger('from'),
                to: range.getInteger('to'),
                fontName: style.getString('fontPostScriptName'),
                fontSize: style.getUnitDouble('sizeKey')
            });
        }

        $.writeln("Found " + results.totalRanges + " text ranges");
        for (var j = 0; j < results.rangeDetails.length; j++) {
            var detail = results.rangeDetails[j];
            $.writeln("  Range " + j + ": " + detail.from + "-" + detail.to + " (" + detail.fontName + ")");
        }

        return results;

    } catch (error) {
        $.writeln("ERROR: " + error.toString());
        return { testName: "complex-text", passed: false, error: error.toString() };
    }
}

testComplexText();