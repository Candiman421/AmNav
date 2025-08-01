# ActionDescriptor Navigator (ADN) v3.0.0 - Property Extraction Guide

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Essential Files & Dependencies](#essential-files--dependencies)
3. [Sentinel System & Null Exceptions](#sentinel-system--null-exceptions)
4. [Basic Extraction Strategies](#basic-extraction-strategies)
5. [DOM vs ActionManager Strategy](#dom-vs-actionmanager-strategy)
6. [Collection Operations & Performance](#collection-operations--performance)
7. [ActionManager Memory Model](#actionmanager-memory-model)
8. [Accessing Complex Return Values](#accessing-complex-return-values)
9. [Multiple Extraction Strategies](#multiple-extraction-strategies)
10. [Real XML-Based Examples](#real-xml-based-examples)
11. [List Processing Patterns](#list-processing-patterns)
12. [Performance Optimization Guide](#performance-optimization-guide)
13. [Best Practices Summary](#best-practices-summary)

---

## Framework Overview

ADN provides crash-safe, fluent property extraction from Photoshop's ActionManager for document analysis workflows. The framework extracts raw, untransformed values using a sentinel-based system that eliminates null/undefined exceptions.

### Core Principles
- **Sentinel-based safety** - No null/undefined crashes (except file/reference operations)
- **No defensive checks needed** - Sentinel system handles all failures
- **Multiple extraction strategies** - From inline to complex object building
- **Performance-aware collections** - Understanding ActionManager memory model
- **Parallel DOM/ActionManager** - Use appropriate system for each property

---

## Essential Files & Dependencies

```typescript
// Your Core ADN Files
adn-types.ts                    // Interfaces, generics, SENTINELS
ActionDescriptorNavigator.ts    // Main fluent API

// Framework Dependencies
ps.ts                          // Core Photoshop functions
ps-patch.d.ts                 // Essential type fixes
```

### SENTINELS Reference (from adn-types.ts)

```typescript
export const SENTINELS = {
    "string": "",
    "integer": -1,
    "double": -1,
    "boolean": false,
    "file": null as File | null,           // ⚠️ NULL exception
    "reference": null as ActionReference | null  // ⚠️ NULL exception
} as const;
```

---

## Sentinel System & Null Exceptions

### Standard Sentinel Behavior (No Null Checks)

```typescript
// ✅ STANDARD PATTERN: No null checks needed
const layer = ActionDescriptorNavigator.forLayerByName('NonExistent');
const name = layer.getString('name');          // Returns "" (never null)
const opacity = layer.getInteger('opacity');   // Returns -1 (never null)
const visible = layer.getBoolean('visible');   // Returns false (never null)

// Check validity using sentinel comparison
const hasValidName = name !== SENTINELS.string;
const hasValidOpacity = opacity !== SENTINELS.integer;
```

### Null Exceptions: File & Reference Operations

```typescript
// ⚠️ EXCEPTION: File operations may return null
const layer = ActionDescriptorNavigator.forLayerByName('SmartObject');
const fileRef = layer.getFile('fileReference');  // May return null
const layerRef = layer.getReference('layerReference');  // May return null

// ✅ REQUIRED: Null check for file/reference operations only
if (fileRef !== null) {
    console.log('File exists:', fileRef.exists);
    console.log('File path:', fileRef.fsName);
} else {
    console.log('No file reference found');
}

if (layerRef !== null) {
    // Use reference for ActionManager operations
    const refDesc = executeActionGet(layerRef);
} else {
    console.log('No layer reference available');
}

// ⚠️ ALIAS FILE ACCESS: Also requires null check
const aliasFile = layer.getAlias('fileReference');  // May return null
if (aliasFile !== null) {
    console.log('Alias path:', aliasFile.path);
}
```

---

## Basic Extraction Strategies

### Strategy 1: Inline Direct Access

```typescript
// Simple inline extraction for straightforward cases
function quickLayerInfo(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    
    // Direct inline access - no intermediate variables
    console.log('Layer:', layer.getString('name'));
    console.log('Opacity:', layer.getInteger('opacity'));
    console.log('Visible:', layer.getBoolean('visible'));
    console.log('Text:', layer.getObject('textKey').getString('textKey'));
    console.log('Font:', layer.getObject('textKey')
                           .getList('textStyleRange')
                           .getFirst()
                           .getObject('textStyle')
                           .getString('fontPostScriptName'));
}
```

### Strategy 2: Cached Navigation

```typescript
// Cache expensive navigation paths
function cachedLayerInfo(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const textObj = layer.getObject('textKey');  // Cache navigation
    const styleRanges = textObj.getList('textStyleRange');  // Cache list
    const firstStyle = styleRanges.getFirst().getObject('textStyle');  // Cache style
    
    // Use cached objects multiple times
    const textContent = textObj.getString('textKey');
    const fontSize = firstStyle.getUnitDouble('sizeKey');
    const fontName = firstStyle.getString('fontPostScriptName');
    const fontColor = firstStyle.getObject('color');
    
    return { textContent, fontSize, fontName, fontColor };
}
```

### Strategy 3: Destructured Assignment Pattern

```typescript
// Extract multiple values into variables
function destructuredExtraction(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    
    // Extract basic properties
    const name = layer.getString('name');
    const opacity = layer.getInteger('opacity');
    const visible = layer.getBoolean('visible');
    const layerID = layer.getInteger('layerID');
    
    // Extract text properties
    const textObj = layer.getObject('textKey');
    const textContent = textObj.getString('textKey');
    const bounds = textObj.getObject('bounds');
    
    // Extract bounds properties
    const left = bounds.getUnitDouble('left');
    const top = bounds.getUnitDouble('top');
    const width = bounds.getUnitDouble('width');
    const height = bounds.getUnitDouble('height');
    
    // Use extracted values
    console.log(`Layer "${name}" (${layerID}): ${width}x${height} at ${opacity}% opacity`);
    console.log(`Text: "${textContent}"`);
}
```

---

## DOM vs ActionManager Strategy

### Parallel Access for Optimal Performance

```typescript
// Leverage both systems simultaneously
function parallelExtraction(layerName: string) {
    // ActionManager: Complex properties
    const adnLayer = ActionDescriptorNavigator.forLayerByName(layerName);
    
    // DOM: Simple properties (faster for basic data)
    const domLayer = getDomLayerByName(layerName);  // May return null
    
    // ✅ DOM: Fast basic properties
    const domData = domLayer ? {
        name: domLayer.name,
        visible: domLayer.visible,
        opacity: domLayer.opacity,
        kind: domLayer.kind,
        blendMode: domLayer.blendMode,
        bounds: {
            left: domLayer.bounds[0].as('px'),
            top: domLayer.bounds[1].as('px'),
            right: domLayer.bounds[2].as('px'),
            bottom: domLayer.bounds[3].as('px')
        }
    } : null;
    
    // ✅ ActionManager: Complex properties not available via DOM
    const adnData = {
        layerID: adnLayer.getInteger('layerID'),
        itemIndex: adnLayer.getInteger('itemIndex'),
        globalAngle: adnLayer.getInteger('globalAngle'),
        textContent: adnLayer.getObject('textKey').getString('textKey'),
        fontSize: adnLayer.getObject('textKey')
                          .getList('textStyleRange')
                          .getFirst()
                          .getObject('textStyle')
                          .getUnitDouble('sizeKey')
    };
    
    return { domData, adnData };
}
```

### Property Access Guidelines

```typescript
// ✅ USE DOM FOR:
// - Basic layer properties (name, visible, opacity, kind, blendMode)
// - Simple bounds access (faster than ActionManager)
// - Layer hierarchy (parent, artLayers collection)
// - Document properties (width, height, resolution)

// ✅ USE ActionManager FOR:
// - Layer IDs and internal indices
// - Text content and detailed typography
// - Font properties and text styling
// - Color values and complex bounds types
// - Layer effects and advanced properties
// - Properties not exposed via DOM
```

---

## Collection Operations & Performance

### Understanding ActionManager Lists

ActionManager lists behave differently from JavaScript arrays:
- **List objects are references** - Getting a list gives you a reference, not the data
- **Each property access is an API call** - Even cached lists require API calls for contents
- **No bulk data transfer** - Cannot extract all items at once
- **Index-based access only** - No iteration helpers built-in

### getFirst() vs getAll() vs whereMatches() Performance

```typescript
const layer = ActionDescriptorNavigator.forLayerByName('Complex Text');
const styleRanges = layer.getObject('textKey').getList('textStyleRange');

// ✅ MOST EFFICIENT: getFirst() - Single API call
const firstRange = styleRanges.getFirst();
console.log('First font:', firstRange.getObject('textStyle').getString('fontPostScriptName'));
// API Calls: 1 (getFirst) + 1 (getObject) + 1 (getString) = 3 total

// ⚠️ MODERATE COST: whereMatches() - Calls until match found
const largeTextRange = styleRanges.whereMatches(range => {
    const fontSize = range.getObject('textStyle').getUnitDouble('sizeKey');
    return fontSize > 24;
});
// API Calls: Variable - depends on match position
// Could be 3 calls (if first item matches) to N*3 calls (if last item matches)

// ❌ MOST EXPENSIVE: toResultArray() - Extracts all items
const allRanges = styleRanges.toResultArray();
allRanges.forEach(range => {
    console.log('Font:', range.getObject('textStyle').getString('fontPostScriptName'));
});
// API Calls: N (for array) + N*3 (for each font access) = N*4 total calls
```

### Performance Comparison Examples

```typescript
// Based on complex-text_updated01.layers.xml with multiple text ranges
function demonstratePerformanceDifferences() {
    const layer = ActionDescriptorNavigator.forLayerByName('Title Layer');
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    const rangeCount = styleRanges.getCount();  // 1 API call
    
    console.log(`Processing ${rangeCount} text ranges`);
    
    // ✅ EFFICIENT: Get first valid font only
    const firstValidFont = styleRanges
        .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
        .getFirst()
        .getObject('textStyle')
        .getString('fontPostScriptName');
    console.log('First font:', firstValidFont);
    // API calls: ~3-6 (stops at first match)
    
    // ⚠️ MODERATE: Filter then extract first few
    const firstThreeFonts = styleRanges
        .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
        .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
        .toResultArray()
        .slice(0, 3);  // Limit after extraction
    console.log('First 3 fonts:', firstThreeFonts);
    // API calls: N*4 (processes all ranges, then slices)
    
    // ❌ EXPENSIVE: Extract all then filter
    const allFonts = styleRanges
        .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
        .whereMatches(font => font !== SENTINELS.string)
        .toResultArray();
    console.log('All fonts:', allFonts);
    // API calls: N*3 (must process every range)
}
```

---

## ActionManager Memory Model

### How ActionManager Objects Work

```typescript
// Understanding ActionManager object references
function exploreActionManagerMemory() {
    const layer = ActionDescriptorNavigator.forLayerByName('Sample Layer');
    
    // Getting an object returns a REFERENCE, not the data
    const textObj = layer.getObject('textKey');  // 1 API call - gets reference
    
    // Each property access on the reference is ANOTHER API call
    const textContent1 = textObj.getString('textKey');  // API call
    const textContent2 = textObj.getString('textKey');  // ANOTHER API call (not cached)
    
    // Getting a list returns a REFERENCE to the list
    const styleRanges = textObj.getList('textStyleRange');  // 1 API call - gets list reference
    
    // Each list access is an API call
    const range1 = styleRanges.getIndex(0);  // API call
    const range2 = styleRanges.getIndex(1);  // API call
    const range1Again = styleRanges.getIndex(0);  // ANOTHER API call (not cached)
    
    // ✅ IMPLICATION: Cache references, but know each access costs
    const cachedRange = styleRanges.getIndex(0);  // 1 API call
    const fontSize = cachedRange.getObject('textStyle').getUnitDouble('sizeKey');  // 2 more API calls
    const fontName = cachedRange.getObject('textStyle').getString('fontPostScriptName');  // 2 more API calls
    // Total: 5 API calls for 2 properties from same range
    
    // ✅ BETTER: Cache deeper references
    const cachedTextStyle = cachedRange.getObject('textStyle');  // 1 API call
    const fontSize2 = cachedTextStyle.getUnitDouble('sizeKey');  // 1 API call
    const fontName2 = cachedTextStyle.getString('fontPostScriptName');  // 1 API call
    // Total: 3 API calls for same 2 properties
}
```

### Memory vs API Trade-offs

```typescript
// Strategy comparison for processing multiple ranges
function memoryVsApiTradeoffs() {
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    
    // ❌ WORST: Repeated full navigation
    for (let i = 0; i < styleRanges.getCount(); i++) {
        const fontSize = layer.getObject('textKey')  // API call
                             .getList('textStyleRange')  // API call
                             .getIndex(i)  // API call
                             .getObject('textStyle')  // API call
                             .getUnitDouble('sizeKey');  // API call
        // 5 API calls per iteration!
    }
    
    // ⚠️ BETTER: Cache list reference
    const ranges = layer.getObject('textKey').getList('textStyleRange');  // 1 API call
    for (let i = 0; i < ranges.getCount(); i++) {  // 1 API call for count
        const fontSize = ranges.getIndex(i)  // API call
                               .getObject('textStyle')  // API call
                               .getUnitDouble('sizeKey');  // API call
        // 3 API calls per iteration + 2 setup = 3N+2 total
    }
    
    // ✅ BEST: Extract to JavaScript array once, then process in memory
    const rangeArray = ranges.toResultArray();  // N API calls (one per range)
    rangeArray.forEach(range => {
        const textStyle = range.getObject('textStyle');  // 1 API call
        const fontSize = textStyle.getUnitDouble('sizeKey');  // 1 API call  
        const fontName = textStyle.getString('fontPostScriptName');  // 1 API call
        // 3 API calls per iteration, but all list access is now in memory
        // Total: N + 3N = 4N API calls
    });
}
```

---

## Accessing Complex Return Values

### Navigating Nested Return Objects

```typescript
// Complex function that returns nested data
function extractComplexData(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const textObj = layer.getObject('textKey');
    const styleRanges = textObj.getList('textStyleRange');
    
    return {
        basic: {
            name: layer.getString('name'),
            opacity: layer.getInteger('opacity'),
            visible: layer.getBoolean('visible')
        },
        text: {
            content: textObj.getString('textKey'),
            bounds: {
                left: textObj.getObject('bounds').getUnitDouble('left'),
                top: textObj.getObject('bounds').getUnitDouble('top'),
                width: textObj.getObject('bounds').getUnitDouble('width'),
                height: textObj.getObject('bounds').getUnitDouble('height')
            }
        },
        fonts: styleRanges.select(range => ({
            from: range.getInteger('from'),
            to: range.getInteger('to'),
            style: {
                name: range.getObject('textStyle').getString('fontPostScriptName'),
                size: range.getObject('textStyle').getUnitDouble('sizeKey'),
                color: {
                    red: range.getObject('textStyle').getObject('color').getDouble('red'),
                    green: range.getObject('textStyle').getObject('color').getDouble('green'),
                    blue: range.getObject('textStyle').getObject('color').getDouble('blue')
                }
            }
        })).toResultArray(),
        analysis: {
            rangeCount: styleRanges.getCount(),
            hasValidText: textObj.getString('textKey') !== SENTINELS.string
        }
    };
}

// ✅ ACCESSING THE COMPLEX RETURN VALUE
const result = extractComplexData('Title Layer');

// Basic property access
console.log('Layer name:', result.basic.name);
console.log('Is visible:', result.basic.visible);
console.log('Opacity percentage:', result.basic.opacity / 255 * 100);

// Text bounds access
console.log('Text area:', result.text.bounds.width * result.text.bounds.height);
console.log('Text position:', `${result.text.bounds.left}, ${result.text.bounds.top}`);

// Fonts array access
console.log('Total fonts found:', result.fonts.length);
console.log('First font:', result.fonts[0]?.style.name || 'No fonts found');

// Iterate fonts with detailed access
result.fonts.forEach((fontRange, index) => {
    console.log(`Font ${index}:`);
    console.log(`  Range: characters ${fontRange.from}-${fontRange.to}`);
    console.log(`  Font: ${fontRange.style.name} at ${fontRange.style.size}pt`);
    console.log(`  Color: rgb(${fontRange.style.color.red}, ${fontRange.style.color.green}, ${fontRange.style.color.blue})`);
});

// Conditional access based on analysis
if (result.analysis.hasValidText) {
    console.log(`Text content: "${result.text.content}"`);
    console.log(`Processed ${result.analysis.rangeCount} text ranges`);
} else {
    console.log('No valid text content found');
}

// Filter and process fonts
const largeFonts = result.fonts.filter(f => f.style.size > 24);
const uniqueFontNames = [...new Set(result.fonts.map(f => f.style.name))];
console.log('Large fonts:', largeFonts.length);
console.log('Unique fonts:', uniqueFontNames);
```

### Accessing Collection Results

```typescript
// Function returning different collection types
function getCollectionData(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    
    return {
        // Array of values
        fontSizes: styleRanges
            .select(range => range.getObject('textStyle').getUnitDouble('sizeKey'))
            .whereMatches(size => size !== SENTINELS.double)
            .toResultArray(),
            
        // Array of objects  
        fontData: styleRanges
            .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
            .select(range => ({
                name: range.getObject('textStyle').getString('fontPostScriptName'),
                size: range.getObject('textStyle').getUnitDouble('sizeKey')
            }))
            .toResultArray(),
            
        // Single object (first match)
        largestFont: styleRanges
            .whereMatches(range => {
                const size = range.getObject('textStyle').getUnitDouble('sizeKey');
                return size !== SENTINELS.double;
            })
            .select(range => ({
                name: range.getObject('textStyle').getString('fontPostScriptName'),
                size: range.getObject('textStyle').getUnitDouble('sizeKey')
            }))
            .toResultArray()
            .reduce((max, current) => current.size > max.size ? current : max, { name: '', size: 0 }),
            
        // Count only
        validRangeCount: styleRanges
            .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
            .getCount()
    };
}

// ✅ ACCESSING COLLECTION RESULTS
const collections = getCollectionData('Complex Text Layer');

// Simple array access
console.log('All font sizes:', collections.fontSizes);
console.log('Average font size:', collections.fontSizes.reduce((a, b) => a + b, 0) / collections.fontSizes.length);
console.log('Size range:', Math.max(...collections.fontSizes) - Math.min(...collections.fontSizes));

// Object array access
console.log('Font details:');
collections.fontData.forEach((font, index) => {
    console.log(`  ${index}: ${font.name} (${font.size}pt)`);
});

// Find specific fonts
const arialFonts = collections.fontData.filter(font => font.name.includes('Arial'));
const largeFonts = collections.fontData.filter(font => font.size > 20);

// Single object access
console.log('Largest font found:', collections.largestFont.name, 'at', collections.largestFont.size, 'points');

// Count access
console.log('Valid text ranges:', collections.validRangeCount);

// Complex analysis
const fontsBySize = collections.fontData.reduce((groups, font) => {
    const category = font.size > 24 ? 'large' : font.size > 16 ? 'medium' : 'small';
    groups[category] = groups[category] || [];
    groups[category].push(font);
    return groups;
}, {} as Record<string, typeof collections.fontData>);

console.log('Fonts by size category:', Object.keys(fontsBySize).map(cat => 
    `${cat}: ${fontsBySize[cat].length} fonts`
));
```

---

## Multiple Extraction Strategies

### Strategy 1: Direct Inline (No Functions)

```typescript
// Working directly in existing function context
// Based on simple-title_updated01.layers.xml
const layer = ActionDescriptorNavigator.forLayerByName('Sample Title');
const domLayer = getDomLayerByName('Sample Title');

// Direct extraction without intermediate functions
const layerName = layer.getString('name');  // "Sample Title"
const textContent = layer.getObject('textKey').getString('textKey');  // "Hello World"
const fontSize = layer.getObject('textKey')
                     .getList('textStyleRange')
                     .getFirst()
                     .getObject('textStyle')
                     .getUnitDouble('sizeKey');  // 48

// Immediate usage
console.log(`Layer "${layerName}" contains "${textContent}" at ${fontSize}pt`);
console.log('DOM opacity:', domLayer?.opacity || 'Unknown');

// Quick validation
const hasValidFont = fontSize !== SENTINELS.double;
const hasValidText = textContent !== SENTINELS.string;
if (hasValidFont && hasValidText) {
    console.log('Layer has valid text formatting');
}
```

### Strategy 2: Object Building Pattern

```typescript
// Build result object progressively
const layerData = {
    identification: {},
    properties: {},
    text: {},
    analysis: {}
};

// Progressive building
const layer = ActionDescriptorNavigator.forLayerByName('Header Text');

// Fill identification section
layerData.identification.name = layer.getString('name');
layerData.identification.layerID = layer.getInteger('layerID');
layerData.identification.itemIndex = layer.getInteger('itemIndex');

// Fill properties section
layerData.properties.visible = layer.getBoolean('visible');
layerData.properties.opacity = layer.getInteger('opacity');
layerData.properties.globalAngle = layer.getInteger('globalAngle');

// Fill text section
const textObj = layer.getObject('textKey');
layerData.text.content = textObj.getString('textKey');
layerData.text.bounds = {
    left: textObj.getObject('bounds').getUnitDouble('left'),
    top: textObj.getObject('bounds').getUnitDouble('top'),
    width: textObj.getObject('bounds').getUnitDouble('width'),
    height: textObj.getObject('bounds').getUnitDouble('height')
};

// Fill analysis section
layerData.analysis.hasText = layerData.text.content !== SENTINELS.string;
layerData.analysis.textArea = layerData.text.bounds.width * layerData.text.bounds.height;
```

### Strategy 3: Batch Processing Pattern

```typescript
// Process multiple layers efficiently
const layerNames = ['Header Text', 'Body Text', 'Footer Text'];
const results = [];

layerNames.forEach(layerName => {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const domLayer = getDomLayerByName(layerName);
    
    // Parallel extraction per layer
    const layerResult = {
        name: layerName,
        adn: {
            layerID: layer.getInteger('layerID'),
            textContent: layer.getObject('textKey').getString('textKey'),
            fontSize: layer.getObject('textKey')
                          .getList('textStyleRange')
                          .getFirst()
                          .getObject('textStyle')
                          .getUnitDouble('sizeKey')
        },
        dom: {
            visible: domLayer?.visible || false,
            opacity: domLayer?.opacity || 0,
            kind: domLayer?.kind || null
        }
    };
    
    results.push(layerResult);
});

// Process batch results
results.forEach(result => {
    console.log(`${result.name}: "${result.adn.textContent}" (${result.adn.fontSize}pt)`);
    console.log(`  DOM: ${result.dom.visible ? 'visible' : 'hidden'} at ${result.dom.opacity}% opacity`);
});
```

### Strategy 4: Conditional Extraction Pattern

```typescript
// Extract different data based on layer characteristics
function conditionalExtraction(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const domLayer = getDomLayerByName(layerName);
    
    // Base extraction
    const baseData = {
        name: layer.getString('name'),
        layerID: layer.getInteger('layerID'),
        visible: layer.getBoolean('visible')
    };
    
    // Conditional text extraction
    const textContent = layer.getObject('textKey').getString('textKey');
    if (textContent !== SENTINELS.string) {
        // Layer has text - extract text-specific data
        const textObj = layer.getObject('textKey');
        const styleRanges = textObj.getList('textStyleRange');
        
        Object.assign(baseData, {
            textData: {
                content: textContent,
                rangeCount: styleRanges.getCount(),
                firstFont: styleRanges.getFirst()
                                     .getObject('textStyle')
                                     .getString('fontPostScriptName'),
                bounds: {
                    width: textObj.getObject('bounds').getUnitDouble('width'),
                    height: textObj.getObject('bounds').getUnitDouble('height')
                }
            }
        });
    }
    
    // Conditional DOM enhancement
    if (domLayer) {
        Object.assign(baseData, {
            domData: {
                blendMode: domLayer.blendMode,
                kind: domLayer.kind,
                bounds: {
                    left: domLayer.bounds[0].as('px'),
                    top: domLayer.bounds[1].as('px'),
                    right: domLayer.bounds[2].as('px'),
                    bottom: domLayer.bounds[3].as('px')
                }
            }
        });
    }
    
    return baseData;
}
```

---

## Real XML-Based Examples

### Example 1: simple-title_updated01.psd Analysis

```typescript
// Based on XML: Single layer "Sample Title" with "Hello World" text, Arial 48pt
function analyzeSimpleTitle() {
    const layer = ActionDescriptorNavigator.forLayerByName('Sample Title');
    
    // Extract according to XML structure
    const analysis = {
        // Layer identification (from XML LayerID=2, ItemIndex=1)
        layerID: layer.getInteger('layerID'),  // Expected: 2
        itemIndex: layer.getInteger('itemIndex'),  // Expected: 1
        
        // Basic properties (from XML Opacity=255, Visible=true)
        opacity: layer.getInteger('opacity'),  // Expected: 255
        visible: layer.getBoolean('visible'),  // Expected: true
        
        // Text content (from XML string="Hello World")
        textContent: layer.getObject('textKey').getString('textKey'),  // Expected: "Hello World"
        
        // Font properties (from XML TextStyleRange)
        fontProperties: (() => {
            const textStyle = layer.getObject('textKey')
                                  .getList('textStyleRange')
                                  .getFirst()
                                  .getObject('textStyle');
            
            return {
                fontName: textStyle.getString('fontPostScriptName'),  // Expected: "ArialMT"
                fontSize: textStyle.getUnitDouble('sizeKey'),  // Expected: 48
                fontFamily: textStyle.getString('fontName'),  // Expected: "Arial"
                fontStyle: textStyle.getString('fontStyleName')  // Expected: "Regular"
            };
        })(),
        
        // Color properties (from XML Color object with RGB 255,255,255)
        textColor: (() => {
            const colorObj = layer.getObject('textKey')
                                 .getList('textStyleRange')
                                 .getFirst()
                                 .getObject('textStyle')
                                 .getObject('color');
            
            return {
                red: colorObj.getDouble('red'),     // Expected: 255
                green: colorObj.getDouble('green'), // Expected: 255
                blue: colorObj.getDouble('blue')    // Expected: 255
            };
        })()
    };
    
    return analysis;
}

// ✅ ACCESSING THE RESULTS
const result = analyzeSimpleTitle();
console.log('Layer ID:', result.layerID);
console.log('Text:', result.textContent);
console.log('Font:', `${result.fontProperties.fontFamily} ${result.fontProperties.fontStyle} ${result.fontProperties.fontSize}pt`);
console.log('Color:', `rgb(${result.textColor.red}, ${result.textColor.green}, ${result.textColor.blue})`);
console.log('Is white text?', result.textColor.red === 255 && result.textColor.green === 255 && result.textColor.blue === 255);
```

### Example 2: complex-text_updated01.psd Multi-Range Analysis

```typescript
// Based on XML: "Title Layer" and "Subtitle Layer" with different styling
function analyzeComplexTextDocument() {
    const layers = ['Title Layer', 'Subtitle Layer'];
    
    return layers.map(layerName => {
        const layer = ActionDescriptorNavigator.forLayerByName(layerName);
        const textObj = layer.getObject('textKey');
        const styleRanges = textObj.getList('textStyleRange');
        
        // Extract based on XML structure showing multiple TextStyleRange objects
        const layerAnalysis = {
            layerInfo: {
                name: layer.getString('name'),
                layerID: layer.getInteger('layerID'),
                visible: layer.getBoolean('visible')
            },
            textContent: textObj.getString('textKey'),
            textRanges: styleRanges.select(range => {
                const textStyle = range.getObject('textStyle');
                const colorObj = textStyle.getObject('color');
                
                return {
                    range: {
                        from: range.getInteger('from'),  // Character start position
                        to: range.getInteger('to')       // Character end position
                    },
                    font: {
                        name: textStyle.getString('fontPostScriptName'),
                        size: textStyle.getUnitDouble('sizeKey'),
                        family: textStyle.getString('fontName'),
                        style: textStyle.getString('fontStyleName'),
                        available: textStyle.getBoolean('fontAvailable')
                    },
                    color: {
                        red: colorObj.getDouble('red'),
                        green: colorObj.getDouble('green'),
                        blue: colorObj.getDouble('blue')
                    }
                };
            }).toResultArray()
        };
        
        // Add computed analysis
        layerAnalysis.analysis = {
            totalRanges: layerAnalysis.textRanges.length,
            uniqueFonts: [...new Set(layerAnalysis.textRanges.map(r => r.font.name))],
            fontSizes: layerAnalysis.textRanges.map(r => r.font.size),
            hasMultipleStyles: layerAnalysis.textRanges.length > 1
        };
        
        return layerAnalysis;
    });
}

// ✅ ACCESSING COMPLEX MULTI-LAYER RESULTS
const complexResults = analyzeComplexTextDocument();

// Iterate through layers
complexResults.forEach((layerData, index) => {
    console.log(`\n=== ${layerData.layerInfo.name} ===`);
    console.log('Text content:', layerData.textContent);
    console.log('Layer ID:', layerData.layerInfo.layerID);
    console.log('Total text ranges:', layerData.analysis.totalRanges);
    
    // Access individual text ranges
    layerData.textRanges.forEach((range, rangeIndex) => {
        console.log(`  Range ${rangeIndex}: chars ${range.range.from}-${range.range.to}`);
        console.log(`    Font: ${range.font.name} ${range.font.size}pt`);
        console.log(`    Color: rgb(${range.color.red}, ${range.color.green}, ${range.color.blue})`);
    });
    
    // Access computed analysis
    console.log('Unique fonts used:', layerData.analysis.uniqueFonts);
    console.log('Font size range:', Math.min(...layerData.analysis.fontSizes), '-', Math.max(...layerData.analysis.fontSizes));
    console.log('Has multiple styles:', layerData.analysis.hasMultipleStyles);
});

// Cross-layer analysis
const allFonts = complexResults.flatMap(layer => layer.analysis.uniqueFonts);
const documentFonts = [...new Set(allFonts)];
console.log('\nDocument-wide unique fonts:', documentFonts);

// Find largest font across all layers
const allSizes = complexResults.flatMap(layer => layer.analysis.fontSizes);
const largestFont = Math.max(...allSizes);
console.log('Largest font in document:', largestFont, 'pt');
```

### Example 3: multi-layer-bounds_updated01.psd Bounds Analysis

```typescript
// Based on XML: Multiple layers with different positioning and sizes
function analyzeMultiLayerBounds() {
    const layerNames = ['Header Text', 'Body Text', 'Footer Text'];
    
    const boundsAnalysis = layerNames.map(layerName => {
        const layer = ActionDescriptorNavigator.forLayerByName(layerName);
        const domLayer = getDomLayerByName(layerName);
        
        // Extract bounds from both ADN and DOM for comparison
        const adnBounds = layer.getObject('bounds');  // ActionManager bounds
        const textBounds = layer.getObject('textKey').getObject('bounds');  // Text-specific bounds
        
        return {
            layerName: layerName,
            layerID: layer.getInteger('layerID'),
            
            // ActionManager bounds (from XML bounds object)
            adnBounds: {
                left: adnBounds.getUnitDouble('left'),
                top: adnBounds.getUnitDouble('top'),
                right: adnBounds.getUnitDouble('right'),
                bottom: adnBounds.getUnitDouble('bottom'),
                width: adnBounds.getUnitDouble('width'),
                height: adnBounds.getUnitDouble('height')
            },
            
            // Text-specific bounds (from XML textKey.bounds)
            textBounds: {
                left: textBounds.getUnitDouble('left'),
                top: textBounds.getUnitDouble('top'),
                right: textBounds.getUnitDouble('right'),
                bottom: textBounds.getUnitDouble('bottom'),
                width: textBounds.getUnitDouble('width'),
                height: textBounds.getUnitDouble('height')
            },
            
            // DOM bounds for comparison (converted to pixels)
            domBounds: domLayer ? {
                left: domLayer.bounds[0].as('px'),
                top: domLayer.bounds[1].as('px'),
                right: domLayer.bounds[2].as('px'),
                bottom: domLayer.bounds[3].as('px'),
                width: domLayer.bounds[2].as('px') - domLayer.bounds[0].as('px'),
                height: domLayer.bounds[3].as('px') - domLayer.bounds[1].as('px')
            } : null
        };
    });
    
    return boundsAnalysis;
}

// ✅ ACCESSING BOUNDS ANALYSIS RESULTS
const boundsResults = analyzeMultiLayerBounds();

// Compare bounds data
boundsResults.forEach(layer => {
    console.log(`\n=== ${layer.layerName} (ID: ${layer.layerID}) ===`);
    
    // ADN bounds access
    console.log('ADN Bounds:', 
        `${layer.adnBounds.width} x ${layer.adnBounds.height} ` +
        `at (${layer.adnBounds.left}, ${layer.adnBounds.top})`);
    
    // Text bounds access
    console.log('Text Bounds:', 
        `${layer.textBounds.width} x ${layer.textBounds.height} ` +
        `at (${layer.textBounds.left}, ${layer.textBounds.top})`);
    
    // DOM bounds access (with null check)
    if (layer.domBounds) {
        console.log('DOM Bounds:', 
            `${layer.domBounds.width} x ${layer.domBounds.height} ` +
            `at (${layer.domBounds.left}, ${layer.domBounds.top})`);
        
        // Compare ADN vs DOM
        const adnArea = layer.adnBounds.width * layer.adnBounds.height;
        const domArea = layer.domBounds.width * layer.domBounds.height;
        console.log('Area difference (ADN vs DOM):', Math.abs(adnArea - domArea), 'sq px');
    }
    
    // Calculate text area
    const textArea = layer.textBounds.width * layer.textBounds.height;
    console.log('Text area:', textArea, 'sq px');
});

// Document layout analysis
const topMostLayer = boundsResults.reduce((top, current) => 
    current.adnBounds.top < top.adnBounds.top ? current : top
);
const bottomMostLayer = boundsResults.reduce((bottom, current) => 
    current.adnBounds.bottom > bottom.adnBounds.bottom ? current : bottom
);

console.log('\nDocument Layout:');
console.log('Topmost layer:', topMostLayer.layerName, 'at Y =', topMostLayer.adnBounds.top);
console.log('Bottommost layer:', bottomMostLayer.layerName, 'at Y =', bottomMostLayer.adnBounds.bottom);
console.log('Document height span:', bottomMostLayer.adnBounds.bottom - topMostLayer.adnBounds.top);
```

---

## List Processing Patterns

### Handling Multiple Objects in Lists

```typescript
// Based on XML showing multiple TextStyleRange objects in a list
function processMultipleTextRanges(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    const rangeCount = styleRanges.getCount();
    
    console.log(`Processing ${rangeCount} text style ranges`);
    
    // ✅ PATTERN 1: Process all ranges
    const allRanges = styleRanges.toResultArray();
    allRanges.forEach((range, index) => {
        const from = range.getInteger('from');
        const to = range.getInteger('to');
        const fontSize = range.getObject('textStyle').getUnitDouble('sizeKey');
        
        console.log(`Range ${index}: characters ${from}-${to}, font size ${fontSize}pt`);
    });
    
    // ✅ PATTERN 2: Find specific ranges
    const largeTextRanges = styleRanges.whereMatches(range => {
        const fontSize = range.getObject('textStyle').getUnitDouble('sizeKey');
        return fontSize > 24 && fontSize !== SENTINELS.double;
    }).toResultArray();
    
    // ✅ PATTERN 3: Process until condition met
    let foundBoldText = false;
    const boldRange = styleRanges.whereMatches(range => {
        return range.getObject('textStyle').getBoolean('syntheticBold');
    }).getFirst();
    
    if (!boldRange.isSentinel) {
        foundBoldText = true;
        console.log('Found bold text at characters', 
            boldRange.getInteger('from'), '-', boldRange.getInteger('to'));
    }
    
    // ✅ PATTERN 4: Extract and group by property
    const fontGroups = styleRanges.toResultArray().reduce((groups, range) => {
        const fontName = range.getObject('textStyle').getString('fontPostScriptName');
        if (fontName !== SENTINELS.string) {
            groups[fontName] = groups[fontName] || [];
            groups[fontName].push({
                from: range.getInteger('from'),
                to: range.getInteger('to'),
                size: range.getObject('textStyle').getUnitDouble('sizeKey')
            });
        }
        return groups;
    }, {} as Record<string, Array<{from: number, to: number, size: number}>>);
    
    return { allRanges, largeTextRanges, foundBoldText, fontGroups };
}

// ✅ ACCESSING LIST PROCESSING RESULTS
const listResults = processMultipleTextRanges('Complex Text Layer');

// Access all ranges
console.log('Total ranges processed:', listResults.allRanges.length);

// Access filtered ranges
console.log('Large text ranges found:', listResults.largeTextRanges.length);
listResults.largeTextRanges.forEach(range => {
    console.log('Large text range details:', range);
});

// Access boolean results
console.log('Has bold text:', listResults.foundBoldText);

// Access grouped results
Object.keys(listResults.fontGroups).forEach(fontName => {
    const ranges = listResults.fontGroups[fontName];
    console.log(`Font "${fontName}" used in ${ranges.length} ranges:`);
    ranges.forEach(range => {
        console.log(`  Characters ${range.from}-${range.to} at ${range.size}pt`);
    });
});
```

### Complex List Scenarios

```typescript
// Handle complex list scenarios from XML dumps
function handleComplexListScenarios() {
    const layer = ActionDescriptorNavigator.forLayerByName('Multi-Style Layer');
    
    // ✅ SCENARIO 1: Empty or invalid lists
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    const count = styleRanges.getCount();
    
    if (count === 0) {
        console.log('No text style ranges found');
        return { hasRanges: false };
    }
    
    // ✅ SCENARIO 2: Mixed valid/invalid ranges
    const validRanges = [];
    const invalidRanges = [];
    
    for (let i = 0; i < count; i++) {
        const range = styleRanges.getIndex(i);
        const from = range.getInteger('from');
        const to = range.getInteger('to');
        
        if (from !== SENTINELS.integer && to !== SENTINELS.integer && from < to) {
            validRanges.push({ index: i, range, from, to });
        } else {
            invalidRanges.push({ index: i, reason: 'Invalid character range' });
        }
    }
    
    // ✅ SCENARIO 3: Nested object validation
    const processedRanges = validRanges.map(({ range, from, to, index }) => {
        const textStyle = range.getObject('textStyle');
        
        // Check if text style is valid
        const fontSize = textStyle.getUnitDouble('sizeKey');
        const fontName = textStyle.getString('fontPostScriptName');
        
        const styleData = {
            index,
            from,
            to,
            isValidStyle: fontSize !== SENTINELS.double && fontName !== SENTINELS.string,
            fontSize,
            fontName
        };
        
        // Only process color if style is valid
        if (styleData.isValidStyle) {
            const colorObj = textStyle.getObject('color');
            styleData.color = {
                red: colorObj.getDouble('red'),
                green: colorObj.getDouble('green'),
                blue: colorObj.getDouble('blue'),
                isValidColor: colorObj.getDouble('red') !== SENTINELS.double
            };
        }
        
        return styleData;
    });
    
    return {
        hasRanges: true,
        totalRanges: count,
        validRanges: validRanges.length,
        invalidRanges: invalidRanges.length,
        processedRanges,
        summary: {
            validStyles: processedRanges.filter(r => r.isValidStyle).length,
            validColors: processedRanges.filter(r => r.color?.isValidColor).length
        }
    };
}

// ✅ ACCESSING COMPLEX SCENARIO RESULTS
const complexResults = handleComplexListScenarios();

if (complexResults.hasRanges) {
    console.log(`Found ${complexResults.totalRanges} total ranges`);
    console.log(`Valid: ${complexResults.validRanges}, Invalid: ${complexResults.invalidRanges}`);
    console.log(`Valid styles: ${complexResults.summary.validStyles}`);
    console.log(`Valid colors: ${complexResults.summary.validColors}`);
    
    // Process each range
    complexResults.processedRanges.forEach(range => {
        console.log(`Range ${range.index} (chars ${range.from}-${range.to}):`);
        if (range.isValidStyle) {
            console.log(`  Font: ${range.fontName} at ${range.fontSize}pt`);
            if (range.color?.isValidColor) {
                console.log(`  Color: rgb(${range.color.red}, ${range.color.green}, ${range.color.blue})`);
            }
        } else {
            console.log('  Invalid style data');
        }
    });
} else {
    console.log('No text ranges to process');
}
```

---

## Performance Optimization Guide

### API Call Minimization

```typescript
// ❌ INEFFICIENT: Repeated navigation (15+ API calls)
function inefficientExtraction(layerName: string) {
    const name = ActionDescriptorNavigator.forLayerByName(layerName).getString('name');
    const opacity = ActionDescriptorNavigator.forLayerByName(layerName).getInteger('opacity');
    const text = ActionDescriptorNavigator.forLayerByName(layerName).getObject('textKey').getString('textKey');
    const fontSize = ActionDescriptorNavigator.forLayerByName(layerName)
                                             .getObject('textKey')
                                             .getList('textStyleRange')
                                             .getFirst()
                                             .getObject('textStyle')
                                             .getUnitDouble('sizeKey');
}

// ✅ EFFICIENT: Cached navigation (6 API calls)
function efficientExtraction(layerName: string) {
    const layer = ActionDescriptorNavigator.forLayerByName(layerName);  // 1 call
    const textObj = layer.getObject('textKey');  // 1 call
    const firstStyle = textObj.getList('textStyleRange').getFirst().getObject('textStyle');  // 3 calls
    
    const name = layer.getString('name');  // 1 call
    const opacity = layer.getInteger('opacity');  // 1 call - total 6 calls
    const text = textObj.getString('textKey');  // Uses cached textObj
    const fontSize = firstStyle.getUnitDouble('sizeKey');  // Uses cached firstStyle
}
```

### Batch vs Individual Processing

```typescript
// Performance comparison for multiple properties
function performanceComparison(layerNames: string[]) {
    console.time('Individual Processing');
    
    // ❌ LESS EFFICIENT: Process each layer individually
    const individualResults = layerNames.map(name => {
        const layer = ActionDescriptorNavigator.forLayerByName(name);
        return {
            name: layer.getString('name'),
            opacity: layer.getInteger('opacity'),
            text: layer.getObject('textKey').getString('textKey')
        };
    });
    
    console.timeEnd('Individual Processing');
    
    console.time('Batch Processing');
    
    // ✅ MORE EFFICIENT: Batch process with cached operations
    const batchResults = [];
    layerNames.forEach(name => {
        const layer = ActionDescriptorNavigator.forLayerByName(name);
        const textObj = layer.getObject('textKey');  // Cache text object
        
        // Multiple extractions from cached objects
        batchResults.push({
            name: layer.getString('name'),
            opacity: layer.getInteger('opacity'),
            layerID: layer.getInteger('layerID'),  // Additional property from cached layer
            text: textObj.getString('textKey'),
            hasText: textObj.getString('textKey') !== SENTINELS.string  // Additional check from cached textObj
        });
    });
    
    console.timeEnd('Batch Processing');
    
    return { individualResults, batchResults };
}
```

### Collection Processing Optimization

```typescript
// Optimize collection processing based on use case
function optimizedCollectionProcessing() {
    const layer = ActionDescriptorNavigator.forLayerByName('Text Layer');
    const styleRanges = layer.getObject('textKey').getList('textStyleRange');
    
    // ✅ CASE 1: Need only first valid item
    console.time('First Item Only');
    const firstFont = styleRanges
        .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
        .getFirst()
        .getObject('textStyle')
        .getString('fontPostScriptName');
    console.timeEnd('First Item Only');  // Fastest: stops at first match
    
    // ⚠️ CASE 2: Need specific count
    console.time('Count Only');
    const validCount = styleRanges
        .whereMatches(range => range.getInteger('from') !== SENTINELS.integer)
        .getCount();
    console.timeEnd('Count Only');  // Moderate: must check all items
    
    // ❌ CASE 3: Need all items
    console.time('All Items');
    const allFonts = styleRanges
        .select(range => range.getObject('textStyle').getString('fontPostScriptName'))
        .whereMatches(font => font !== SENTINELS.string)
        .toResultArray();
    console.timeEnd('All Items');  // Slowest: processes every item
    
    return { firstFont, validCount, allFonts };
}
```

---

## Best Practices Summary

### Extraction Strategy Guidelines

1. **Use sentinel comparisons** - Never check for null/undefined except file/reference operations
2. **Cache navigation paths** - Store expensive object references in variables  
3. **Prefer forLayerByName** - More explicit than generic layer access
4. **Parallel DOM/ActionManager** - Use DOM for simple properties, ActionManager for complex
5. **Avoid brittle index access** - Use predicates instead of `.getIndex(0)`
6. **Choose appropriate collection methods** - `.getFirst()` vs `.toResultArray()` based on needs

### Performance Optimization

- **Minimize API calls** - Cache navigator objects and reuse them
- **Extract collections efficiently** - Get list once, then process in memory
- **Use parallel access** - DOM for basic properties, ActionManager for complex data
- **Batch process layers** - Process multiple layers in efficient loops
- **Avoid repeated navigation** - Cache expensive navigation paths

### Safety & Reliability

- **Sentinel system eliminates defensive checks** - No null validation needed (except files/references)
- **All extraction operations are crash-safe** - Framework handles all error conditions
- **Predicate-based filtering prevents errors** - No index out of bounds exceptions
- **Multiple extraction strategies** - Choose pattern based on complexity and reuse needs
- **Real XML-based examples** - Patterns tested against actual Photoshop document data

The ADN framework provides comprehensive, safe, and performant property extraction for Photoshop document analysis, enabling reliable data collection for downstream scoring and analysis workflows while maintaining optimal performance characteristics.