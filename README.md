# ActionManager Navigator

**Complete Adobe ExtendScript ActionManager API with Fluent Navigation**

> Transform brittle Photoshop scripts into robust, criteria-based automation tools

🔹 **TypeScript 4.1.6** | 🔹 **ExtendScript ES3** | 🔹 **Adobe Photoshop CS5+** | 🔹 **Webpack Build**

---

## 🎯 What This Solves

**The Problem**: Photoshop scripts break when document structure changes
```javascript
// ❌ Brittle - crashes when structure differs
var desc = executeActionGet(ref);
var textDesc = desc.getObjectValue(stringIDToTypeID('textKey'));
var list = textDesc.getList(stringIDToTypeID('textStyleRange'));
var range = list.getObjectValue(0); // CRASH if no ranges exist
```

**The Solution**: Criteria-based navigation that never crashes
```typescript
// ✅ Robust - finds what you need, never crashes
const fontSize = ActionDescriptorNavigator.forCurrentLayer()
  .getObject('textKey')
  .getList('textStyleRange')
  .getFirstWhere(range => range.getInteger('from') === 0)
  .getObject('textStyle')
  .getUnitDouble('sizeKey');  // Always returns safe value
```

---

## 🚀 Quick Start

### Installation

1. **Add to Your Project**:
   ```
   your-project/
   ├── ps/
   │   ├── action-manager/          ← Drop in this complete module
   │   │   ├── index.ts
   │   │   ├── ActionDescriptorNavigator.ts
   │   │   ├── action-manager-api.ts
   │   │   ├── types.ts
   │   │   └── globals.d.ts
   │   └── your-existing-code.ts
   ├── es5-polyfills.js            ← ExtendScript compatibility
   └── your-script.jsx
   ```

2. **Build for ExtendScript**:
   ```bash
   npm install
   npm run build                   # Creates dist/ActionDescriptorNavigator.js
   ```

3. **Use in ExtendScript**:
   ```javascript
   #include "es5-polyfills.js"
   #include "dist/ActionDescriptorNavigator.js"
   
   // Ready to use!
   var layer = ActionDescriptorNavigator.forCurrentLayer();
   ```

### Basic Usage

```typescript
// TypeScript development
import { ActionDescriptorNavigator, SENTINELS } from '../ps/action-manager';

const layer = ActionDescriptorNavigator.forCurrentLayer();

// Extract font information safely
const fontData = layer
  .getObject('textKey')
  .getList('textStyleRange')
  .getAllWhere(range => range.getInteger('from') >= 0)
  .map(range => ({
    from: range.getInteger('from'),
    to: range.getInteger('to'),
    font: range.getObject('textStyle').getString('fontPostScriptName'),
    size: range.getObject('textStyle').getUnitDouble('sizeKey')
  }));

// Check for valid results
if (fontData.length > 0) {
  console.log('Found', fontData.length, 'text ranges');
}
```

---

## 🏗️ Architecture Overview

### Module Structure

```
ps/action-manager/
├── index.ts                      🎯 Main exports with namespace safety
├── ActionDescriptorNavigator.ts  🧭 Fluent navigation classes
├── action-manager-api.ts         🔧 Complete ActionManager API wrapper
├── types.ts                      📝 Type system with sentinel error handling
└── globals.d.ts                  🌐 ExtendScript global declarations
```

### Build System Flow

```
TypeScript Source → Webpack + ES3Plugin → dist/ActionDescriptorNavigator.js → ExtendScript Runtime
                                      ↗
es5-polyfills.js ────────────────────┘

Development:                Production:
npm run dev                npm run build
npm run test:watch         npm run prod-ready
```

### Import Patterns

```typescript
// Direct imports (recommended)
import { ActionDescriptorNavigator, SENTINELS } from '../ps/action-manager';

// Namespace imports (maximum safety)
import { ActionManager } from '../ps/action-manager';
const layer = ActionManager.Navigator.forCurrentLayer();

// Complete API access
import { 
  executeActionGet, 
  stringIDToTypeID, 
  ActionDescriptor 
} from '../ps/action-manager';
```

---

## 📊 XML to Code Workflow

### Using xtools2.3 for Development

