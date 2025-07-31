//ps/testScoreScript.ts
/**
 * Example usage of parallel systems approach
 * Demonstrates ActionManager navigation + DOM operations working together
 * 
 * NOTE: Final architecture with proper imports
 */

import { ActionDescriptorNavigator } from './ps-nav';

// ActionManager Constants (sentinels for error checking)
import { SENTINELS } from './adn-types';

// DOM operations (direct property access)  
import { getDOMLayerByName } from './ps';

// Color sampling function (DOM-based)
import { samplePixelColor } from './ps-util';



        // ===================================================================
        // PARALLEL SYSTEMS USAGE PATTERN
        // ===================================================================

        const layerName = 'Title';

        // Find layer in both systems when needed
        const navigator = ActionDescriptorNavigator.forLayerByName(layerName);  // ActionManager
        const domLayer = getDOMLayerByName(layerName);                          // DOM

        // ===================================================================
        // USE ACTIONMANAGER FOR TEXT ANALYSIS (fluent, never crashes)
        // ===================================================================

        // Navigate to text style information with fluent chaining
        const textStyle = navigator
            .getObject('textKey')
            .getList('textStyleRange')
            .getFirstWhere(range => range.getInteger('from') === 0)
            .getObject('textStyle');

        // Extract text properties (sentinel-safe, no if checks needed during chain)
        const fontName = textStyle.getString('fontPostScriptName');
        const fontSize = textStyle.getUnitDouble('sizeKey');
        const isBold = textStyle.getBoolean('bold');

        // Get layer bounds using ActionManager
        const bounds = navigator.getBounds();

        // ===================================================================
        // USE DOM FOR OPERATIONS THAT REQUIRE DOM OBJECTS
        // ===================================================================

        // Color sampling requires DOM layer object
        const pixelColor = domLayer ? samplePixelColor(domLayer, { x: 50, y: 50 }) : null;

        // Layer visibility check via DOM (simple property access)
        const isVisible = domLayer ? domLayer.visible : false;

        // Layer opacity via DOM
        const opacity = domLayer ? domLayer.opacity : 0;

        // ===================================================================
        // VALIDATION AND SCORING
        // ===================================================================

        // Validate ActionManager results (check for sentinels)
        const hasValidText = fontName !== SENTINELS["string"] &&
            fontSize !== SENTINELS["double"] &&
            bounds.width !== SENTINELS["double"];

        // Validate DOM results (check for null/undefined)
        const hasValidDOM = domLayer !== null && pixelColor !== null;

        // Score based on both systems
        const isCorrectFont = fontName === 'Arial';
        const isCorrectSize = fontSize >= 20 && fontSize <= 30;
        const isCorrectColor = pixelColor && pixelColor.red > 200;
        const isCorrectVisibility = isVisible === true;

        return {
            isCorrect: hasValidText &&
                hasValidDOM &&
                isCorrectFont &&
                isCorrectSize &&
                isCorrectColor &&
                isCorrectVisibility,

            feedback: this.generateFeedback({
                fontName,
                fontSize,
                isBold,
                pixelColor,
                bounds,
                hasValidText,
                hasValidDOM
            })
        };
    }

    private generateFeedback(data: any): string {
        const issues: string[] = [];

        // ActionManager-based feedback
        if (data.fontName === SENTINELS["string"]) {
            issues.push("Could not detect font information");
        } else if (data.fontName !== 'Arial') {
            issues.push(`Expected Arial font, found: ${data.fontName}`);
        }

        if (data.fontSize === SENTINELS["double"]) {
            issues.push("Could not detect font size");
        } else if (data.fontSize < 20 || data.fontSize > 30) {
            issues.push(`Font size should be 20-30pt, found: ${data.fontSize}pt`);
        }

        // DOM-based feedback
        if (!data.hasValidDOM) {
            issues.push("Layer not accessible for color analysis");
        } else if (data.pixelColor && data.pixelColor.red <= 200) {
            issues.push("Text color should be brighter red");
        }

        return issues.length > 0 ? issues.join("; ") : "All requirements met";
    }
}

// ===================================================================
// ADDITIONAL EXAMPLES
// ===================================================================

/**
 * Example: Multi-layer analysis using parallel approach
 */
export function analyzeMultipleLayers(): void {
    // Note: ActionDescriptor, ActionReference, ActionList are global from index.d.ts
    // Only need these imports:
    // import { ActionDescriptorNavigator } from './ps-nav';
    // import { SENTINELS, getDOMLayerByName } from './ps';

    const layerNames = ['Title', 'Subtitle', 'Body', 'Footer'];

    const analysis = layerNames.map(name => {
        // Get both system representations
        const navigator = ActionDescriptorNavigator.forLayerByName(name);
        const domLayer = getDOMLayerByName(name);

        return {
            name: name,
            // ActionManager data (fluent, sentinel-safe)
            font: navigator.getObject('textKey').getString('fontPostScriptName'),
            size: navigator.getObject('textKey').getUnitDouble('sizeKey'),
            bounds: navigator.getBounds(),

            // DOM data (direct property access)
            visible: domLayer ? domLayer.visible : false,
            opacity: domLayer ? domLayer.opacity : 0,
            exists: domLayer !== null
        };
    });

    // Process results
    analysis.forEach(layer => {
        console.log(`Layer: ${layer.name}`);
        console.log(`  Font: ${layer.font || 'Unknown'}`);
        console.log(`  Size: ${layer.size !== SENTINELS["double"] ? layer.size + 'pt' : 'Unknown'}`);
        console.log(`  Visible: ${layer.visible}`);
        console.log(`  Exists in both systems: ${layer.exists && layer.font !== SENTINELS["string"]}`);
    });
}

/**
 * Example: Conditional operations based on system capabilities
 */
export function conditionalSystemUsage(): void {
    // Note: ActionDescriptor, ActionReference, ActionList are global from index.d.ts  
    // Only need these imports:
    // import { ActionDescriptorNavigator } from './ps-nav';
    // import { getDOMLayerByName } from './ps';

    const layerName = 'ComplexTextLayer';

    // Try ActionManager first for complex text analysis
    const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
    const textRanges = navigator
        .getObject('textKey')
        .getList('textStyleRange')
        .getAllWhere(range => range.getInteger('from') >= 0);

    if (textRanges.length > 0) {
        // ActionManager succeeded - use for detailed text analysis
        textRanges.forEach((range, index) => {
            const style = range.getObject('textStyle');
            console.log(`Range ${index}: Font ${style.getString('fontPostScriptName')}`);
        });
    } else {
        // Fall back to DOM for basic information
        const domLayer = getDOMLayerByName(layerName);
        if (domLayer && domLayer.kind === LayerKind.TEXT) {
            console.log(`Basic info: Font ${domLayer.textItem.font}`);
        }
    }
}