/**
 * Complete Photoshop ActionManager API for ExtendScript
 * 
 * This module provides a complete TypeScript wrapper for Photoshop's ActionManager API,
 * enabling both GET (reading) and PUT (writing/setting) operations.
 * 
 * Usage:
 * - Import functions as needed in your ActionDescriptorNavigator and other PS scripts
 * - All functions are thin wrappers around the global Photoshop app API
 * - Compatible with ExtendScript ES3 when transpiled
 * 
 * Coverage:
 * - Core execution functions (executeActionGet, executeAction)
 * - Type conversion utilities (stringIDToTypeID, charIDToTypeID, etc.)
 * - Complete ActionDescriptor API (get/put for all data types)
 * - Complete ActionReference API (put methods for all reference types)
 * - Complete ActionList API (array operations)
 * - Utility functions (DialogModes, Unit types, File operations)
 * 
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 */

// ===================================================================
// GLOBAL DECLARATIONS
// ===================================================================

declare const app: any;
declare const global: any;

// ===================================================================
// CORE EXECUTION FUNCTIONS (Used by ActionDescriptorNavigator)
// ===================================================================

/**
 * Executes an ActionManager get operation
 * @param reference ActionReference pointing to the object to retrieve
 * @returns ActionDescriptor containing the object's properties
 */
export function executeActionGet(reference: any): any {
    return app.executeActionGet(reference);
}

/**
 * Executes an ActionManager action (set/create/modify operations)
 * @param eventID The action event ID
 * @param descriptor ActionDescriptor with parameters (optional)
 * @param displayDialogs Dialog display mode (optional)
 * @returns ActionDescriptor with results
 */
export function executeAction(eventID: any, descriptor?: any, displayDialogs?: any): any {
    return app.executeAction(eventID, descriptor, displayDialogs);
}

// ===================================================================
// TYPE CONVERSION FUNCTIONS (Used by ActionDescriptorNavigator)
// ===================================================================

/**
 * Converts string ID to numeric type ID
 * @param stringID String identifier (e.g., "textKey")
 * @returns Numeric type ID
 */
export function stringIDToTypeID(stringID: string): number {
    return app.stringIDToTypeID(stringID);
}

/**
 * Converts 4-character ID to numeric type ID
 * @param charID 4-character string (e.g., "Lyr ")
 * @returns Numeric type ID
 */
export function charIDToTypeID(charID: string): number {
    return app.charIDToTypeID(charID);
}

/**
 * Converts numeric type ID to string ID
 * @param typeID Numeric type ID
 * @returns String identifier
 */
export function typeIDToStringID(typeID: number): string {
    return app.typeIDToStringID(typeID);
}

/**
 * Converts numeric type ID to 4-character ID
 * @param typeID Numeric type ID
 * @returns 4-character string
 */
export function typeIDToCharID(typeID: number): string {
    return app.typeIDToCharID(typeID);
}

// ===================================================================
// CONSTRUCTOR FUNCTIONS
// ===================================================================

/**
 * Creates a new ActionDescriptor
 * @returns New ActionDescriptor instance
 */
export function ActionDescriptor(): any {
    return new (app as any).ActionDescriptor();
}

/**
 * Creates a new ActionReference
 * @returns New ActionReference instance
 */
export function ActionReference(): any {
    return new (app as any).ActionReference();
}

/**
 * Creates a new ActionList
 * @returns New ActionList instance
 */
export function ActionList(): any {
    return new (app as any).ActionList();
}

// ===================================================================
// ACTIONDESCRIPTOR GET METHODS (Reading Data)
// ===================================================================

/**
 * Gets string value from ActionDescriptor
 */
export function getString(descriptor: any, key: any): string {
    return descriptor.getString(key);
}

/**
 * Gets integer value from ActionDescriptor
 */
export function getInteger(descriptor: any, key: any): number {
    return descriptor.getInteger(key);
}

/**
 * Gets double value from ActionDescriptor
 */
export function getDouble(descriptor: any, key: any): number {
    return descriptor.getDouble(key);
}

/**
 * Gets unit double value from ActionDescriptor
 */
export function getUnitDouble(descriptor: any, key: any): number {
    return descriptor.getUnitDoubleValue(key);
}

/**
 * Gets unit type for unit double from ActionDescriptor
 */
export function getUnitDoubleType(descriptor: any, key: any): number {
    return descriptor.getUnitDoubleType(key);
}

/**
 * Gets boolean value from ActionDescriptor
 */
export function getBoolean(descriptor: any, key: any): boolean {
    return descriptor.getBoolean(key);
}

