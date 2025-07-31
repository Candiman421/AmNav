//ps/action-manager/ActionDescriptorNavigator.ts
/**
 * ActionDescriptor Navigator - Alternative Implementation
 * 
 * Clean, composable API for navigating Photoshop's ActionManager with sentinel-based error handling.
 * No complex caching - users cache naturally with const variables.
 * Never crashes - always returns safe sentinel values on errors.
 * 
 * SIMPLIFIED: Uses Adobe's built-in types directly for maximum compatibility
 * ENHANCED: Aligned with ps-nav.ts for consistent behavior
 * 
 * @fileoverview Alternative ActionManager navigation implementation
 * @version 2.0.0
 * 
 * @example Best - Natural caching with const variables
 * ```typescript
 * import { ActionDescriptorNavigator } from './action-manager/ActionDescriptorNavigator';
 * 
 * // 1. Travel down hierarchy to focus scope - target specific layers
 * const titleLayer = ActionDescriptorNavigator.forLayerByName('Title');
 * const textObj = titleLayer.getObject('textKey');
 * 
 * // 2. Chain to get ranges  
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // 3. Store navigators in const variables (natural caching!)
 * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
 * const textStyle = firstRange.getObject('textStyle');
 * const color = textStyle.getObject('color');
 * 
 * // 4. Process quickly from cached variables (no repeated API calls)
 * const red = color.getDouble('red');      // Fast access
 * const green = color.getDouble('green');  // Using cached navigator
 * const blue = color.getDouble('blue');    // No if checks needed
 * const fontSize = textStyle.getUnitDouble('sizeKey');
 * const fontName = textStyle.getString('fontPostScriptName');
 * 
 * // Never crashes - always safe values (sentinels on error)
 * ```
 */

// Import core functions from framework
import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from '../ps';

// Import simplified types and constants
import {
    SENTINELS,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray,
    PredicateFunction,
    SelectorFunction
} from './adn-types';

// NOTE: Rectangle, ActionDescriptor, ActionReference, ActionList, File are all global Adobe classes

// ===================================================================
// ENUMERABLE SUPPORT CLASSES  
// ===================================================================

/**
 * Simple enumerable for filtering without complex lazy evaluation
 * Keeps only essential functionality for whereMatches chaining
 */
class SimpleEnumerable implements IEnumerable {
    private items: IActionDescriptorNavigator[];