1. **Generate XML Dumps**:
   - Use xtools2.3's `GetterDemo.jsx` to analyze PSD structure
   - Examine ActionManager hierarchy in XML format
   - Identify property names and object relationships

2. **Map XML to AmNav Code**:
   ```xml
   <!-- XML structure from xtools2.3 -->
   <Object symname="textKey">
     <List symname="textStyleRange">
       <Object>
         <Object symname="textStyle">
           <String symname="fontPostScriptName" value="ArialMT"/>
           <UnitDouble symname="sizeKey" value="48"/>
         </Object>
       </Object>
     </List>
   </Object>
   ```

   ```typescript
   // Corresponding AmNav code
   const fontName = layer
     .getObject('textKey')              // <Object symname="textKey">
     .getList('textStyleRange')         // <List symname="textStyleRange">
     .getFirstWhere(range => true)      // <Object> (first item)
     .getObject('textStyle')            // <Object symname="textStyle">
     .getString('fontPostScriptName');  // <String symname="fontPostScriptName">
   ```

3. **Test with Real PSDs**:
   ```bash
   npm run build-tests                 # Prepare tests for Photoshop
   # Copy tests/extendscript-tests/*.js to Photoshop environment
   ```

---

## 🎯 Core Navigation Patterns

### Pattern 1: Safe Property Extraction

```typescript
// Navigate deep hierarchies safely
const analysis = {
  // Text properties
  fontName: layer.getObject('textKey')
    .getList('textStyleRange')
    .getFirstWhere(range => range.getInteger('from') === 0)
    .getObject('textStyle')
    .getString('fontPostScriptName'),
  
  // Layer properties  
  opacity: layer.getInteger('opacity'),
  visible: layer.getBoolean('visible'),
  
  // Bounds with automatic detection
  bounds: layer.getBounds()  // Handles both modern PS and text bounds
};

// Validate results
Object.keys(analysis).forEach(key => {
  const value = analysis[key];
  if (value !== SENTINELS.string && value !== SENTINELS.integer && value !== SENTINELS.boolean) {
    console.log(`${key}:`, value);
  }
});
```

### Pattern 2: Criteria-Based Collection Processing

```typescript
// Find all bold text ranges
const boldRanges = layer
  .getObject('textKey')
  .getList('textStyleRange')
  .getAllWhere(range => 
    range.getObject('textStyle').getBoolean('syntheticBold')
  );

// Transform to analysis data
const boldFonts = boldRanges
  .map(range => ({
    from: range.getInteger('from'),
    to: range.getInteger('to'),
    font: range.getObject('textStyle').getString('fontPostScriptName'),
    size: range.getObject('textStyle').getUnitDouble('sizeKey')
  }))
  .filter(item => item.font !== SENTINELS.string);

console.log(`Found ${boldFonts.length} bold text ranges`);
```

### Pattern 3: Performance Optimization with Caching

```typescript
// Cache navigators for repeated access
const textObj = layer.getObject('textKey');
const styleRanges = textObj.getList('textStyleRange');
const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
const textStyle = firstRange.getObject('textStyle');
const color = textStyle.getObject('color');

// Fast repeated property access
const textAnalysis = {
  font: textStyle.getString('fontPostScriptName'),
  size: textStyle.getUnitDouble('sizeKey'),
  bold: textStyle.getBoolean('syntheticBold'),
  italic: textStyle.getBoolean('syntheticItalic'),
  red: color.getDouble('red'),
  green: color.getDouble('green'),
  blue: color.getDouble('blue')
};
```

---

## 🛡️ Error Handling System

### Sentinel Values - Never Crash

The module uses **sentinel values** instead of exceptions:

```typescript
// These NEVER crash - always return safe defaults
const fontName = layer.getString('invalidProperty');      // Returns ""
const fontSize = layer.getInteger('invalidProperty');     // Returns -1
const isVisible = layer.getBoolean('invalidProperty');    // Returns false
const child = layer.getObject('invalidProperty');         // Returns sentinel navigator

// Chain through invalid paths safely
const deepValue = layer
  .getObject('nonexistent')          // Sentinel navigator
  .getList('alsoNonexistent')        // Sentinel list
  .getFirstWhere(x => true)          // Sentinel navigator
  .getString('somethingElse');       // "" (empty string)

// Check for valid data
if (fontName !== SENTINELS.string) {
  // Use the font name safely
}
```