/**
 * Gets enumeration type from ActionDescriptor
 */
export function getEnumerationType(descriptor: any, key: any): number {
    return descriptor.getEnumerationType(key);
}

/**
 * Gets enumeration value from ActionDescriptor
 */
export function getEnumerationValue(descriptor: any, key: any): number {
    return descriptor.getEnumerationValue(key);
}

/**
 * Gets object value from ActionDescriptor
 */
export function getObjectValue(descriptor: any, key: any): any {
    return descriptor.getObjectValue(key);
}

/**
 * Gets object type from ActionDescriptor
 */
export function getObjectType(descriptor: any, key: any): number {
    return descriptor.getObjectType(key);
}

/**
 * Gets list value from ActionDescriptor
 */
export function getList(descriptor: any, key: any): any {
    return descriptor.getList(key);
}

/**
 * Gets reference value from ActionDescriptor
 */
export function getReference(descriptor: any, key: any): any {
    return descriptor.getReference(key);
}

/**
 * Gets path value from ActionDescriptor
 */
export function getPath(descriptor: any, key: any): any {
    return descriptor.getPath(key);
}

/**
 * Gets raw data from ActionDescriptor
 */
export function getData(descriptor: any, key: any): string {
    return descriptor.getData(key);
}

/**
 * Gets class value from ActionDescriptor
 */
export function getClass(descriptor: any, key: any): number {
    return descriptor.getClass(key);
}

/**
 * Gets value type from ActionDescriptor
 */
export function getType(descriptor: any, key: any): number {
    return descriptor.getType(key);
}

/**
 * Gets key at index from ActionDescriptor
 */
export function getKey(descriptor: any, index: number): number {
    return descriptor.getKey(index);
}

/**
 * Checks if ActionDescriptor has specific key
 */
export function hasKey(descriptor: any, key: any): boolean {
    return descriptor.hasKey(key);
}

/**
 * Gets count of properties in ActionDescriptor
 */
export function getCount(descriptor: any): number {
    return descriptor.count;
}

// ===================================================================
// ACTIONDESCRIPTOR PUT METHODS (Setting/Writing Data)
// ===================================================================

/**
 * Sets string value in ActionDescriptor
 */
export function putString(descriptor: any, key: any, value: string): void {
    descriptor.putString(key, value);
}

/**
 * Sets integer value in ActionDescriptor
 */
export function putInteger(descriptor: any, key: any, value: number): void {
    descriptor.putInteger(key, value);
}

/**
 * Sets double value in ActionDescriptor
 */
export function putDouble(descriptor: any, key: any, value: number): void {
    descriptor.putDouble(key, value);
}

/**
 * Sets unit double value in ActionDescriptor
 */
export function putUnitDouble(descriptor: any, key: any, unitType: any, value: number): void {
    descriptor.putUnitDouble(key, unitType, value);
}

/**
 * Sets boolean value in ActionDescriptor
 */
export function putBoolean(descriptor: any, key: any, value: boolean): void {
    descriptor.putBoolean(key, value);
}

/**
 * Sets enumerated value in ActionDescriptor
 */
export function putEnumerated(descriptor: any, key: any, enumType: any, value: any): void {
    descriptor.putEnumerated(key, enumType, value);
}

/**
 * Sets object value in ActionDescriptor
 */
export function putObject(descriptor: any, key: any, classType: any, value: any): void {
    descriptor.putObject(key, classType, value);
}

/**
 * Sets list value in ActionDescriptor
 */
export function putList(descriptor: any, key: any, value: any): void {
    descriptor.putList(key, value);
}

/**
 * Sets reference value in ActionDescriptor
 */
export function putReference(descriptor: any, key: any, value: any): void {
    descriptor.putReference(key, value);
}

/**
 * Sets path value in ActionDescriptor
 */
export function putPath(descriptor: any, key: any, value: any): void {
    descriptor.putPath(key, value);
}

/**
 * Sets raw data in ActionDescriptor
 */
export function putData(descriptor: any, key: any, value: string): void {
    descriptor.putData(key, value);
}

/**
 * Sets class value in ActionDescriptor
 */
export function putClass(descriptor: any, key: any, value: any): void {
    descriptor.putClass(key, value);
}

/**
 * Clears all properties from ActionDescriptor
 */
export function clear(descriptor: any): void {
    descriptor.clear();
}

/**
 * Erases specific property from ActionDescriptor
 */
export function erase(descriptor: any, key: any): void {
    descriptor.erase(key);
}

// ===================================================================
// ACTIONREFERENCE PUT METHODS (Building References)
// ===================================================================

