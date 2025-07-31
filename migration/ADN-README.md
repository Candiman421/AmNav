# ActionDescriptor Navigator (ADN) v3.0.0 - Complete Guide

## 🏗️ Architecture Overview

ADN provides a **crash-safe, fluent API** for navigating Photoshop's ActionManager with **full TypeScript generics** and **LINQ-style operations**. The v3.0.0 architecture delivers enterprise-grade type safety while maintaining the framework's core philosophy: **never crash, always return safe values**.

### **Framework Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                         │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Fluent Chains  │    │   DOM Access    │                │
│  │  (Type Safe)    │    │   (Simple)      │                │
│  └─────────┬───────┘    └─────────┬───────┘                │
└───────────│────────────────────────│────────────────────────┘
            │                        │
┌───────────▼────────────────────────▼────────────────────────┐
│                    ADN LAYER v3.0.0                        │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ ActionNavigator │    │ Generic LINQ    │                │
│  │ • forLayerByName│    │ • select<T>()   │                │
│  │ • getObject()   │    │ • whereMatches()│                │
│  │ • getList()     │    │ • toResultArray │                │
│  └─────────┬───────┘    └─────────┬───────┘                │
└───────────│────────────────────────│────────────────────────┘
            │                        │
┌───────────▼────────────────────────▼────────────────────────┐
│                   SENTINEL LAYER                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ Never Crash     │    │ Safe Defaults   │                │
│  │ • Try/catch all │    │ • "" (string)   │                │
│  │ • isSentinel    │    │ • -1 (numbers)  │                │
│  │ • Propagation   │    │ • null (files)  │                │
│  └─────────┬───────┘    └─────────┬───────┘                │
└───────────│────────────────────────│────────────────────────┘
            │                        │
┌───────────▼────────────────────────▼────────────────────────┐
│                 ADOBE ACTIONMANAGER                        │
│             (Crash-prone, but powerful)                    │
└─────────────────────────────────────────────────────────────┘
```

### **Core Design Principles**

1. **🛡️ Sentinel Safety**: Operations never crash - failed operations return sentinel values
2. **🔗 Fluent Chaining**: Natural, readable navigation with full type preservation
3. **⚡ Natural Caching**: Store navigators in `const` variables for optimal performance
4. **🎯 Generic Type Safety**: Complete TypeScript inference through complex operations
5. **📦 Mixed Systems**: Combine ActionManager (complex data) with DOM (simple properties)

---

## 📚 Part 1: Basic Value Extraction

### **1.1 Single Value Retrieval**

```typescript
import { ActionDescriptorNavigator, SENTINELS } from "./action-manager";

// ⚡ PERFORMANCE: ~1-2ms per navigation call
const layer = ActionDescriptorNavigator.forLayerByName("Title");

// Basic property access (fast once navigator is cached)
const layerName = layer.getString("name"); // "" if not found
const opacity = layer.getInteger("opacity"); // -1 if not found
const visible = layer.getBoolean("visible"); // false if not found

// ✅ GOOD: Values are always safe to use directly
console.log(`Layer: ${layerName}, Opacity: ${opacity}%`);

// ✅ OPTIONAL: Check for actual data vs sentinels when validation matters
if (layerName !== SENTINELS.string) {
  console.log("Found real layer name:", layerName);
}
```

### **1.2 Text Properties - Going Deeper**

```typescript
// Navigate into text structure (each getObject() call ~0.5-1ms)
const textObj = layer.getObject("textKey");
const textProperties = textObj.getObject("textStyleRange").getObject(0);
const textStyle = textProperties.getObject("textStyle");

// Extract text formatting values
const fontName = textStyle.getString("fontPostScriptName"); // "Arial-Bold"
const fontSize = textStyle.getUnitDouble("sizeKey"); // 24.0
const isBold = textStyle.getBoolean("syntheticBold"); // true
const isItalic = textStyle.getBoolean("syntheticItalic"); // false

// ❌ AVOID: Repeated navigation - expensive!
// const name1 = ActionDescriptorNavigator.forLayerByName('Title').getObject('textKey')...
// const name2 = ActionDescriptorNavigator.forLayerByName('Title').getObject('textKey')...
```

### **1.3 Performance Comparison - Single Values**

```typescript
// ❌ BAD: Repeated expensive navigation (6-10ms total)
function getBadTextInfo(layerName: string) {
  const font = ActionDescriptorNavigator.forLayerByName(layerName) // 2ms
    .getObject("textKey")
    .getObject("textStyleRange")
    .getObject(0)
    .getObject("textStyle")
    .getString("fontPostScriptName"); // 2ms

  const size = ActionDescriptorNavigator.forLayerByName(layerName) // 2ms
    .getObject("textKey")
    .getObject("textStyleRange")
    .getObject(0)
    .getObject("textStyle")
    .getUnitDouble("sizeKey"); // 2ms

  return { font, size };
}