    constructor(items: IActionDescriptorNavigator[]) {
        this.items = items || [];
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        const filtered = this.items.filter(item => {
            if (item.isSentinel) return false;
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerable(filtered);
    }

    getFirst(): IActionDescriptorNavigator {
        return this.items.length > 0 ? this.items[0] : ActionDescriptorNavigator.createSentinel();
    }

    hasAnyMatches(): boolean {
        return this.items.length > 0;
    }

    getCount(): number {
        return this.items.length;
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const transformed = this.items.map(item => {
            if (item.isSentinel) return null;
            try {
                return transformer(item);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return {
            array: transformed,
            whereMatches: (predicate: (item: any) => boolean) => {
                const filtered = transformed.filter(item => {
                    try {
                        return predicate(item);
                    } catch (e: any) {
                        return false;
                    }
                });
                return { 
                    array: filtered,
                    whereMatches: () => ({ array: [], whereMatches: () => ({} as any), getFirst: () => null, getCount: () => 0, hasAnyMatches: () => false, select: () => ({} as any), toResultArray: () => [], debug: () => ({} as any) }),
                    getFirst: () => filtered.length > 0 ? filtered[0] : null,
                    getCount: () => filtered.length,
                    hasAnyMatches: () => filtered.length > 0,
                    select: <U>(t: (item: any) => U) => ({ array: filtered.map(t), whereMatches: () => ({} as any), getFirst: () => null, getCount: () => 0, hasAnyMatches: () => false, select: () => ({} as any), toResultArray: () => [], debug: () => ({} as any) }),
                    toResultArray: () => filtered,
                    debug: (label: string) => { console.log(`[${label}] ${filtered.length} items`); return { array: filtered, whereMatches: () => ({} as any), getFirst: () => null, getCount: () => 0, hasAnyMatches: () => false, select: () => ({} as any), toResultArray: () => [], debug: () => ({} as any) }; }
                };
            },
            getFirst: () => transformed.length > 0 ? transformed[0] : null,
            getCount: () => transformed.length,
            hasAnyMatches: () => transformed.length > 0,
            select: <U>(t: (item: any) => U) => ({ array: transformed.map(t), whereMatches: () => ({} as any), getFirst: () => null, getCount: () => 0, hasAnyMatches: () => false, select: () => ({} as any), toResultArray: () => [], debug: () => ({} as any) }),
            toResultArray: () => transformed,
            debug: (label: string) => { console.log(`[${label}] ${transformed.length} items`); return { array: transformed, whereMatches: () => ({} as any), getFirst: () => null, getCount: () => 0, hasAnyMatches: () => false, select: () => ({} as any), toResultArray: () => [], debug: () => ({} as any) }; }
        };
    }

    toResultArray(): IActionDescriptorNavigator[] {
        return [...this.items];
    }

    debug(label: string): IEnumerable {
        console.log(`[${label}] Enumerable with ${this.items.length} items`);
        return this;
    }
}

// ===================================================================
// LIST NAVIGATOR IMPLEMENTATION
// ===================================================================

/**
 * Simple implementation for ActionList navigation
 */
class ActionListNavigator implements IActionListNavigator {
    private list: ActionList | null;
    private _isSentinel: boolean;

    constructor(list: ActionList | null) {
        this.list = list;
        this._isSentinel = !list;
    }

    get isSentinel(): boolean {
        return this._isSentinel;
    }

    getCount(): number {
        if (this._isSentinel || !this.list) return 0;
        try {
            return this.list.count || 0;
        } catch (e: any) {
            return 0;
        }
    }

    getObject(index: number): IActionDescriptorNavigator {
        if (this._isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const count = this.list.count || 0;
            if (index >= count) return ActionDescriptorNavigator.createSentinel();
            
            const desc = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const count = this.getCount();
        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                try {
                    if (predicate(item)) return item;
                } catch (e: any) {
                    // Continue searching
                }
            }
        }
        return ActionDescriptorNavigator.createSentinel();
    }

    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        return this.getFirstWhere(predicate);
    }

    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[] {
        const results: IActionDescriptorNavigator[] = [];
        const count = this.getCount();
        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                try {
                    if (predicate(item)) results.push(item);
                } catch (e: any) {
                    // Continue searching
                }
            }
        }
        return results;
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        return new SimpleEnumerable(this.getAllWhere(predicate));
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const items: IActionDescriptorNavigator[] = [];
        const count = this.getCount();
        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) items.push(item);
        }
        return new SimpleEnumerable(items).select(transformer);
    }

    asEnumerable(): IEnumerable {
        const items: IActionDescriptorNavigator[] = [];
        const count = this.getCount();
        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) items.push(item);
        }
        return new SimpleEnumerable(items);
    }

    debug(label: string): IActionListNavigator {
        console.log(`[${label}] ActionListNavigator: ${this._isSentinel ? 'SENTINEL' : this.getCount() + ' items'}`);
        return this;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }
}

// ===================================================================
// MAIN NAVIGATOR IMPLEMENTATION
// ===================================================================

/**
 * Main ActionDescriptor navigator implementation
 * Simple, focused implementation for property extraction
 */
