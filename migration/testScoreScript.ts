//ps/testScoreScript.ts
/**
 * Enhanced example usage of ActionManager navigation with consolidated implementation
 * Demonstrates ActionManager navigation + DOM operations with new LINQ-style features
 * 
 * ENHANCED: Updated for consolidated implementation with superior enumerable system
 * FIXED: getBounds() now returns Bounds instead of Rectangle
 */

// Import consolidated ActionManager navigation
import { ActionDescriptorNavigator } from './action-manager/ActionDescriptorNavigator';

// Import ActionManager constants
import { SENTINELS } from './action-manager/adn-types';

// DOM operations (direct property access) - framework file unchanged
import { getDOMLayerByName } from './ps';

// Color sampling function (DOM-based) - assuming this exists
// import { samplePixelColor } from './ps-util';

/**
 * Example: Enhanced parallel systems usage with LINQ-style operations
 * Shows how to use both ActionManager (fluent) and DOM (direct) approaches
 * with the new sophisticated collection operations
 */
export function demonstrateEnhancedParallelSystems(): void {
    // ===================================================================
    // ENHANCED PARALLEL SYSTEMS USAGE PATTERN
    // ===================================================================

    const layerName = 'Title';

    // Find layer in both systems when needed
    const navigator = ActionDescriptorNavigator.forLayerByName(layerName);  // ActionManager
    const domLayer = getDOMLayerByName(layerName);                          // DOM

    // ===================================================================
    // ENHANCED ACTIONMANAGER WITH LINQ-STYLE OPERATIONS
    // ===================================================================

    // Navigate to text style information with enhanced fluent chaining
    const textObj = navigator.getObject('textKey');
    const textRanges = textObj.getList('textStyleRange');

    // Use new sophisticated filtering and transformation capabilities
    const validRanges = textRanges
        .whereMatches(range => range.getInteger('from') >= 0)
        .debug("Valid text ranges"); // Enhanced debugging

    // Transform ranges into structured data
    const rangeData = validRanges
        .select(range => ({
            from: range.getInteger('from'),
            to: range.getInteger('to'),
            length: range.getInteger('to') - range.getInteger('from'),
            style: range.getObject('textStyle')
        }))
        .debug("Transformed range data");

    // Get the first valid range (traditional approach still works)
    const firstRange = textRanges.getFirstWhere(range => range.getInteger('from') === 0);
    const textStyle = firstRange.getObject('textStyle');

    // Extract text properties (sentinel-safe, no if checks needed during chain)
    const fontName = textStyle.getString('fontPostScriptName');
    const fontSize = textStyle.getUnitDouble('sizeKey');
    const isBold = textStyle.getBoolean('bold');

    // FIXED: getBounds() now returns Bounds instead of Rectangle
    const bounds = navigator.getBounds();

    // ===================================================================
    // ENHANCED COLLECTION PROCESSING
    // ===================================================================

    // Process all ranges with advanced LINQ operations
    const fontSizes = textRanges
        .whereMatches(range => range.hasKey('textStyle'))
        .select(range => range.getObject('textStyle'))
        .whereMatches(style => style.hasKey('sizeKey'))
        .select(style => style.getUnitDouble('sizeKey'))
        .toResultArray()
        .filter(size => size !== SENTINELS.double);

    console.log('Font sizes found:', fontSizes);

    // Find ranges with specific formatting
    const boldRanges = textRanges
        .whereMatches(range => {
            const style = range.getObject('textStyle');
            return style.getBoolean('syntheticBold') === true;
        })
        .debug("Bold text ranges")
        .toResultArray();

    // Complex multi-stage filtering and transformation
    const complexAnalysis = textRanges
        .asEnumerable()
        .whereMatches(range => range.getInteger('to') - range.getInteger('from') > 0)
        .select(range => {
            const style = range.getObject('textStyle');
            const color = style.getObject('color');
            return {
                range: {
                    from: range.getInteger('from'),
                    to: range.getInteger('to')
                },
                font: style.getString('fontPostScriptName'),
                size: style.getUnitDouble('sizeKey'),
                color: {
                    red: color.getDouble('red'),
                    green: color.getDouble('green'),
                    blue: color.getDouble('blue')
                },
                formatting: {
                    bold: style.getBoolean('syntheticBold'),
                    italic: style.getBoolean('syntheticItalic'),
                    underline: style.getBoolean('underline')
                }
            };
        })
        .whereMatches(data => data.size > 12) // Filter by font size
        .debug("Complex analysis results");

    // ===================================================================
    // FILE OPERATIONS - UPDATED: Now requires null checks
    // ===================================================================

    // File operations with null checks (unchanged behavior)
    const linkedFile = navigator.getPath('smartObject');
    let linkedFileContent = '';
    if (linkedFile && linkedFile.exists) {
        linkedFileContent = linkedFile.read();
    }

    // Reference operations with null checks
    const layerReference = navigator.getReference('someProperty');
    if (layerReference) {
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
    // ENHANCED RESULTS COMBINATION - UPDATED: With Bounds instead of Rectangle
    // ===================================================================

    const analysis = {
        layerName: layerName,
        // ActionManager data (fluent, sentinel-safe)
        fontName: fontName !== SENTINELS.string ? fontName : 'Unknown',
        fontSize: fontSize !== SENTINELS.double ? fontSize : 0,
        isBold: isBold,
        // FIXED: Updated bounds handling for Bounds object
        bounds: {
            left: bounds.left || 0,
            top: bounds.top || 0,
            right: bounds.right || 0,
            bottom: bounds.bottom || 0,
            width: bounds.width || 0,
            height: bounds.height || 0
        },
        // Enhanced collection data
        totalRanges: textRanges.getCount(),
        validRanges: validRanges.getCount(),
        boldRanges: boldRanges.length,
        fontSizes: fontSizes,
        // File handling (unchanged)
        hasLinkedFile: linkedFile !== null,
        linkedFileExists: linkedFile && linkedFile.exists,
        hasReference: layerReference !== null,
        // DOM data (direct property access)
        visible: isVisible,
        opacity: opacity,
        existsInDOM: domLayer !== null,
        existsInActionManager: !navigator.isSentinel,
        // Enhanced analysis results
        complexAnalysisCount: complexAnalysis.getCount(),
        hasComplexFormatting: complexAnalysis.hasAnyMatches()
    };

    // Log the enhanced results
    console.log('Enhanced Parallel Systems Analysis:', analysis);

    // Example of conditional logic based on enhanced data availability
    if (analysis.existsInActionManager && analysis.existsInDOM) {
        console.log('✅ Layer found in both systems');
        console.log(`📊 Found ${analysis.totalRanges} text ranges, ${analysis.validRanges} valid`);
        if (analysis.hasComplexFormatting) {
            console.log('🎨 Complex formatting detected');
        }
    } else if (analysis.existsInActionManager) {
        console.log('⚠️ Layer found in ActionManager only');
    } else if (analysis.existsInDOM) {
        console.log('⚠️ Layer found in DOM only');
    } else {
        console.log('❌ Layer not found in either system');
    }
}

/**
 * Enhanced text scoring algorithm using LINQ-style operations
 * Shows sophisticated collection processing with the new enumerable system
 */
export function performEnhancedTextScoring(): any[] {
    const layerNames = ['Title', 'Subtitle', 'Body', 'Footer'];
    const scores: any[] = [];

    layerNames.forEach(layerName => {
        // Get ActionManager navigator
        const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
        
        // Get all text style ranges using enhanced operations
        const textRanges = navigator
            .getObject('textKey')
            .getList('textStyleRange')
            .whereMatches(range => range.getInteger('from') >= 0)
            .debug(`Text ranges for ${layerName}`);

        // Enhanced scoring with LINQ-style transformations
        const rangeScores = textRanges
            .select((range, rangeIndex) => {
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

                return {
                    layer: layerName,
                    range: rangeIndex,
                    fontData: fontData,
                    colorData: colorData,
                    score: score,
                    category: score >= 15 ? 'High Impact' : 
                             score >= 10 ? 'Medium Impact' : 
                             score >= 5 ? 'Standard' : 'Low Impact'
                };
            })
            .whereMatches(scoreData => scoreData.score > 0) // Filter out zero scores
            .debug(`Scores for ${layerName}`)
            .toResultArray();

        scores.push(...rangeScores);
    });

    return scores;
}

/**
 * Enhanced requirements validation using LINQ operations
 * Shows sophisticated validation with the new enumerable capabilities
 */
export class EnhancedTextRequirementValidator {
    private requirements = {
        minFontSize: 12,  
        requiresBold: true,
        maxLayers: 5,
        requiredLayers: ['Title', 'Body']
    };

    validateDocument(): string {
        const issues: string[] = [];
        
        // Enhanced validation using LINQ operations
        this.requirements.requiredLayers.forEach(layerName => {
            const navigator = ActionDescriptorNavigator.forLayerByName(layerName);
            
            if (navigator.isSentinel) {
                issues.push(`Missing required layer: ${layerName}`);
            } else {
                // Enhanced layer validation with collection operations
                const textRanges = navigator
                    .getObject('textKey')
                    .getList('textStyleRange')
                    .whereMatches(range => range.getInteger('from') >= 0);

                // Check each range for requirements
                const violations = textRanges
                    .select(range => {
                        const textStyle = range.getObject('textStyle');
                        const fontSize = textStyle.getUnitDouble('sizeKey');
                        const isBold = textStyle.getBoolean('syntheticBold');

                        const rangeIssues: string[] = [];

                        // Clean validation logic - no null checks needed for primitive values!
                        if (fontSize !== SENTINELS.double && fontSize < this.requirements.minFontSize) {
                            rangeIssues.push(`Font size ${fontSize} below minimum ${this.requirements.minFontSize}`);
                        }

                        if (this.requirements.requiresBold && !isBold) {
                            rangeIssues.push('Bold formatting required but not found');
                        }

                        return {
                            range: range,
                            issues: rangeIssues
                        };
                    })
                    .whereMatches(result => result.issues.length > 0)
                    .toResultArray();

                // Add violations to issues
                violations.forEach(violation => {
                    violation.issues.forEach(issue => {
                        issues.push(`${layerName}: ${issue}`);
                    });
                });
            }
        });

        return issues.length > 0 ? issues.join("; ") : "All requirements met";
    }
}

/**
 * Enhanced multi-layer analysis with sophisticated LINQ operations
 * Demonstrates the full power of the consolidated enumerable system
 */
export function performAdvancedMultiLayerAnalysis(): void {
    const layerNames = ['Title', 'Subtitle', 'Body', 'Footer'];

    // Enhanced analysis with sophisticated collection operations
    const analysis = layerNames
        .map(name => {
            // Get both system representations
            const navigator = ActionDescriptorNavigator.forLayerByName(name);
            const domLayer = getDOMLayerByName(name);

            // Enhanced ActionManager analysis
            const textAnalysis = navigator.hasKey('textKey') ? 
                navigator
                    .getObject('textKey')
                    .getList('textStyleRange')
                    .whereMatches(range => range.getInteger('from') >= 0)
                    .select(range => {
                        const style = range.getObject('textStyle');
                        return {
                            font: style.getString('fontPostScriptName'),
                            size: style.getUnitDouble('sizeKey'),
                            bold: style.getBoolean('syntheticBold')
                        };
                    })
                    .toResultArray() : [];

            // File operations with null checks
            const smartObjectFile = navigator.getPath('smartObject');
            
            // FIXED: Updated bounds handling for Bounds object
            const bounds = navigator.getBounds();
            
            return {
                name: name,
                // Enhanced ActionManager data
                textRangeCount: textAnalysis.length,
                fonts: textAnalysis.map(t => t.font).filter((f, i, arr) => arr.indexOf(f) === i),
                avgFontSize: textAnalysis.length > 0 ? 
                    textAnalysis.reduce((sum, t) => sum + (t.size !== SENTINELS.double ? t.size : 0), 0) / textAnalysis.length : 0,
                hasBoldText: textAnalysis.some(t => t.bold),
                bounds: {
                    left: bounds.left || 0,
                    top: bounds.top || 0,
                    width: bounds.width || 0,
                    height: bounds.height || 0
                },

                // File handling with null checks
                hasSmartObject: smartObjectFile !== null,
                smartObjectExists: smartObjectFile && smartObjectFile.exists,
                smartObjectPath: smartObjectFile ? smartObjectFile.fsName : 'None',

                // DOM data (direct property access)
                visible: domLayer ? domLayer.visible : false,
                opacity: domLayer ? domLayer.opacity : 0,
                exists: domLayer !== null,
                
                // System availability
                existsInActionManager: !navigator.isSentinel,
                hasTextData: textAnalysis.length > 0
            };
        })
        .filter(layer => layer.existsInActionManager || layer.exists); // Only valid layers

    // Enhanced processing and reporting
    analysis.forEach(layer => {
        console.log(`\n=== Enhanced Analysis: ${layer.name} ===`);
        console.log(`  Text Ranges: ${layer.textRangeCount}`);
        console.log(`  Fonts Used: ${layer.fonts.join(', ') || 'None'}`);
        console.log(`  Avg Font Size: ${layer.avgFontSize.toFixed(1)}pt`);
        console.log(`  Has Bold Text: ${layer.hasBoldText ? 'Yes' : 'No'}`);
        console.log(`  Bounds: ${layer.bounds.width}×${layer.bounds.height} at (${layer.bounds.left}, ${layer.bounds.top})`);
        console.log(`  Visible: ${layer.visible} (${layer.opacity}% opacity)`);
        console.log(`  Smart Object: ${layer.hasSmartObject ? 'Yes' : 'No'}`);
        console.log(`  Systems: AM=${layer.existsInActionManager}, DOM=${layer.exists}`);
    });

    // Summary statistics using enhanced operations
    const totalRanges = analysis.reduce((sum, layer) => sum + layer.textRangeCount, 0);
    const uniqueFonts = analysis
        .flatMap(layer => layer.fonts)
        .filter((font, index, arr) => arr.indexOf(font) === index);
    
    console.log(`\n=== Summary ===`);
    console.log(`  Total Layers Analyzed: ${analysis.length}`);
    console.log(`  Total Text Ranges: ${totalRanges}`);
    console.log(`  Unique Fonts: ${uniqueFonts.length} (${uniqueFonts.join(', ')})`);
    console.log(`  Layers with Bold Text: ${analysis.filter(l => l.hasBoldText).length}`);
    console.log(`  Layers with Smart Objects: ${analysis.filter(l => l.hasSmartObject).length}`);
}