/**
 * Sets property reference
 */
export function putProperty(reference: any, desiredClass: any, property: any): void {
    reference.putProperty(desiredClass, property);
}

/**
 * Sets enumerated reference
 */
export function putEnumeratedRef(reference: any, desiredClass: any, enumType: any, value: any): void {
    reference.putEnumerated(desiredClass, enumType, value);
}

/**
 * Sets class reference
 */
export function putClassRef(reference: any, desiredClass: any): void {
    reference.putClass(desiredClass);
}

/**
 * Sets identifier reference
 */
export function putIdentifier(reference: any, desiredClass: any, identifier: number): void {
    reference.putIdentifier(desiredClass, identifier);
}

/**
 * Sets index reference
 */
export function putIndex(reference: any, desiredClass: any, index: number): void {
    reference.putIndex(desiredClass, index);
}

/**
 * Sets name reference
 */
export function putName(reference: any, desiredClass: any, name: string): void {
    reference.putName(desiredClass, name);
}

/**
 * Sets offset reference
 */
export function putOffset(reference: any, desiredClass: any, offset: number): void {
    reference.putOffset(desiredClass, offset);
}

// ===================================================================
// ACTIONREFERENCE GET METHODS (Reading References)
// ===================================================================

/**
 * Gets desired class from ActionReference
 */
export function getDesiredClass(reference: any): number {
    return reference.getDesiredClass();
}

/**
 * Gets enumeration type from ActionReference
 */
export function getEnumerationTypeRef(reference: any): number {
    return reference.getEnumeratedType();
}

/**
 * Gets enumeration value from ActionReference
 */
export function getEnumerationValueRef(reference: any): number {
    return reference.getEnumeratedValue();
}

/**
 * Gets form from ActionReference
 */
export function getForm(reference: any): any {
    return reference.getForm();
}

/**
 * Gets identifier from ActionReference
 */
export function getIdentifier(reference: any): number {
    return reference.getIdentifier();
}

/**
 * Gets index from ActionReference
 */
export function getIndex(reference: any): number {
    return reference.getIndex();
}

/**
 * Gets name from ActionReference
 */
export function getName(reference: any): string {
    return reference.getName();
}

/**
 * Gets offset from ActionReference
 */
export function getOffset(reference: any): number {
    return reference.getOffset();
}

/**
 * Gets property from ActionReference
 */
export function getPropertyRef(reference: any): number {
    return reference.getProperty();
}

// ===================================================================
// ACTIONLIST METHODS (Array Operations)
// ===================================================================

// ActionList PUT methods
export function putStringList(list: any, value: string): void {
    list.putString(value);
}

export function putIntegerList(list: any, value: number): void {
    list.putInteger(value);
}

export function putDoubleList(list: any, value: number): void {
    list.putDouble(value);
}

export function putUnitDoubleList(list: any, unitType: any, value: number): void {
    list.putUnitDouble(unitType, value);
}

export function putBooleanList(list: any, value: boolean): void {
    list.putBoolean(value);
}

export function putEnumeratedList(list: any, enumType: any, value: any): void {
    list.putEnumerated(enumType, value);
}

export function putObjectList(list: any, classType: any, value: any): void {
    list.putObject(classType, value);
}

export function putReferenceList(list: any, value: any): void {
    list.putReference(value);
}

export function putPathList(list: any, value: any): void {
    list.putPath(value);
}

export function putDataList(list: any, value: string): void {
    list.putData(value);
}

// ActionList GET methods
export function getStringList(list: any, index: number): string {
    return list.getString(index);
}

export function getIntegerList(list: any, index: number): number {
    return list.getInteger(index);
}

export function getDoubleList(list: any, index: number): number {
    return list.getDouble(index);
}

export function getUnitDoubleList(list: any, index: number): number {
    return list.getUnitDoubleValue(index);
}

export function getUnitDoubleTypeList(list: any, index: number): number {
    return list.getUnitDoubleType(index);
}

export function getBooleanList(list: any, index: number): boolean {
    return list.getBoolean(index);
}

export function getEnumerationTypeList(list: any, index: number): number {
    return list.getEnumerationType(index);
}

export function getEnumerationValueList(list: any, index: number): number {
    return list.getEnumerationValue(index);
}

export function getObjectValueList(list: any, index: number): any {
    return list.getObjectValue(index);
}

export function getObjectTypeList(list: any, index: number): number {
    return list.getObjectType(index);
}

export function getReferenceList(list: any, index: number): any {
    return list.getReference(index);
}