### Sentinel Constants

```typescript
import { SENTINELS } from '../ps/action-manager';

// Check against sentinel values
if (value !== SENTINELS.string) { /* valid string */ }
if (value !== SENTINELS.integer) { /* valid number */ }
if (value !== SENTINELS.boolean) { /* valid boolean */ }
```

---

## 🔧 Complete API Reference

### Static Factory Methods

```typescript
// Document and layer access
ActionDescriptorNavigator.forCurrentDocument()
ActionDescriptorNavigator.forCurrentLayer()
ActionDescriptorNavigator.forLayerByName(layerName: string)

// Always returns navigator - never null
```

### Navigation Methods

```typescript
// Object navigation
navigator.getObject(key: string): IActionDescriptorNavigator
navigator.getList(key: string): IActionListNavigator

// Value extraction
navigator.getString(key: string): string
navigator.getInteger(key: string): number
navigator.getDouble(key: string): number
navigator.getUnitDouble(key: string): number
navigator.getBoolean(key: string): boolean
navigator.getEnumerationString(key: string): string

// Specialized methods
navigator.getBounds(): BoundsObject
navigator.hasKey(key: string): boolean
navigator.select<T>(selector: Function): T | null
```

### Collection Query Methods

```typescript
// Single result queries
list.getFirstWhere(predicate): IActionDescriptorNavigator
list.getSingleWhere(predicate): IActionDescriptorNavigator  // Validates exactly one

// Multiple result queries  
list.getAllWhere(predicate): IActionDescriptorNavigator[]

// LINQ-style operations
list.whereMatches(predicate).select(transformer).toResultArray()
```

### ActionManager API Functions

```typescript
// Core execution
executeActionGet(reference: ActionReference): ActionDescriptor
executeAction(eventID: number, descriptor?: ActionDescriptor): ActionDescriptor

// Type conversion
stringIDToTypeID(stringID: string): number
charIDToTypeID(charID: string): number
typeIDToStringID(typeID: number): string

// Object construction
ActionDescriptor(): ActionDescriptor
ActionReference(): ActionReference
ActionList(): ActionList
```

---

## 🧪 Testing & Validation

### Build and Test Workflow

```bash
# Development cycle
npm run dev-quick              # Quick development build
npm run test:watch             # Continuous testing

# Production preparation
npm run validate               # Lint + test + build
npm run prod-ready             # Full validation + production build

# ExtendScript testing
npm run build-tests            # Prepare tests for Photoshop
npm run generate-assets        # Generate test PSD files
```

### ExtendScript Test Example

```javascript
// tests/extendscript-tests/test-complex-text.js
#include "../dist/ActionDescriptorNavigator.js"

function testComplexText() {
    var layer = ActionDescriptorNavigator.forCurrentLayer();
    var allRanges = layer
        .getObject('textKey')
        .getList('textStyleRange')
        .getAllWhere(function(range) {
            return range.getInteger('to') > range.getInteger('from');
        });

    var results = [];
    for (var i = 0; i < allRanges.length; i++) {
        var range = allRanges[i];
        var style = range.getObject('textStyle');
        
        results.push({
            from: range.getInteger('from'),
            to: range.getInteger('to'),
            font: style.getString('fontPostScriptName'),
            size: style.getUnitDouble('sizeKey')
        });
    }
    
    $.writeln("Found " + results.length + " text ranges");
    return results;
}

testComplexText();
```

### Test Asset Structure

```json
{
  "name": "complex-text",
  "filename": "complex-text.psd",
  "description": "Text with multiple colors and styles",
  "expectedProperties": {
    "layerCount": 2,
    "hasText": true,
    "textLayers": ["Title Layer", "Subtitle Layer"],
    "expectedFonts": ["ArialMT"]
  }
}
```

---

## 📦 Integration Strategies

### New Project Setup

