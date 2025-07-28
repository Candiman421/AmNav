# AmNav - ActionDescriptor Navigator

**Fluent API for Photoshop ExtendScript with Sentinel-Based Error Handling**

> "Never crashes, always chains, finds what you need" ™

## 🎯 What AmNav Solves

**Problem:** Photoshop scripts break when PSD structure changes
```javascript
// ❌ Brittle - breaks when textStyleRange structure changes
var firstRange = layerDesc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0);
```

**Solution:** Criteria-based navigation that mirrors XML hierarchy exactly
```typescript
// ✅ Robust - finds first range by criteria, never crashes
const firstRange = layer
  .getObject('textKey')
  .getList('textStyleRange')
  .getFirstWhere(range => range.getInteger('from') === 0);
```

## 🚀 Quick Start

### 1. Copy Files (Peer Structure)
```
your-project/
├── ActionDescriptorNavigator.ts    # Main AmNav class
├── types.ts                        # Type definitions
├── es5-polyfills.js               # ExtendScript compatibility
└── your-script.jsx                 # Your Photoshop script
```

### 2. Basic Usage
```typescript
import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';

// Get current layer and extract font info
const layer = ActionDescriptorNavigator.forCurrentLayer();
const fontName = layer
  .getObject('textKey')
  .getList('textStyleRange')
  .getFirstWhere(range => range.getInteger('from') === 0)
  .getObject('textStyle')
  .getString('fontPostScriptName');

// Result: "ArialMT" or "" (sentinel, never crashes)
```

## 📊 XML → Fluent Chain Discovery

### Your XML Dumps → AmNav Code

**Based on your actual XML dumps from xtools2.3:**

#### 1. Simple Text Properties
**XML Structure (from your simple-title):**
```xml
<Object symname="textKey">
  <List symname="textStyleRange">
    <Object>
      <Object symname="textStyle">
        <String symname="fontPostScriptName" value="ArialMT"/>
        <UnitDouble symname="sizeKey" value="48"/>
        <Boolean symname="syntheticBold" value="false"/>
      </Object>
    </Object>
  </List>
</Object>
```

**AmNav Fluent Chain:**
```typescript
const textObj = layer.getObject('textKey');
const styleRanges = textObj.getList('textStyleRange');
const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
const textStyle = firstRange.getObject('textStyle');

const fontData = {
  name: textStyle.getString('fontPostScriptName'),  // "ArialMT"
  size: textStyle.getUnitDouble('sizeKey'),         // 48
  bold: textStyle.getBoolean('syntheticBold')       // false
};
```

#### 2. Multi-Style Text Discovery
**XML Structure (from your complex-text):**
```xml
<List symname="textStyleRange" count="3">
  <Object><!-- Range 1: Bold --></Object>
  <Object><!-- Range 2: Normal --></Object>
  <Object><!-- Range 3: Italic --></Object>
</List>
```

**AmNav Discovery Pattern:**
```typescript
const allStyles = layer
  .getObject('textKey')
  .getList('textStyleRange')
  .getAllWhere(range => range.hasKey('textStyle'))
  .select(range => ({
    from: range.getInteger('from'),
    to: range.getInteger('to'),
    font: range.getObject('textStyle').getString('fontPostScriptName'),
    bold: range.getObject('textStyle').getBoolean('syntheticBold'),
    italic: range.getObject('textStyle').getBoolean('syntheticItalic')
  }))
  .toResultArray();

// Result: Array of all text formatting in the layer 
```

#### 3. Layer Bounds - Modern PS with Direct Width/Height
**XML Structure (Layer Rectangle bounds - 6 properties):**
```xml
<Object symname="bounds" objectType="Rctn" count="6">
  <UnitDouble symname="Left" value="105"/>
  <UnitDouble symname="Top" value="48"/>
  <UnitDouble symname="Right" value="486"/>
  <UnitDouble symname="Bottom" value="101"/>
  <UnitDouble symname="Width" value="381"/>   <!-- ✅ Direct width -->
  <UnitDouble symname="Height" value="53"/>   <!-- ✅ Direct height -->
</Object>
```

**AmNav Smart Bounds Extraction:**
```typescript
const bounds = layer.getBounds();
// Returns: { 
//   left: 105, 
//   top: 48, 
//   right: 486, 
//   bottom: 101, 
//   width: 381,   // ✅ Direct from PS (faster, more accurate)
//   height: 53    // ✅ Direct from PS (faster, more accurate)
// }

// Easy layer comparison
const overlap = bounds1.right > bounds2.left && bounds1.left < bounds2.right;
```

#### 4. Text Bounds - Fallback to Calculated
**XML Structure (Text bounds - 4 properties only):**
```xml
<Object symname="bounds" objectType="bounds" count="4">
  <UnitDouble symname="Left" value="0"/>
  <UnitDouble symname="Top" value="-61.787109375"/>
  <UnitDouble symname="Right" value="388.1953125"/>
  <UnitDouble symname="Bottom" value="23.37890625"/>
</Object>
```

**AmNav Automatic Fallback:**
```typescript
const bounds = layer.getBounds();
// Returns: { 
//   left: 0, 
//   top: -61.78, 
//   right: 388.19, 
//   bottom: 23.38, 
//   width: 388.19,  // ✅ Calculated: right - left (when direct not available)
//   height: 85.16   // ✅ Calculated: bottom - top (when direct not available)
// }

// AmNav automatically detects and handles both cases!
```