// ✅ GOOD: Cache navigation, batch properties (2-3ms total)
function getGoodTextInfo(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName); // 2ms
  const textStyle = layer
    .getObject("textKey") // 1ms total
    .getObject("textStyleRange")
    .getObject(0)
    .getObject("textStyle");

  // Fast property access from cached navigator
  const font = textStyle.getString("fontPostScriptName"); // 0.01ms
  const size = textStyle.getUnitDouble("sizeKey"); // 0.01ms
  const bold = textStyle.getBoolean("syntheticBold"); // 0.01ms

  return { font, size, bold };
}
```

---

## 📚 Part 2: Collection Operations & LINQ Patterns

### **2.1 Basic List Navigation**

```typescript
// Get text style ranges list (performance: ~1ms)
const layer = ActionDescriptorNavigator.forLayerByName("Title");
const textObj = layer.getObject("textKey");
const styleRanges = textObj.getList("textStyleRange");

// Basic list information
const totalRanges = styleRanges.getCount(); // 0 if empty, never -1
console.log(`Found ${totalRanges} text ranges`);

// ❌ AVOID: Brittle index-based access
const firstRange = styleRanges.getObject(0); // Returns sentinel if index invalid

// ✅ BETTER: Condition-based access
const firstRange = styleRanges.getFirstWhere(
  (range) => range.getInteger("from") >= 0 // Any valid range
);

// ✅ BEST: Multiple conditions for robustness
const firstTextRange = styleRanges.getFirstWhere((range) => {
  const from = range.getInteger("from");
  const to = range.getInteger("to");
  return from >= 0 && to > from && to - from > 0; // Valid, non-empty range
});
```

### **2.2 Extracting Arrays of Raw Values**

```typescript
// Extract all font sizes from text ranges
const layer = ActionDescriptorNavigator.forLayerByName("Title");
const styleRanges = layer.getObject("textKey").getList("textStyleRange");

// ✅ GOOD: Extract array of single values
const fontSizes = styleRanges
  .select((range) => range.getObject("textStyle").getUnitDouble("sizeKey"))
  .toResultArray() // Returns number[]
  .filter((size) => size !== SENTINELS.double); // Remove failed extractions

console.log("Font sizes found:", fontSizes); // [12, 18, 24]

// ✅ BETTER: Extract array of raw value objects
interface RawTextData {
  from: number;
  to: number;
  fontName: string;
  fontSize: number;
  isBold: boolean;
}

const rawTextData = styleRanges
  .select<RawTextData>((range) => {
    const style = range.getObject("textStyle");
    return {
      from: range.getInteger("from"),
      to: range.getInteger("to"),
      fontName: style.getString("fontPostScriptName"),
      fontSize: style.getUnitDouble("sizeKey"),
      isBold: style.getBoolean("syntheticBold"),
    };
  })
  .toResultArray(); // TypeScript knows this is RawTextData[]

// Use extracted data (no more ActionManager calls needed)
rawTextData.forEach((data) => {
  if (data.fontSize !== SENTINELS.double) {
    console.log(`${data.fontName}: ${data.fontSize}pt, Bold: ${data.isBold}`);
  }
});
```

### **2.3 Advanced Filtering & Conditions**

```typescript
// ❌ AVOID: Weak conditions that may fail
const weakSearch = styleRanges.getFirstWhere(
  (range) => range.getInteger("from") === 0 // Too specific, brittle
);

// ✅ GOOD: Multiple fallback conditions
const betterSearch = styleRanges.getFirstWhere((range) => {
  const from = range.getInteger("from");
  const to = range.getInteger("to");
  const hasValidRange = from >= 0 && to > from;
  const hasStyle = !range.getObject("textStyle").isSentinel;
  return hasValidRange && hasStyle;
});

// ✅ BEST: Robust condition with multiple criteria
const bestSearch = styleRanges.getFirstWhere((range) => {
  // Check range validity
  const from = range.getInteger("from");
  const to = range.getInteger("to");
  if (from < 0 || to <= from) return false;

  // Check text style exists and has content
  const style = range.getObject("textStyle");
  if (style.isSentinel) return false;

  // Check has meaningful formatting
  const fontSize = style.getUnitDouble("sizeKey");
  const fontName = style.getString("fontPostScriptName");
  return fontSize > 0 && fontName !== SENTINELS.string;
});

// Filter collections with complex criteria
const validRanges = styleRanges
  .whereMatches((range) => {
    const from = range.getInteger("from");
    const to = range.getInteger("to");
    const length = to - from;

    // Only ranges with substantial text
    return length > 5 && from >= 0;
  })
  .debug("Valid text ranges"); // Helpful for debugging