export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    private desc: ActionDescriptor | null;
    private _isSentinel: boolean;

    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this._isSentinel = !desc;
    }

    get isSentinel(): boolean {
        return this._isSentinel;
    }

    // ===================================================================
    // NAVIGATION METHODS
    // ===================================================================

    getObject(key: string): IActionDescriptorNavigator {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionDescriptorNavigator.createSentinel();
            }
            const obj = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(obj);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    getList(key: string): IActionListNavigator {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionListNavigator.createSentinel();
            }
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e: any) {
            return ActionListNavigator.createSentinel();
        }
    }

    // ===================================================================
    // VALUE EXTRACTION METHODS
    // ===================================================================

    getString(key: string): string {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.string;
            }
            return this.desc.getString(typeID);
        } catch (e: any) {
            return SENTINELS.string;
        }
    }

    getDouble(key: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getDouble(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    getUnitDouble(key: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getUnitDoubleValue(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    getInteger(key: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getInteger(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    getBoolean(key: string): boolean {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.boolean;
            }
            return this.desc.getBoolean(typeID);
        } catch (e: any) {
            return SENTINELS.boolean;
        }
    }

    getEnumerationString(key: string): string {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.string;
            }
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.string;
        } catch (e: any) {
            return SENTINELS.string;
        }
    }

    getEnumerationId(key: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getEnumerationValue(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    // Additional value methods for completeness
    getData(key: string): string { return this.getStringValue(key, 'getData'); }
    getClass(key: string): number { return this.getIntegerValue(key, 'getClass'); }
    getLargeInteger(key: string): number { return this.getIntegerValue(key, 'getLargeInteger'); }
    getObjectType(key: string): number { return this.getIntegerValue(key, 'getObjectType'); }
    getUnitDoubleType(key: string): number { return this.getIntegerValue(key, 'getUnitDoubleType'); }
    getUnitDoubleValue(key: string): number { return this.getDoubleValue(key, 'getUnitDoubleValue'); }
    getEnumerationType(key: string): number { return this.getIntegerValue(key, 'getEnumerationType'); }
    getType(key: string): number { return this.getIntegerValue(key, 'getType'); }

    // SIMPLIFIED: Direct Adobe types with null handling
    getPath(key: string): File | null {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.file;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? this.desc.getPath(typeID) : SENTINELS.file;
        } catch (e: any) {
            return SENTINELS.file; // null
        }
    }

    getReference(key: string): ActionReference | null {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.reference;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? this.desc.getReference(typeID) : SENTINELS.reference;
        } catch (e: any) {
            return SENTINELS.reference; // null
        }
    }

    // Helper methods to reduce duplication
    private getStringValue(key: string, methodName: string): string {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.string;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.string;
        } catch (e: any) { return SENTINELS.string; }
    }

    private getIntegerValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.integer;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.integer;
        } catch (e: any) { return SENTINELS.integer; }
    }

    private getDoubleValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.double;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.double;
        } catch (e: any) { return SENTINELS.double; }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    getBounds(): Rectangle {
        try {
            if (!this._isSentinel && this.desc) {
                const boundsKey = stringIDToTypeID("bounds");
                if (this.desc.hasKey(boundsKey)) {
                    const boundsDesc = this.desc.getObjectValue(boundsKey);
                    const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID("left"));
                    const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID("top"));
                    const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID("right"));
                    const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID("bottom"));
                    return new Rectangle(left, top, right - left, bottom - top);
                }
            }
        } catch (e: any) {
            // Fall through to sentinel
        }
        return new Rectangle(0, 0, 0, 0);
    }

    hasKey(key: string): boolean {
        if (this._isSentinel || !this.desc || !key || key.length === 0) return false;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID);
        } catch (e: any) {
            return false;
        }
    }

    select<T>(selector: SelectorFunction<T>): T | null {
        if (this._isSentinel) return null;
        try {
            return selector(this);
        } catch (e: any) {
            return null;
        }
    }

    debug(label: string): IActionDescriptorNavigator {
        try {
            console.log(`[${label}] ActionDescriptorNavigator: ${this._isSentinel ? 'SENTINEL' : 'OK'}`);
        } catch (e: any) {
            // Debug output failed
        }
        return this;
    }

    // ===================================================================
    // STATIC FACTORY METHODS
    // ===================================================================

    /**
     * Get navigator for current layer
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for current document
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for layer by name
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.trim().length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const searchName = layerName.toLowerCase().trim();
        const layerCount = ActionDescriptorNavigator.getLayerCount();

        for (let i = 1; i <= layerCount; i++) {
            const layer = ActionDescriptorNavigator.forLayerByIndex(i);
            const currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().trim() === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Get navigator for a layer by index (1-based)
     */
    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create a sentinel navigator (represents failed operation)
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
    }

    /**
     * Get total number of layers in the current document
     */
    private static getLayerCount(): number {
        try {
            const ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : 0;
        } catch (e: any) {
            return 0;
        }
    }
}