export function getPathList(list: any, index: number): any {
    return list.getPath(index);
}

export function getDataList(list: any, index: number): string {
    return list.getData(index);
}

export function getTypeList(list: any, index: number): number {
    return list.getType(index);
}

export function getCountList(list: any): number {
    return list.count;
}

export function clearList(list: any): void {
    list.clear();
}

// ===================================================================
// CONSTANTS AND ENUMS
// ===================================================================

/**
 * Dialog display modes for executeAction
 */
export const DialogModes = {
    NO: 3,               // Don't display dialogs
    ERROR: 2,            // Display error dialogs only  
    ALL: 1               // Display all dialogs
} as const;

/**
 * Common unit types for unit double operations
 */
export const UnitTypes = {
    PIXELS: () => charIDToTypeID('#Pxl'),
    PERCENT: () => charIDToTypeID('#Prc'),
    POINTS: () => charIDToTypeID('#Pnt'),
    INCHES: () => charIDToTypeID('#Inch'),
    MILLIMETERS: () => charIDToTypeID('#Mlm'),
    CENTIMETERS: () => charIDToTypeID('#Cmt'),
    DEGREES: () => charIDToTypeID('#Ang')
} as const;

/**
 * Common class type IDs
 */
export const ClassTypes = {
    LAYER: () => charIDToTypeID('Lyr '),
    DOCUMENT: () => charIDToTypeID('Dcmn'),
    CHANNEL: () => charIDToTypeID('Chnl'),
    APPLICATION: () => stringIDToTypeID('application'),
    TEXT_KEY: () => stringIDToTypeID('textKey'),
    TEXT_STYLE: () => stringIDToTypeID('textStyle'),
    TEXT_STYLE_RANGE: () => stringIDToTypeID('textStyleRange')
} as const;

/**
 * Common property type IDs
 */
export const PropertyTypes = {
    NAME: () => charIDToTypeID('Nm  '),
    BOUNDS: () => stringIDToTypeID('bounds'),
    VISIBLE: () => charIDToTypeID('Vsbl'),
    OPACITY: () => charIDToTypeID('Opct'),
    SIZE_KEY: () => stringIDToTypeID('sizeKey'),
    FONT_POST_SCRIPT_NAME: () => stringIDToTypeID('fontPostScriptName')
} as const;

/**
 * Common enumeration type IDs
 */
export const EnumTypes = {
    ORDINAL: () => charIDToTypeID('Ordn'),
    TARGET: () => charIDToTypeID('Trgt'),
    INDEX: () => charIDToTypeID('Indx')
} as const;

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Checks if two ActionDescriptors are equal
 */
export function isEqual(desc1: any, desc2: any): boolean {
    return desc1.isEqual(desc2);
}

/**
 * Creates ActionDescriptor from stream
 */
export function fromStream(stream: any): any {
    return ActionDescriptor().fromStream(stream);
}

/**
 * Converts ActionDescriptor to stream
 */
export function toStream(descriptor: any): any {
    return descriptor.toStream();
}

/**
 * Creates ExtendScriptFile object for path operations
 * @param path File path string
 * @returns ExtendScriptFile object
 */
export function ExtendScriptFile(path?: string): any {
    return new (global as any).ExtendScriptFile(path);
}

/**
 * Creates Folder object for directory operations
 * @param path Folder path string
 * @returns Folder object
 */
export function Folder(path?: string): any {
    return new (global as any).Folder(path);
}

// ===================================================================
// CONVENIENCE FUNCTIONS (High-level helpers)
// ===================================================================

/**
 * Creates a reference to the current layer
 */
export function createCurrentLayerRef(): any {
    const ref = ActionReference();
    putEnumeratedRef(ref, ClassTypes.LAYER(), EnumTypes.ORDINAL(), EnumTypes.TARGET());
    return ref;
}

/**
 * Creates a reference to the current document
 */
export function createCurrentDocumentRef(): any {
    const ref = ActionReference();
    putEnumeratedRef(ref, ClassTypes.DOCUMENT(), EnumTypes.ORDINAL(), EnumTypes.TARGET());
    return ref;
}

/**
 * Creates a reference to a layer by name
 */
export function createLayerByNameRef(layerName: string): any {
    const ref = ActionReference();
    putName(ref, ClassTypes.LAYER(), layerName);
    return ref;
}

/**
 * Creates a reference to a layer by index
 */
export function createLayerByIndexRef(layerIndex: number): any {
    const ref = ActionReference();
    putIndex(ref, ClassTypes.LAYER(), layerIndex);
    return ref;
}