console.log(`Found ${validRanges.getCount()} substantial text ranges`);
```

---

## 📚 Part 3: Deep Traversal & Caching Strategies

### **3.1 Progressive Depth Navigation**

```typescript
// ⚡ PERFORMANCE PATTERN: Cache at each navigation level
const layer = ActionDescriptorNavigator.forLayerByName("Title"); // 2ms

// Cache text-level navigation
const textObj = layer.getObject("textKey"); // 1ms
const styleRanges = textObj.getList("textStyleRange"); // 1ms

// Cache range-level navigation
const firstRange = styleRanges.getFirstWhere(
  (range) => range.getInteger("to") - range.getInteger("from") > 0
); // 1ms

// Cache style-level navigation
const textStyle = firstRange.getObject("textStyle"); // 1ms
const color = textStyle.getObject("color"); // 1ms

// Fast property access from cached navigators (0.01ms each)
const red = color.getDouble("red");
const green = color.getDouble("green");
const blue = color.getDouble("blue");
const fontName = textStyle.getString("fontPostScriptName");
const fontSize = textStyle.getUnitDouble("sizeKey");

// Total: ~7ms vs 25ms+ without caching
```

### **3.2 Batch Property Extraction**

```typescript
// ✅ BEST PRACTICE: Extract multiple properties from cached navigators
function extractCompleteTextInfo(layerName: string) {
  // Single navigation path (4-5ms total)
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const firstRange = layer
    .getObject("textKey")
    .getList("textStyleRange")
    .getFirstWhere(
      (range) => range.getInteger("to") > range.getInteger("from")
    );

  const textStyle = firstRange.getObject("textStyle");
  const color = textStyle.getObject("color");

  // Batch all property extractions (0.1ms total)
  return {
    // Text content
    rangeFrom: firstRange.getInteger("from"),
    rangeTo: firstRange.getInteger("to"),

    // Font properties
    fontName: textStyle.getString("fontPostScriptName"),
    fontSize: textStyle.getUnitDouble("sizeKey"),
    isBold: textStyle.getBoolean("syntheticBold"),
    isItalic: textStyle.getBoolean("syntheticItalic"),

    // Color properties
    red: color.getDouble("red"),
    green: color.getDouble("green"),
    blue: color.getDouble("blue"),

    // Advanced properties
    tracking: textStyle.getInteger("tracking"),
    leading: textStyle.getUnitDouble("leading"),
    baselineShift: textStyle.getUnitDouble("baselineShift"),
  };
}
```

### **3.3 Deep Collection Traversal**

```typescript
// Extract nested data from all ranges in efficient pattern
function extractAllTextDetails(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const styleRanges = layer.getObject("textKey").getList("textStyleRange");

  // Process all ranges with efficient caching
  const rangeDetails = styleRanges
    .whereMatches((range) => {
      const from = range.getInteger("from");
      const to = range.getInteger("to");
      return from >= 0 && to > from;
    })
    .select((range) => {
      // Cache navigation within this range
      const textStyle = range.getObject("textStyle");
      const color = textStyle.getObject("color");

      // Extract all needed properties at once
      return {
        range: {
          from: range.getInteger("from"),
          to: range.getInteger("to"),
        },
        font: {
          name: textStyle.getString("fontPostScriptName"),
          size: textStyle.getUnitDouble("sizeKey"),
          bold: textStyle.getBoolean("syntheticBold"),
          italic: textStyle.getBoolean("syntheticItalic"),
        },
        color: {
          red: color.getDouble("red"),
          green: color.getDouble("green"),
          blue: color.getDouble("blue"),
        },
        formatting: {
          tracking: textStyle.getInteger("tracking"),
          leading: textStyle.getUnitDouble("leading"),
        },
      };
    })
    .toResultArray();

  return rangeDetails; // TypeScript knows complete structure
}
```

---

## 📚 Part 4: Color Extraction Mastery

### **4.1 RGB Color Extraction**

```typescript
// Basic RGB color from text
const layer = ActionDescriptorNavigator.forLayerByName("Title");
const textStyle = layer
  .getObject("textKey")
  .getList("textStyleRange")
  .getFirstWhere((range) => !range.getObject("textStyle").isSentinel)
  .getObject("textStyle");

const color = textStyle.getObject("color");

// RGB values (0.0 - 1.0 range)
const red = color.getDouble("red"); // 0.0 - 1.0
const green = color.getDouble("green"); // 0.0 - 1.0
const blue = color.getDouble("blue"); // 0.0 - 1.0

// Convert to 0-255 range for typical use
const rgb255 = {
  r: Math.round(red * 255), // 0-255
  g: Math.round(green * 255), // 0-255
  b: Math.round(blue * 255), // 0-255
};