1. **Copy Module**:
   ```bash
   cp -r action-manager/ your-project/ps/action-manager/
   cp es5-polyfills.js your-project/
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Use**:
   ```typescript
   import { ActionDescriptorNavigator } from '../ps/action-manager';
   ```

### Existing Framework Integration

1. **Drop-in Module**: Copy `action-manager/` folder to existing framework
2. **Namespace Safety**: Use `ActionManager` namespace to avoid conflicts
3. **Gradual Migration**: Replace existing ActionManager code incrementally
4. **Complementary APIs**: Use alongside existing Document API functions

```typescript
// Hybrid approach - each API for its strengths
import { ActionDescriptorNavigator } from '../ps/action-manager';
import { SamplePixelColors } from '../ps/existing-utils';

// ActionManager for properties, Document API for pixel operations
const bounds = ActionDescriptorNavigator.forCurrentLayer().getBounds();
const colors = SamplePixelColors(doc, [{x: bounds.left, y: bounds.top}]);
```

---

## 🎨 Advanced Examples

### Multi-Layer Text Analysis

```typescript
// Analyze all text layers in document
function analyzeDocumentText(): TextAnalysis[] {
  const results: TextAnalysis[] = [];
  
  // Note: Would need document.layers iteration (future enhancement)
  // For now, analyze current layer
  const layer = ActionDescriptorNavigator.forCurrentLayer();
  
  if (layer.hasKey('textKey')) {
    const allRanges = layer
      .getObject('textKey')
      .getList('textStyleRange')
      .getAllWhere(range => range.getInteger('to') > range.getInteger('from'));
    
    const analysis = allRanges.map(range => {
      const style = range.getObject('textStyle');
      return {
        layerName: layer.getString('name'),
        from: range.getInteger('from'),
        to: range.getInteger('to'),
        font: style.getString('fontPostScriptName'),
        size: style.getUnitDouble('sizeKey'),
        bold: style.getBoolean('syntheticBold'),
        italic: style.getBoolean('syntheticItalic')
      };
    }).filter(item => item.font !== SENTINELS.string);
    
    results.push(...analysis);
  }
  
  return results;
}
```

### Smart Bounds Detection

```typescript
// Automatically handles different bounds types
function getLayerDimensions() {
  const bounds = ActionDescriptorNavigator.forCurrentLayer().getBounds();
  
  // Works for both:
  // - Modern PS layer bounds (direct width/height)
  // - Text bounds (calculated width/height)
  // - Older PS versions (calculated width/height)
  
  return {
    width: bounds.width,    // Always available
    height: bounds.height,  // Always available
    area: bounds.width * bounds.height,
    aspectRatio: bounds.width / bounds.height
  };
}
```

---

## 🔮 Future Enhancements

### Potential Expansions

1. **Document Iteration**: Full document/layer iteration support
2. **Document API Bridge**: Integration with pixel sampling and drawing operations
3. **Performance Optimization**: Intelligent caching and batch operations
4. **Higher-Level Abstractions**: Design analysis tools built on ActionManager foundation

### Community Contributions

- **Test Assets**: Additional PSD files for comprehensive testing
- **Examples**: Real-world usage patterns and recipes
- **Documentation**: More XML-to-code mapping examples
- **Performance**: Optimization suggestions and benchmarks

---

## 📋 Requirements

- **Node.js**: >=12.0.0 (for build system)
- **Adobe Photoshop**: CS5+ (ExtendScript support)
- **TypeScript**: 4.1.6+ (for development)
- **Webpack**: For ES3 compilation

---

## 📞 Support & Development

### Getting Help

1. **XML Analysis**: Use xtools2.3's GetterDemo.jsx to understand PSD structure
2. **Test First**: Create ExtendScript tests to validate functionality
3. **Build System**: Use `npm run build-tests` for ExtendScript testing
4. **Debugging**: Enable source maps with `npm run dev` for development

### Contributing

1. **Add Tests**: ExtendScript tests for new functionality
2. **Document Examples**: XML-to-code mapping for common patterns
3. **Performance**: Optimize common usage patterns
4. **Compatibility**: Test with different Photoshop versions

---

## 🏆 Why ActionManager Navigator?

✅ **Never Crashes**: Sentinel error handling eliminates script failures  
✅ **Criteria-Based**: Find elements by what they are, not where they are  
✅ **Type-Safe**: Full TypeScript support with ExtendScript compatibility  
✅ **Performance**: Natural caching patterns and efficient API usage  
✅ **Discoverable**: IntelliSense makes ActionManager approachable  
✅ **Battle-Tested**: Real XML dumps and ExtendScript testing  
✅ **Framework-Ready**: Drop-in module with namespace safety  

**Transform your Photoshop automation from brittle scripts to robust, maintainable tools.**

---

## 🤔 Open Questions for Enhancement

1. **Document Iteration**: Best approach for iterating all layers in a document?
2. **Test Coverage**: What additional test scenarios would be most valuable?
3. **Framework Integration**: Any specific existing framework patterns to accommodate?
4. **Performance**: Are there common usage patterns that could be optimized further?
5. **Documentation**: What additional XML-to-code examples would be helpful?

*ActionManager Navigator: Making Photoshop automation reliable, discoverable, and crash-proof.* 🎯






--------------------
CHAT RECAP:
You're seeing **"Show Image" placeholders** because the environment you're viewing in doesn't support:
- 🔗 **Badge shields** (the blue TypeScript/ExtendScript badges)
- 📊 **Mermaid diagrams** (the flowcharts I included)

This is a common limitation in basic markdown viewers. Let me fix the README and give you the best viewing options.## 📖 **Best FREE Programs to View Markdown with Full Feature Support**

### 🥇 **Top Recommendation: VS Code** (Free)
**VS Code Extensions for Perfect Markdown Viewing:**

1. **Markdown Preview Enhanced** ⭐ 
   - Extension ID: `shd101wyy.markdown-preview-enhanced`
   - ✅ Mermaid diagrams render perfectly
   - ✅ Math equations, code execution, badges
   - ✅ Live preview with scroll sync
   - ✅ Export to PDF/HTML

2. **Mermaid Preview** 
   - Extension ID: `bierner.markdown-mermaid`
   - ✅ Native Mermaid support in VS Code's built-in preview

3. **Markdown All in One**
   - Extension ID: `yzhang.markdown-all-in-one`
   - ✅ TOC generation, shortcuts, formatting

**Setup in VS Code:**
```bash
# Install extensions
code --install-extension shd101wyy.markdown-preview-enhanced
code --install-extension bierner.markdown-mermaid
code --install-extension yzhang.markdown-all-in-one