## 🔄 Core Patterns

### Pattern 1: Navigate → Filter → Extract
```typescript
// Navigate to data location
const dataSource = layer.getObject('textKey').getList('textStyleRange');

// Filter by criteria (not index!)
const targetItems = dataSource.getAllWhere(item => 
  item.getInteger('from') === 0 || 
  item.getObject('textStyle').getBoolean('syntheticBold')
);

// Extract transformed results
const results = targetItems
  .select(item => item.getObject('textStyle').getString('fontPostScriptName'))
  .toResultArray();
```

### Pattern 2: Performance Caching
```typescript
// ✅ Cache navigators for repeated access
const textObj = layer.getObject('textKey');
const styleRanges = textObj.getList('textStyleRange');
const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
const textStyle = firstRange.getObject('textStyle');

// Fast repeated property access
const analysis = {
  font: textStyle.getString('fontPostScriptName'),
  size: textStyle.getUnitDouble('sizeKey'),
  bold: textStyle.getBoolean('syntheticBold'),
  italic: textStyle.getBoolean('syntheticItalic'),
  color: textStyle.getObject('color')
};
```

### Pattern 3: Sentinel Error Handling
```typescript
// Never crashes - always returns safe defaults
const fontName = layer.getObject('textKey')
  .getList('invalidList')           // Returns sentinel list
  .getFirstWhere(x => true)         // Returns sentinel navigator
  .getString('fontPostScriptName'); // Returns "" (string sentinel)

// Check for valid data
if (fontName !== SENTINELS.string) {
  // Use the font name
}
```

## 📋 Property Name Mapping

**XML Display Names → ActionManager Keys:**

| XML Display | ActionManager Key | AmNav Method |
|-------------|-------------------|---------------|
| `Text` | `textKey` | `.getObject('textKey')` |
| `TextStyleRange` | `textStyleRange` | `.getList('textStyleRange')` |
| `TextStyle` | `textStyle` | `.getObject('textStyle')` |
| `FontPostScriptName` | `fontPostScriptName` | `.getString('fontPostScriptName')` |
| `SizeKey` | `sizeKey` | `.getUnitDouble('sizeKey')` |
| `SyntheticBold` | `syntheticBold` | `.getBoolean('syntheticBold')` |

## 🛡️ Error Handling Philosophy

**Sentinel Values = Never Crash:**
- String: `""` (empty string)
- Number: `-1`
- Boolean: `false`
- Object: Sentinel navigator (continues chain safely)

**Benefits:**
- ✅ Photoshop never crashes
- ✅ Chains always complete
- ✅ Clear error detection
- ✅ Performance friendly (no try/catch overhead)

## ⚡ Modern Photoshop Optimizations

**Smart Bounds Detection:**
AmNav automatically detects and uses the most efficient bounds method:

```typescript
// Modern PS layer bounds (Rectangle) - Direct properties
const bounds = layer.getBounds();
// Uses: bounds.width and bounds.height directly (fastest)

// Text bounds or older PS - Calculated fallback  
const bounds = textLayer.getBounds();
// Calculates: right-left and bottom-top when needed (still fast)
```

**Performance Benefits:**
- ✅ **Direct property access** when available (modern PS)
- ✅ **Zero calculation errors** from floating point precision
- ✅ **Automatic fallback** for text bounds and older PS versions
- ✅ **Same API** regardless of bounds type

**Your XML Dumps Prove This Works:**
```xml
<!-- Layer bounds: count="6" (has direct width/height) -->
<Object symname="bounds" objectType="Rctn" count="6">
  <UnitDouble symname="Width" value="381"/>   <!-- ✅ Direct -->
  <UnitDouble symname="Height" value="53"/>   <!-- ✅ Direct -->
</Object>

<!-- Text bounds: count="4" (calculated width/height) -->
<Object symname="bounds" objectType="bounds" count="4">
  <!-- Only Left, Top, Right, Bottom - AmNav calculates width/height -->
</Object>
```

## 🎯 Integration Guide

### For New Projects
1. Copy `ActionDescriptorNavigator.ts`, `types.ts`, `es5-polyfills.js`
2. Import: `import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';`
3. Use fluent chains as shown above

### For Existing Framework Projects
1. Copy files to framework location
2. In `types.ts`: Uncomment the `declare global` block
3. Update import paths as needed
4. Replace old ActionManager code with AmNav patterns

## 📁 Files in This Repo

- `ActionDescriptorNavigator.ts` - Main navigator class
- `types.ts` - Type definitions (global declarations commented out)
- `es5-polyfills.js` - ExtendScript compatibility polyfills
- `tests/examples/` - Real usage examples mapping XML → code
- `tests/assets/` - Test PSD files
- `tests/xml-dumps/` - XML dumps from xtools2.3

## 🚀 Getting Started

1. **Copy files** to your project
2. **Open a test PSD** in Photoshop
3. **Try the examples** from this README
4. **Generate XML dumps** with xtools2.3 to understand your PSD structure
5. **Write AmNav code** that mirrors the XML hierarchy

**Remember: If it works in the XML, it works in AmNav!**

---

*AmNav: Making Photoshop automation reliable, discoverable, and crash-proof.* 🎯