console.log(`RGB: ${rgb255.r}, ${rgb255.g}, ${rgb255.b}`);
```

### **4.2 CMYK Color Extraction**

```typescript
// CMYK color extraction from print-oriented documents
const layer = ActionDescriptorNavigator.forLayerByName("PrintLayer");
const color = layer
  .getObject("textKey")
  .getList("textStyleRange")
  .getFirstWhere((range) => !range.isSentinel)
  .getObject("textStyle")
  .getObject("color");

// Check color mode first
const colorSpace = color.getString("mode"); // "CMYK", "RGB", "Lab", etc.

if (colorSpace === "CMYK") {
  const cmyk = {
    cyan: color.getDouble("cyan"), // 0.0 - 1.0
    magenta: color.getDouble("magenta"), // 0.0 - 1.0
    yellow: color.getDouble("yellow"), // 0.0 - 1.0
    black: color.getDouble("black"), // 0.0 - 1.0
  };

  // Convert to percentage
  const cmykPercent = {
    c: Math.round(cmyk.cyan * 100), // 0-100%
    m: Math.round(cmyk.magenta * 100), // 0-100%
    y: Math.round(cmyk.yellow * 100), // 0-100%
    k: Math.round(cmyk.black * 100), // 0-100%
  };
}
```

### **4.3 Multiple Color Format Extraction**

```typescript
// Universal color extractor that handles multiple formats
function extractUniversalColor(colorNavigator: IActionDescriptorNavigator) {
  const colorSpace = colorNavigator.getString("mode");

  switch (colorSpace) {
    case "RGB":
      return {
        mode: "RGB",
        values: {
          red: colorNavigator.getDouble("red"),
          green: colorNavigator.getDouble("green"),
          blue: colorNavigator.getDouble("blue"),
        },
      };

    case "CMYK":
      return {
        mode: "CMYK",
        values: {
          cyan: colorNavigator.getDouble("cyan"),
          magenta: colorNavigator.getDouble("magenta"),
          yellow: colorNavigator.getDouble("yellow"),
          black: colorNavigator.getDouble("black"),
        },
      };

    case "Lab":
      return {
        mode: "Lab",
        values: {
          lightness: colorNavigator.getDouble("luminance"),
          a: colorNavigator.getDouble("a"),
          b: colorNavigator.getDouble("b"),
        },
      };

    default:
      return {
        mode: "Unknown",
        values: {},
      };
  }
}

// Usage with multiple layers
const layerNames = ["Title", "Subtitle", "Body"];
const colorInfo = layerNames.map((name) => {
  const layer = ActionDescriptorNavigator.forLayerByName(name);
  const color = layer
    .getObject("textKey")
    .getList("textStyleRange")
    .getFirstWhere((range) => !range.isSentinel)
    .getObject("textStyle")
    .getObject("color");

  return {
    layerName: name,
    color: extractUniversalColor(color),
  };
});
```

---

## 📚 Part 5: File, Path & Reference Handling (Null Exceptions)

### **5.1 File Path Operations - The Null Exception**

```typescript
// ⚠️ IMPORTANT: File operations return null, not sentinels
const layer = ActionDescriptorNavigator.forLayerByName("SmartObject");

// File operations that return null (not sentinels)
const linkedFile = layer.getPath("smartObject"); // File | null
const documentPath = layer.getPath("documentPath"); // File | null

// ✅ PROPER null checking (cannot chain further)
if (linkedFile !== null) {
  console.log("Linked file:", linkedFile.fsName);
  console.log("File exists:", linkedFile.exists);

  // File operations break the chain - handle separately
  if (linkedFile.exists) {
    const fileSize = linkedFile.length;
    console.log("File size:", fileSize);
  }
} else {
  console.log("No linked file found");
}

// ❌ CANNOT DO: Fluent chaining breaks here
// layer.getPath('smartObject').fsName;  // Error if null
```

### **5.2 Reference Operations**

```typescript
// Reference operations also return null, not sentinels
const layer = ActionDescriptorNavigator.forLayerByName("LinkedLayer");
const layerRef = layer.getReference("layerReference"); // ActionReference | null

if (layerRef !== null) {
  // ActionReference operations
  const refClass = layerRef.getDesiredClass();
  const refForm = layerRef.getForm();

  console.log("Reference class:", refClass);
  console.log("Reference form:", refForm);
} else {
  console.log("No layer reference found");
}

