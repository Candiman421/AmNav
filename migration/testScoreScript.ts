//ps/testScoreScript.ts
/**
 * Example usage of ActionManager navigation with Adobe direct types
 * Demonstrates ActionManager navigation + DOM operations working together
 * 
 * SIMPLIFIED: Updated for Adobe direct types - shows null check patterns
 */

// Import ActionManager navigation from action-manager module
import { ActionDescriptorNavigator } from './action-manager/ps-nav';

// Import ActionManager constants (now simplified)
import { SENTINELS } from './action-manager/adn-types';

// DOM operations (direct property access) - framework file unchanged
import { getDOMLayerByName } from './ps';

// Color sampling function (DOM-based) - assuming this exists
// import { samplePixelColor } from './ps-util';

/**
 * Example: Parallel systems usage pattern
 * Shows how to use both ActionManager (fluent) and DOM (direct) approaches
 */
export function demonstrateParallelSystems(): void {
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
    // FILE OPERATIONS - UPDATED: Now requires null checks
    // ===================================================================

    // SIMPLIFIED: File operations with null checks
    const linkedFile = navigator.getPath('smartObject');
    let linkedFileContent = '';
    if (linkedFile && linkedFile.exists) {  // ← Added null check
        linkedFileContent = linkedFile.read();
    }

    // Reference operations with null checks
    const layerReference = navigator.getReference('someProperty');
    if (layerReference) {  // ← Added null check
        // Safe to use layerReference methods
        const className = layerReference.getDesiredClass();
    }

    // ===================================================================
    // USE DOM FOR OPERATIONS THAT REQUIRE DOM OBJECTS
    // ===================================================================

    // Color sampling requires DOM layer object (if available)
    // const pixelColor = domLayer ? samplePixelColor(domLayer, { x: 50, y: 50 }) : null;

    // Layer visibility check via DOM (simple property access)
    const isVisible = domLayer ? domLayer.visible : false;

    // Layer opacity via DOM
    const opacity = domLayer ? domLayer.opacity : 0;

    // ===================================================================
    // COMBINE RESULTS FOR ANALYSIS - UPDATED: Simple null checks
    // ===================================================================

    const analysis = {
        layerName: layerName,
        // ActionManager data (fluent, sentinel-safe)
        fontName: fontName !== SENTINELS.string ? fontName : 'Unknown',
        fontSize: fontSize !== SENTINELS.double ? fontSize : 0,
        isBold: isBold,
        bounds: {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height
        },
        // SIMPLIFIED: File handling with simple null checks
        hasLinkedFile: linkedFile !== null,
        linkedFileExists: linkedFile && linkedFile.exists,
        hasReference: layerReference !== null,
        // DOM data (direct property access)
        visible: isVisible,
        opacity: opacity,
        existsInDOM: domLayer !== null,
        existsInActionManager: !navigator.isSentinel
    };

    // Log the results
    console.log('Parallel Systems Analysis:', analysis);

    // Example of conditional logic based on data availability
    if (analysis.existsInActionManager && analysis.existsInDOM) {
        console.log('✅ Layer found in both systems');
    } else if (analysis.existsInActionManager) {
        console.log('⚠️ Layer found in ActionManager only');
    } else if (analysis.existsInDOM) {
        console.log('⚠️ Layer found in DOM only');
    } else {
        console.log('❌ Layer not found in either system');
    }
}

/**
 * Example: Complex text scoring algorithm using ActionManager
 * Shows how to extract detailed text properties for analysis
 */
export function performTextScoring(): any[] {
    const layerNames = ['Title', 'Subtitle', 'Body', 'Footer'];
    const scores: any[] = [];

    layerNames.forEach(layerName => {
        // Get ActionManager navigator
        const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
        
        // Get all text style ranges for detailed analysis
        const textRanges = navigator
            .getObject('textKey')
            .getList('textStyleRange')
            .getAllWhere(range => range.getInteger('from') >= 0);

        // Score each range
        textRanges.forEach((range, rangeIndex) => {
            const textStyle = range.getObject('textStyle');
            
            // Extract comprehensive text properties
            const fontData = {
                name: textStyle.getString('fontPostScriptName'),
                size: textStyle.getUnitDouble('sizeKey'),
                leading: textStyle.getUnitDouble('leading'),
                tracking: textStyle.getInteger('tracking'),
                syntheticBold: textStyle.getBoolean('syntheticBold'),
                syntheticItalic: textStyle.getBoolean('syntheticItalic'),
                underline: textStyle.getBoolean('underline'),
                strikethrough: textStyle.getBoolean('strikethrough')
            };

            // Extract color information
            const colorObj = textStyle.getObject('color');
            const colorData = {
                red: colorObj.getDouble('red'),
                green: colorObj.getDouble('green'),
                blue: colorObj.getDouble('blue')
            };

            // Calculate score based on properties
            let score = 0;
            
            // Font size scoring
            if (fontData.size !== SENTINELS.double) {
                if (fontData.size >= 24) score += 10;      // Large headlines
                else if (fontData.size >= 16) score += 7;  // Medium headers
                else if (fontData.size >= 12) score += 5;  // Body text
                else score += 2;                           // Small text
            }

            // Font weight scoring
            if (fontData.syntheticBold) score += 5;

            // Color contrast scoring (simplified)
            if (colorData.red !== SENTINELS.double) {
                const brightness = (colorData.red + colorData.green + colorData.blue) / 3;
                if (brightness < 0.3) score += 3;  // Dark text (good contrast)
            }

            // Special formatting scoring
            if (fontData.underline) score += 2;
            if (fontData.syntheticItalic) score += 1;

            scores.push({
                layer: layerName,
                range: rangeIndex,
                fontData: fontData,
                colorData: colorData,
                score: score,
                category: score >= 15 ? 'High Impact' : 
                         score >= 10 ? 'Medium Impact' : 
                         score >= 5 ? 'Standard' : 'Low Impact'
            });
        });
    });

    return scores;
}