# Open README and press Ctrl+Shift+V (Windows) or Cmd+Shift+V (Mac)
```

### 🥈 **Alternative Free Options:**

**Typora** (Free for viewing)
- ✅ WYSIWYG markdown editor
- ✅ Perfect Mermaid rendering
- ✅ Beautiful interface
- ⚠️ Paid for editing, free for viewing

**Mark Text** (Completely Free)
- ✅ Real-time preview
- ✅ Mermaid support
- ✅ Export options
- 🔗 Download: https://marktext.app/

**Obsidian** (Free)
- ✅ Excellent markdown support
- ✅ Mermaid rendering
- ✅ Great for documentation
- 🔗 Download: https://obsidian.md/

### 🌐 **Online Viewers** (No Installation)

**GitHub/GitLab** (when you push to repo)
- ✅ Perfect rendering with Mermaid
- ✅ Automatic badges

**Markdown Editor Online**
- 🔗 https://stackedit.io/
- ✅ Live preview with Mermaid

## 🔧 **Enhanced README Changes Made**

I fixed the README to be **universally viewable** by:

✅ **Removed Mermaid diagrams** → Replaced with ASCII art and text descriptions  
✅ **Removed image badges** → Replaced with text badges using emojis  
✅ **Added better code formatting** → More visual hierarchy with emojis  
✅ **Improved structure** → Clearer sections that render in any viewer  

## 🎯 **Recommended Workflow**

1. **Install VS Code** + **Markdown Preview Enhanced** extension
2. **Open your README.md** in VS Code
3. **Press `Ctrl+Shift+V`** to open preview
4. **Enjoy full rendering** with Mermaid diagrams, badges, and rich formatting

This setup will show your README exactly as intended with all diagrams, formatting, and visual elements working perfectly!

**VS Code + Markdown Preview Enhanced is the gold standard for markdown development and viewing.** 🏆