// Pattern: Extract reference data into regular objects for easier handling
function extractReferenceInfo(navigator: IActionDescriptorNavigator) {
  const ref = navigator.getReference("someReference");

  if (ref === null) {
    return {
      hasReference: false,
      className: "",
      form: -1,
    };
  }

  return {
    hasReference: true,
    className: ref.getDesiredClass(),
    form: ref.getForm(),
    // Note: Reference data extracted, can continue with normal chaining
  };
}
```

### **5.3 Mixed Chaining Patterns**

```typescript
// Combine fluent chaining with null-handling sections
function analyzeLayerWithFiles(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);

  // ✅ Standard fluent chaining (returns sentinels)
  const textInfo = {
    name: layer.getString("name"),
    opacity: layer.getInteger("opacity"),
    hasText: !layer.getObject("textKey").isSentinel,
  };

  // ⚠️ File operations section (returns null - handle separately)
  let fileInfo = {
    hasLinkedFile: false,
    fileName: "",
    fileExists: false,
  };

  const linkedFile = layer.getPath("smartObject");
  if (linkedFile !== null) {
    fileInfo = {
      hasLinkedFile: true,
      fileName: linkedFile.name,
      fileExists: linkedFile.exists,
    };
  }

  // ✅ Continue with fluent chaining after null section
  const styleInfo = layer.getObject("layerEffects").getBoolean("dropShadow");

  return {
    text: textInfo,
    file: fileInfo,
    hasEffects: styleInfo,
  };
}
```

---

## 📚 Part 6: Parallel DOM & ActionManager Patterns

### **6.1 When to Use Each System**

```typescript
import { getDOMLayerByName } from "./ps";

// ✅ DOM: Fast for simple properties
const domLayer = getDOMLayerByName("Title");
const simpleProps = {
  visible: domLayer?.visible ?? false, // 0.5ms - simple property
  opacity: domLayer?.opacity ?? 0, // 0.5ms - simple property
  blendMode: domLayer?.blendMode ?? "normal", // 0.5ms - simple property
};

// ✅ ActionManager: Required for complex data
const layer = ActionDescriptorNavigator.forLayerByName("Title");
const complexProps = {
  textContent: layer
    .getObject("textKey") // 2ms - complex navigation
    .getList("textStyleRange")
    .select((range) => range.getString("text"))
    .toResultArray(),
  fontDetails: layer
    .getObject("textKey") // 1ms - already cached path
    .getList("textStyleRange")
    .select((range) => ({
      font: range.getObject("textStyle").getString("fontPostScriptName"),
      size: range.getObject("textStyle").getUnitDouble("sizeKey"),
    }))
    .toResultArray(),
};
```

### **6.2 Optimal Mixed Approach**

```typescript
// ✅ BEST: Combine both systems strategically
function getComprehensiveLayerInfo(layerName: string) {
  // DOM for simple, fast properties (1-2ms total)
  const domLayer = getDOMLayerByName(layerName);
  const domProps = domLayer
    ? {
        visible: domLayer.visible,
        opacity: domLayer.opacity,
        blendMode: domLayer.blendMode,
        kind: domLayer.kind,
        typename: domLayer.typename,
      }
    : null;

  // ActionManager for complex data (3-5ms total)
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const actionManagerProps = {
    bounds: layer.getBounds(),
    hasText: !layer.getObject("textKey").isSentinel,
    textRangeCount: layer
      .getObject("textKey")
      .getList("textStyleRange")
      .getCount(),
    layerEffects: {
      dropShadow: layer.getObject("layerEffects").getBoolean("dropShadow"),
      innerShadow: layer.getObject("layerEffects").getBoolean("innerShadow"),
      outerGlow: layer.getObject("layerEffects").getBoolean("outerGlow"),
    },
  };

  return {
    layerName,
    existsInDOM: domProps !== null,
    existsInActionManager: !layer.isSentinel,
    dom: domProps,
    actionManager: actionManagerProps,
    // Combined analysis
    isCompletelyAccessible: domProps !== null && !layer.isSentinel,
  };
}
```

### **6.3 Performance Comparison - Mixed Systems**

```typescript
// Performance comparison for different approaches

// ❌ SLOW: ActionManager for everything (8-10ms)
function slowApproach(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  return {
    visible: layer.getBoolean("visible"), // 2ms
    opacity: layer.getInteger("opacity"), // 2ms
    blendMode: layer.getString("blendMode"), // 2ms
    hasText: !layer.getObject("textKey").isSentinel, // 2ms
  };
}

