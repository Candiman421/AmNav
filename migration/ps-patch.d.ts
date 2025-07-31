//ps/ps-patch.d.ts
/**
 * Updates to declarations found in types-for-adobe
 * 
 * CLEANED VERSION: Contains only essential patches that fix legitimate bugs
 * or add missing functionality not present in the base types-for-adobe library.
 * 
 * All redundant declarations have been removed based on audit findings.
 */

// ===================================================================
// ESSENTIAL BUG FIXES (NEVER REMOVE)
// ===================================================================

/**
 * ActionList interface fixes
 * 
 * BUG: types-for-adobe incorrectly declares count and typename as static properties
 * REALITY: These are instance properties used as descriptor.count, list.count
 * EVIDENCE: All Adobe documentation and code examples show instance usage
 */
declare interface ActionList {
    /**
     * The number of commands that comprise the action.
     * FIXED: types-for-adobe incorrectly shows this as static
     */
    readonly count: number;

    /**
     * The class name of the referenced ActionList object.
     * FIXED: types-for-adobe incorrectly shows this as static
     */
    readonly typename: string;
}

/**
 * ActionDescriptor interface fixes
 * 
 * BUG: types-for-adobe incorrectly declares count and typename as static properties
 * REALITY: These are instance properties used as descriptor.count
 * EVIDENCE: All Adobe documentation and code examples show instance usage
 */
declare interface ActionDescriptor {
    /**
     * The number of keys contained in the descriptor.
     * FIXED: types-for-adobe incorrectly shows this as static
     */
    readonly count: number;

    /**
     * The class name of the referenced ActionDescriptor object.
     * FIXED: types-for-adobe incorrectly shows this as static
     */
    readonly typename: string;
}

// ===================================================================
// MISSING FUNCTIONALITY (ESSENTIAL ADDITIONS)
// ===================================================================

/**
 * DocumentInfo interface
 * 
 * MISSING: types-for-adobe does not include DocumentInfo interface
 * NEEDED: For accessing document metadata via Document.info property
 */
declare interface DocumentInfo {
    [key: string]: any;
}

/**
 * Document interface extension
 * 
 * MISSING: types-for-adobe Document class does not include info property
 * NEEDED: For accessing document metadata
 */
declare interface Document {
    readonly info: DocumentInfo;
}

/**
 * XML interface enhancements
 * 
 * MISSING: types-for-adobe XML class lacks essential navigation methods
 * NEEDED: For XML manipulation in ExtendScript environment
 */
declare interface XML {
    /**
     * Gets child element by name or index
     * MISSING: Essential XML navigation method
     */
    child(name: string | number): XML;
    
    /**
     * Array-like indexer access to XML children
     * MISSING: Allows xml[0], xml[1] access pattern
     */
    [key: number]: XML;
}

/**
 * UnitValue interface enhancement
 * 
 * MISSING: types-for-adobe UnitValue lacks toFixed method
 * NEEDED: For number formatting operations
 * NOTE: value property already exists in types-for-adobe, not duplicated
 */
declare interface UnitValue {
    toFixed(decimals: number): string;
}

// ===================================================================
// ENHANCED INTERFACES (STATIC VS INSTANCE FIXES)
// ===================================================================

/**
 * ColorSamplers interface
 * 
 * ISSUE: types-for-adobe may have incorrect method signatures
 * NEEDED: Proper add method signature for color sampler creation
 * NOTE: Requires runtime verification of exact signature
 */
declare interface ColorSamplers {
    /**
     * Creates a color sampler at specified position
     * @param position The horizontal and vertical (x,y) locations of the color sampler
     */
    add(position: UnitPoint): ColorSampler;
    
    /**
     * Removes all color samplers
     */
    removeAll(): void;
}

/**
 * Guides interface enhancement
 * 
 * FIXES: types-for-adobe shows static methods, should be instance
 * ADDS: Missing array indexer for guide access
 */
declare interface Guides {
    /**
     * Array-like access to individual guides
     * MISSING: Essential for guide manipulation
     */
    [key: number]: Guide;
    
    /**
     * Creates a new guide
     * FIXED: types-for-adobe incorrectly shows as static method
     */
    add(direction: Direction, coordinate: UnitValue | number): Guide;
}

// ===================================================================
// GLOBAL SHORTCUTS (VERIFICATION NEEDED)
// ===================================================================

/**
 * Global preferences variable
 * 
 * STATUS: Needs verification - ExtendScript may provide global shortcut
 * ALTERNATIVE: Use app.preferences if global doesn't exist
 * SAFE: Having both declarations won't conflict
 */
declare let preferences: Preferences;

// ===================================================================
// MISSING ENUMS (VERIFICATION NEEDED)
// ===================================================================

/**
 * TextCase enum
 * 
 * STATUS: Needs verification against current types-for-adobe
 * USAGE: For text formatting operations
 * TODO: Verify this enum doesn't exist in current types-for-adobe
 */
declare enum TextCase {
    /**
     * All caps text formatting
     */
    ALLCAPS = 1,
    
    /**
     * Normal text formatting
     */
    NORMAL = 2,
    
    /**
     * Small caps text formatting
     */
    SMALLCAPS = 3
}