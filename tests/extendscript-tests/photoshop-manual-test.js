// Manual Photoshop test - paste into ExtendScript console
#include "../dist/ActionDescriptorNavigator.js"

try {
    $.writeln("=== ADN Sentinel Test ===");
    
    var layer = ActionDescriptorNavigator.forCurrentLayer();
    $.writeln("Layer sentinel: " + layer.isSentinel);
    
    if (!layer.isSentinel) {
        var layerName = layer.getString('name');
        $.writeln("Layer name: " + layerName);
        
        var hasText = layer.hasKey('textKey');
        $.writeln("Has text: " + hasText);
        
        if (hasText) {
            var textObj = layer.getObject('textKey');
            var styleRanges = textObj.getList('textStyleRange');
            var count = styleRanges.getCount();
            $.writeln("Style ranges: " + count);
            
            if (count > 0) {
                var firstRange = styleRanges.getFirstWhere(function(range) {
                    return range.getInteger('from') === 0;
                });
                
                if (!firstRange.isSentinel) {
                    var textStyle = firstRange.getObject('textStyle');
                    var fontName = textStyle.getString('fontPostScriptName');
                    var fontSize = textStyle.getUnitDouble('sizeKey');
                    
                    $.writeln("Font: " + fontName);
                    $.writeln("Size: " + fontSize);
                    $.writeln("✅ SUCCESS: ADN working correctly!");
                } else {
                    $.writeln("⚠️ First range is sentinel");
                }
            }
        }
    }
    
} catch (error) {
    $.writeln("❌ ERROR: " + error.toString());
}