// ✅ FAST: Mixed approach (3-4ms)
function fastApproach(layerName: string) {
  const domLayer = getDOMLayerByName(layerName); // 1ms
  const layer = ActionDescriptorNavigator.forLayerByName(layerName); // 2ms

  return {
    // DOM properties (fast)
    visible: domLayer?.visible ?? false, // 0.01ms
    opacity: domLayer?.opacity ?? 0, // 0.01ms
    blendMode: domLayer?.blendMode ?? "normal", // 0.01ms

    // ActionManager properties (when needed)
    hasText: !layer.getObject("textKey").isSentinel, // 1ms
    bounds: layer.getBounds(), // 0.5ms
  };
}
```

---

## 📚 Part 7: Multiple Approaches & Comparisons

### **7.1 Different Ways to Get Font Information**

```typescript
// Approach 1: Direct index access (brittle)
function getFontInfo_Brittle(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const style = layer
    .getObject("textKey")
    .getList("textStyleRange")
    .getObject(0) // ❌ Fails if no ranges
    .getObject("textStyle");

  return style.getString("fontPostScriptName");
}

// Approach 2: Safe first range (better)
function getFontInfo_Safe(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const firstRange = layer
    .getObject("textKey")
    .getList("textStyleRange")
    .getFirstWhere((range) => !range.isSentinel); // ✅ Safe fallback

  return firstRange.getObject("textStyle").getString("fontPostScriptName");
}

// Approach 3: Comprehensive analysis (best)
function getFontInfo_Comprehensive(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const styleRanges = layer.getObject("textKey").getList("textStyleRange");

  // Get all unique fonts used in layer
  const allFonts = styleRanges
    .whereMatches((range) => {
      const style = range.getObject("textStyle");
      return (
        !style.isSentinel &&
        style.getString("fontPostScriptName") !== SENTINELS.string
      );
    })
    .select((range) =>
      range.getObject("textStyle").getString("fontPostScriptName")
    )
    .toResultArray();

  // Remove duplicates and sentinels
  const uniqueFonts = [...new Set(allFonts)].filter(
    (font) => font !== SENTINELS.string
  );

  return {
    primaryFont: uniqueFonts[0] || "No font found",
    allFonts: uniqueFonts,
    fontCount: uniqueFonts.length,
  };
}
```

### **7.2 Layer Search Strategies**

```typescript
// Strategy 1: Single layer by exact name
const exactLayer = ActionDescriptorNavigator.forLayerByName("Title");

// Strategy 2: Multiple fallback names
function findLayerWithFallbacks(preferredNames: string[]) {
  for (const name of preferredNames) {
    const layer = ActionDescriptorNavigator.forLayerByName(name);
    if (!layer.isSentinel) {
      return layer;
    }
  }
  return ActionDescriptorNavigator.createSentinel();
}

const titleLayer = findLayerWithFallbacks([
  "Title",
  "Header",
  "MainTitle",
  "title",
]);

// Strategy 3: Pattern-based search through all layers
function findLayersByPattern(pattern: RegExp) {
  const results = [];
  const doc = ActionDescriptorNavigator.forCurrentDocument();
  const layerCount = doc.getInteger("numberOfLayers");

  for (let i = 1; i <= layerCount; i++) {
    const layer = ActionDescriptorNavigator.forLayerByIndex(i);
    const name = layer.getString("name");

    if (name !== SENTINELS.string && pattern.test(name)) {
      results.push({
        layer: layer,
        name: name,
        index: i,
      });
    }
  }

  return results;
}

const titleLayers = findLayersByPattern(/title|header|heading/i);
```

### **7.3 Color Extraction Comparison**

```typescript
// Method 1: First range color only
function getFirstRangeColor(layerName: string) {
  const color = ActionDescriptorNavigator.forLayerByName(layerName)
    .getObject("textKey")
    .getList("textStyleRange")
    .getFirstWhere((range) => !range.isSentinel)
    .getObject("textStyle")
    .getObject("color");

  return {
    red: color.getDouble("red"),
    green: color.getDouble("green"),
    blue: color.getDouble("blue"),
  };
}

// Method 2: All unique colors
function getAllUniqueColors(layerName: string) {
  const styleRanges = ActionDescriptorNavigator.forLayerByName(layerName)
    .getObject("textKey")
    .getList("textStyleRange");

  const allColors = styleRanges
    .whereMatches(
      (range) => !range.getObject("textStyle").getObject("color").isSentinel
    )
    .select((range) => {
      const color = range.getObject("textStyle").getObject("color");
      return {
        red: color.getDouble("red"),
        green: color.getDouble("green"),
        blue: color.getDouble("blue"),
      };
    })
    .toResultArray();

  // Remove duplicate colors
  const uniqueColors = allColors.filter(
    (color, index, array) =>
      array.findIndex(
        (c) =>
          c.red === color.red &&
          c.green === color.green &&
          c.blue === color.blue
      ) === index
  );

  return uniqueColors;
}