/**
 * Example: Requirements validation using sentinels
 * Shows how sentinel values enable clean validation logic
 */
export class TextRequirementValidator {
    private requirements = {
        minFontSize: 12,  
        requiresBold: true,
        maxLayers: 5,
        requiredLayers: ['Title', 'Body']
    };

    validateDocument(): string {
        const issues: string[] = [];
        
        // Check required layers exist
        this.requirements.requiredLayers.forEach(layerName => {
            const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
            if (navigator.isSentinel) {
                issues.push(`Missing required layer: ${layerName}`);
            } else {
                // Validate layer properties
                const textStyle = navigator
                    .getObject('textKey')
                    .getList('textStyleRange')
                    .getFirstWhere(range => range.getInteger('from') === 0)
                    .getObject('textStyle');

                const fontSize = textStyle.getUnitDouble('sizeKey');
                const isBold = textStyle.getBoolean('syntheticBold');

                // Clean validation logic - no null checks needed for primitive values!
                if (fontSize !== SENTINELS.double && fontSize < this.requirements.minFontSize) {
                    issues.push(`${layerName}: Font size ${fontSize} below minimum ${this.requirements.minFontSize}`);
                }

                if (this.requirements.requiresBold && !isBold) {
                    issues.push(`${layerName}: Bold formatting required but not found`);
                }
            }
        });

        return issues.length > 0 ? issues.join("; ") : "All requirements met";
    }
}

// ===================================================================
// ADDITIONAL EXAMPLES - UPDATED: With null check patterns
// ===================================================================

/**
 * Example: Multi-layer analysis using parallel approach
 */
export function analyzeMultipleLayers(): void {
    const layerNames = ['Title', 'Subtitle', 'Body', 'Footer'];

    const analysis = layerNames.map(name => {
        // Get both system representations
        const navigator = ActionDescriptorNavigator.forLayerByName(name);
        const domLayer = getDOMLayerByName(name);

        // SIMPLIFIED: File operations with null checks
        const smartObjectFile = navigator.getPath('smartObject');
        
        return {
            name: name,
            // ActionManager data (fluent, sentinel-safe)
            font: navigator.getObject('textKey').getString('fontPostScriptName'),
            size: navigator.getObject('textKey').getUnitDouble('sizeKey'),
            bounds: navigator.getBounds(),

            // UPDATED: File handling with null checks
            hasSmartObject: smartObjectFile !== null,
            smartObjectExists: smartObjectFile && smartObjectFile.exists,
            smartObjectPath: smartObjectFile ? smartObjectFile.fsName : 'None',

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
        console.log(`  Size: ${layer.size !== SENTINELS.double ? layer.size + 'pt' : 'Unknown'}`);
        console.log(`  Visible: ${layer.visible}`);
        console.log(`  Smart Object: ${layer.hasSmartObject ? 'Yes' : 'No'}`);
        console.log(`  Exists in both systems: ${layer.exists && layer.font !== SENTINELS.string}`);
    });
}

/**
 * Example: Conditional operations based on system capabilities
 */
export function conditionalSystemUsage(): void {
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
            console.log(`Basic info: Font ${(domLayer as any).textItem?.font || 'Unknown'}`);
        }
    }
}

/**
 * Example: File operations with proper null handling
 * Shows the simplified patterns for file handling
 */
export function demonstrateFileOperations(): void {
    const layerNames = ['Logo', 'Background', 'SmartObject'];

    layerNames.forEach(layerName => {
        const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
        
        // SIMPLIFIED: File operations with straightforward null checks
        const linkedFile = navigator.getPath('smartObject');
        const documentFile = navigator.getPath('documentPath');
        
        console.log(`\n=== ${layerName} Layer ===`);
        
        // Check for linked files
        if (linkedFile) {  // Simple null check
            console.log(`  Linked file: ${linkedFile.name}`);
            console.log(`  Exists: ${linkedFile.exists}`);
            console.log(`  Path: ${linkedFile.fsName}`);
            
            if (linkedFile.exists) {
                console.log(`  Size: ${linkedFile.length} bytes`);
            }
        } else {
            console.log(`  No linked file found`);
        }
        
        // Check for document references
        if (documentFile) {  // Simple null check
            console.log(`  Document file: ${documentFile.name}`);
        } else {
            console.log(`  No document file reference`);
        }
        
        // References are handled the same way
        const layerRef = navigator.getReference('layerReference');
        if (layerRef) {  // Simple null check
            console.log(`  Has layer reference: ${layerRef.getDesiredClass()}`);
        } else {
            console.log(`  No layer reference found`);
        }
    });
}