// Method 3: Dominant color analysis
function getDominantColor(layerName: string) {
  const styleRanges = ActionDescriptorNavigator.forLayerByName(layerName)
    .getObject("textKey")
    .getList("textStyleRange");

  const colorUsage = new Map<
    string,
    { color: any; count: number; totalChars: number }
  >();

  styleRanges.toResultArray().forEach((range) => {
    const from = range.getInteger("from");
    const to = range.getInteger("to");
    const charCount = to - from;

    const color = range.getObject("textStyle").getObject("color");
    const colorKey = `${color.getDouble("red")},${color.getDouble(
      "green"
    )},${color.getDouble("blue")}`;

    if (colorUsage.has(colorKey)) {
      const usage = colorUsage.get(colorKey)!;
      usage.count++;
      usage.totalChars += charCount;
    } else {
      colorUsage.set(colorKey, {
        color: {
          red: color.getDouble("red"),
          green: color.getDouble("green"),
          blue: color.getDouble("blue"),
        },
        count: 1,
        totalChars: charCount,
      });
    }
  });

  // Find most used color by character count
  let dominantColor = null;
  let maxChars = 0;

  for (const usage of colorUsage.values()) {
    if (usage.totalChars > maxChars) {
      maxChars = usage.totalChars;
      dominantColor = usage.color;
    }
  }

  return dominantColor;
}
```

---

## 📚 Part 8: Advanced Caching & Performance Patterns

### **8.1 Multi-Level Caching Strategy**

```typescript
// ✅ OPTIMAL: Cache at multiple levels for complex operations
function analyzeComplexDocument() {
  // Level 1: Document-level cache
  const doc = ActionDescriptorNavigator.forCurrentDocument(); // 1ms
  const layerCount = doc.getInteger("numberOfLayers");

  const results = [];

  for (let i = 1; i <= layerCount; i++) {
    // Level 2: Layer-level cache
    const layer = ActionDescriptorNavigator.forLayerByIndex(i); // 1ms per layer
    const layerName = layer.getString("name");

    if (layerName === SENTINELS.string) continue;

    // Level 3: Text object cache (if text layer)
    const textObj = layer.getObject("textKey");
    if (!textObj.isSentinel) {
      // Level 4: Range collection cache
      const styleRanges = textObj.getList("textStyleRange"); // 1ms
      const rangeCount = styleRanges.getCount();

      if (rangeCount > 0) {
        // Level 5: Individual range cache for processing
        const textDetails = styleRanges
          .whereMatches(
            (range) => range.getInteger("to") > range.getInteger("from")
          )
          .select((range) => {
            // Level 6: Style object cache within range processing
            const style = range.getObject("textStyle"); // Cached per range
            const color = style.getObject("color"); // Cached per style

            // Fast property extraction from cached objects
            return {
              rangeLength: range.getInteger("to") - range.getInteger("from"),
              font: style.getString("fontPostScriptName"),
              size: style.getUnitDouble("sizeKey"),
              color: {
                red: color.getDouble("red"),
                green: color.getDouble("green"),
                blue: color.getDouble("blue"),
              },
            };
          })
          .toResultArray();

        results.push({
          layerName,
          index: i,
          textRanges: textDetails,
        });
      }
    }
  }

  return results;
}
```

### **8.2 Selective Caching for Performance**

```typescript
// Cache only what you need for the specific operation
function getEfficientLayerSummary(layerNames: string[]) {
  return layerNames.map((name) => {
    // Cache layer navigator
    const layer = ActionDescriptorNavigator.forLayerByName(name); // 2ms per layer

    if (layer.isSentinel) {
      return { layerName: name, exists: false };
    }

    // Decision point: Only dive deeper if layer has text
    const textObj = layer.getObject("textKey"); // 1ms
    if (textObj.isSentinel) {
      return {
        layerName: name,
        exists: true,
        hasText: false,
        basicProps: {
          opacity: layer.getInteger("opacity"),
          visible: layer.getBoolean("visible"),
        },
      };
    }

    // Text exists - cache range access for further analysis
    const styleRanges = textObj.getList("textStyleRange"); // 1ms
    const firstRange = styleRanges.getFirstWhere(
      (range) => range.getInteger("to") > range.getInteger("from")
    );

    if (firstRange.isSentinel) {
      return {
        layerName: name,
        exists: true,
        hasText: true,
        hasValidRanges: false,
      };
    }

    // Valid text found - cache style access for properties
    const firstStyle = firstRange.getObject("textStyle"); // 0.5ms

    return {
      layerName: name,
      exists: true,
      hasText: true,
      hasValidRanges: true,
      textSample: {
        fontName: firstStyle.getString("fontPostScriptName"),
        fontSize: firstStyle.getUnitDouble("sizeKey"),
        rangeLength:
          firstRange.getInteger("to") - firstRange.getInteger("from"),
      },
    };
  });
}
```

### **8.3 Avoid Over-Caching**

```typescript
// ❌ BAD: Unnecessary caching for simple operations
function overCachedExample(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const textObj = layer.getObject("textKey"); // Unnecessary if just checking existence
  const styleRanges = textObj.getList("textStyleRange"); // Unnecessary if just checking count
  const firstRange = styleRanges.getObject(0); // Unnecessary if just checking count

  return styleRanges.getCount(); // Could have been done at styleRanges level
}

// ✅ GOOD: Minimal caching for the actual need
function efficientExample(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  return layer.getObject("textKey").getList("textStyleRange").getCount(); // Direct path
}

// ✅ BETTER: Cache only when doing multiple operations
function smartCachingExample(layerName: string) {
  const layer = ActionDescriptorNavigator.forLayerByName(layerName);
  const styleRanges = layer.getObject("textKey").getList("textStyleRange"); // Cache because used twice

  return {
    rangeCount: styleRanges.getCount(), // Use cached navigator
    hasValidRanges: styleRanges.hasAnyMatches(), // Use cached navigator
  };
}
```

---

## 📚 Part 9: Best Practices Summary

### **🎯 Core Principles**

1. **Cache Navigation, Not Values**: Store navigators in `const` variables, extract values as needed
2. **Sentinels are Safe**: All values can be used directly; check sentinels only for validation
3. **Files Break Chains**: Handle `null` returns from file/path operations separately
4. **Mix Systems Wisely**: DOM for simple properties, ActionManager for complex data
5. **Robust Conditions**: Use multiple criteria instead of brittle exact matches

### **⚡ Performance Guidelines**

| Operation          | Cost    | Best Practice                                  |
| ------------------ | ------- | ---------------------------------------------- |
| `forLayerByName()` | 1-2ms   | Cache the navigator                            |
| `getObject()`      | 0.5-1ms | Chain multiple gets, cache end result          |
| `getList()`        | 0.5-1ms | Cache for multiple operations                  |
| Property access    | 0.01ms  | Extract all needed props from cached navigator |
| LINQ operations    | 0.1ms   | Use freely on cached collections               |
| DOM access         | 0.5ms   | Use for simple properties only                 |

### **🔄 Fluent Chaining Patterns**

```typescript
// ✅ EXCELLENT: Natural caching with comprehensive extraction
const layer = ActionDescriptorNavigator.forLayerByName("Title"); // Cache layer
const textRanges = layer.getObject("textKey").getList("textStyleRange"); // Cache ranges

const analysis = textRanges
  .whereMatches((range) => range.getInteger("to") > range.getInteger("from"))
  .select<TextAnalysis>((range) => {
    const style = range.getObject("textStyle"); // Cache style per range
    const color = style.getObject("color"); // Cache color per style

    return {
      // Extract all needed properties at once
      range: { from: range.getInteger("from"), to: range.getInteger("to") },
      font: {
        name: style.getString("fontPostScriptName"),
        size: style.getUnitDouble("sizeKey"),
      },
      color: {
        red: color.getDouble("red"),
        green: color.getDouble("green"),
        blue: color.getDouble("blue"),
      },
      format: {
        bold: style.getBoolean("syntheticBold"),
        italic: style.getBoolean("syntheticItalic"),
      },
    };
  })
  .toResultArray();

// Use extracted data - no more ActionManager calls needed
analysis.forEach((item) => {
  console.log(
    `${item.font.name} ${item.font.size}pt: RGB(${item.color.red}, ${item.color.green}, ${item.color.blue})`
  );
});
```

### **⚠️ Common Anti-Patterns to Avoid**

```typescript
// ❌ AVOID: Repeated navigation
const font1 = ActionDescriptorNavigator.forLayerByName('Title').getObject('textKey')...
const font2 = ActionDescriptorNavigator.forLayerByName('Title').getObject('textKey')...

// ❌ AVOID: Brittle index access
const firstRange = styleRanges.getObject(0);  // Fails if no ranges

// ❌ AVOID: Weak conditions
const range = styleRanges.getFirstWhere(r => r.getInteger('from') === 0);  // Too specific

// ❌ AVOID: ActionManager for simple properties
const visible = layer.getBoolean('visible');  // Use DOM instead

// ❌ AVOID: Trying to chain after null returns
const file = layer.getPath('file').fsName;  // Crashes if getPath() returns null
```

### **🎉 Framework Mastery**

With ADN v3.0.0, you have:

- **🛡️ Crash-proof operations** with intelligent sentinel handling
- **🔗 Fluent chaining** with full TypeScript type safety
- **⚡ Performance optimization** through natural caching patterns
- **🎯 Precision extraction** of any Photoshop data structure
- **🔄 Flexible approaches** for different scenarios and requirements

The framework scales from simple single-value extraction to complex multi-layer analysis while maintaining consistency, performance, and type safety throughout your application.
