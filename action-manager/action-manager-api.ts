//ps/action-manager/action-manager-api.ts
/**
 * Complete Photoshop ActionManager API for ExtendScript
 * 
 * This module provides a complete TypeScript wrapper for Photoshop's ActionManager API,
 * enabling both GET (reading) and PUT (writing/setting) operations.
 * 
 * ARCHITECTURE ALIGNED: Imports namespace types from types.ts for consistency.
 * Uses ExtendScript globals while maintaining type safety through namespace types.
 * 
 * Updated for ActionManager module integration:
 * - Imports namespace types from types.ts (dependency chain alignment)
 * - Uses ExtendScriptFile consistently to prevent conflicts
 * - Full type safety for all parameters and returns
 * - Complete API coverage for ActionManager operations
 * - Ready for namespace export to prevent conflicts
 * 
 * Usage:
 * - Import functions as needed in your ActionDescriptorNavigator and scoring scripts
 * - All functions are thin wrappers around the global Photoshop app API
 * - Compatible with ExtendScript ES3 when transpiled
 * 
 * @fileoverview Complete ActionManager API wrapper functions
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Import for new scoring scripts
 * ```typescript
 * import { executeActionGet, stringIDToTypeID, ActionDescriptorNavigator } from '../ps/action-manager';
 * 
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const bounds = layer.getBounds();
 * ```
 */

// Import ExtendScript globals (foundation)
/// <reference path="./globals.d.ts" />

// Import namespace types (architecture alignment)
import type {
    ActionDescriptor,
    ActionList,
    ActionReference,
    ExtendScriptFile,
    Folder
} from './types';

// ===================================================================
// HOST APPLICATION GLOBALS (Required for API wrapper functions)
// ===================================================================

/**
 * Photoshop application object - provides ActionManager API access
 * This is the host application object available in ExtendScript environment
 */
declare const app: {
    executeActionGet(reference: any): any;
    executeAction(eventID: number, descriptor?: any, displayDialogs?: number): any;
    stringIDToTypeID(stringID: string): number;
    charIDToTypeID(charID: string): number;
    typeIDToStringID(typeID: number): string;
    typeIDToCharID(typeID: number): string;
    ActionDescriptor: any;
    ActionReference: any;
    ActionList: any;
};

/**
 * Global object - provides access to ExtendScript constructors
 * This is the global scope object in ExtendScript environment
 */
declare const global: {
    File: any;
    Folder: any;
};

// ===================================================================
// CORE EXECUTION FUNCTIONS (Used by ActionDescriptorNavigator)
// ===================================================================

/**
 * Executes an ActionManager get operation
 * @param reference ActionReference pointing to the object to retrieve
 * @returns ActionDescriptor containing the object's properties
 * 
 * @example Best - Get current layer properties
 * ```typescript
 * import { executeActionGet, ActionReference, charIDToTypeID } from '../ps/action-manager';
 * 
 * const ref = new ActionReference();
 * ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
 * const desc = executeActionGet(ref);
 * ```
 */
export function executeActionGet(reference: ActionReference): ActionDescriptor {
    return app.executeActionGet(reference);
}

/**
 * Executes an ActionManager action (set/create/modify operations)
 * @param eventID The action event ID
 * @param descriptor ActionDescriptor with parameters (optional)
 * @param displayDialogs Dialog display mode (optional)
 * @returns ActionDescriptor with results
 * 
 * @example Good - Create new layer
 * ```typescript
 * import { executeAction, stringIDToTypeID, ActionDescriptor } from '../ps/action-manager';
 * 
 * const desc = new ActionDescriptor();
 * executeAction(stringIDToTypeID('make'), desc, DialogModes.NO);
 * ```
 */
export function executeAction(eventID: number, descriptor?: ActionDescriptor, displayDialogs?: number): ActionDescriptor {
    return app.executeAction(eventID, descriptor, displayDialogs);
}

// ===================================================================
// TYPE CONVERSION FUNCTIONS (Used by ActionDescriptorNavigator)
// ===================================================================

/**
 * Converts string ID to numeric type ID
 * @param stringID String identifier (e.g., "textKey")
 * @returns Numeric type ID
 * 
 * @example Best - Convert property names
 * ```typescript
 * import { stringIDToTypeID } from '../ps/action-manager';
 * 
 * const textKeyID = stringIDToTypeID('textKey');
 * const fontNameID = stringIDToTypeID('fontPostScriptName');
 * const sizeKeyID = stringIDToTypeID('sizeKey');
 * ```
 */
export function stringIDToTypeID(stringID: string): number {
    return app.stringIDToTypeID(stringID);
}

/**
 * Converts 4-character ID to numeric type ID
 * @param charID 4-character string (e.g., "Lyr ")
 * @returns Numeric type ID
 * 
 * @example Good - Convert class names
 * ```typescript
 * import { charIDToTypeID } from '../ps/action-manager';
 * 
 * const layerClassID = charIDToTypeID("Lyr ");
 * const documentClassID = charIDToTypeID("Dcmn");
 * const ordinalID = charIDToTypeID("Ordn");
 * ```
 */
export function charIDToTypeID(charID: string): number {
    return app.charIDToTypeID(charID);
}

/**
 * Converts numeric type ID to string ID
 * @param typeID Numeric type ID
 * @returns String identifier
 * 
 * @example Straightforward - Convert back to string
 * ```typescript
 * import { typeIDToStringID, stringIDToTypeID } from '../ps/action-manager';
 * 
 * const id = stringIDToTypeID('textKey');
 * const backToString = typeIDToStringID(id); // "textKey"
 * ```
 */
export function typeIDToStringID(typeID: number): string {
    return app.typeIDToStringID(typeID);
}

/**
 * Converts numeric type ID to 4-character ID
 * @param typeID Numeric type ID
 * @returns 4-character string
 * 
 * @example Straightforward - Convert back to char ID
 * ```typescript
 * import { typeIDToCharID, charIDToTypeID } from '../ps/action-manager';
 * 
 * const id = charIDToTypeID("Lyr ");
 * const backToChar = typeIDToCharID(id); // "Lyr "
 * ```
 */
export function typeIDToCharID(typeID: number): string {
    return app.typeIDToCharID(typeID);
}

// ===================================================================
// CONSTRUCTOR FUNCTIONS (Namespace Type Aligned)
// ===================================================================

/**
 * Creates a new ActionDescriptor
 * @returns New ActionDescriptor instance (namespace type)
 * 
 * @example Best - Create descriptor for complex operations
 * ```typescript
 * import { ActionDescriptor, putString, putInteger } from '../ps/action-manager';
 * 
 * const desc = ActionDescriptor();
 * putString(desc, stringIDToTypeID('name'), 'New Layer');
 * putInteger(desc, stringIDToTypeID('opacity'), 255);
 * ```
 */
export function ActionDescriptor(): ActionDescriptor {
    return new (app as any).ActionDescriptor() as ActionDescriptor;
}

/**
 * Creates a new ActionReference
 * @returns New ActionReference instance (namespace type)
 * 
 * @example Best - Create reference to current layer
 * ```typescript
 * import { ActionReference, putEnumeratedRef, charIDToTypeID } from '../ps/action-manager';
 * 
 * const ref = ActionReference();
 * putEnumeratedRef(ref, charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
 * ```
 */
export function ActionReference(): ActionReference {
    return new (app as any).ActionReference() as ActionReference;
}

/**
 * Creates a new ActionList
 * @returns New ActionList instance (namespace type)
 * 
 * @example Good - Create list for multiple items
 * ```typescript
 * import { ActionList, putStringList } from '../ps/action-manager';
 * 
 * const list = ActionList();
 * putStringList(list, 'Arial');
 * putStringList(list, 'Times');
 * putStringList(list, 'Helvetica');
 * ```
 */
export function ActionList(): ActionList {
    return new (app as any).ActionList() as ActionList;
}

// ===================================================================
// ACTIONDESCRIPTOR GET METHODS (Reading Data)
// ===================================================================

/**
 * Gets string value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns String value
 */
export function getString(descriptor: ActionDescriptor, key: number): string {
    return descriptor.getString(key);
}

/**
 * Gets integer value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Integer value
 */
export function getInteger(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getInteger(key);
}

/**
 * Gets double value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Double value
 */
export function getDouble(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getDouble(key);
}

/**
 * Gets unit double value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Unit double value
 */
export function getUnitDouble(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getUnitDoubleValue(key);
}

/**
 * Gets unit type for unit double from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Unit type ID
 */
export function getUnitDoubleType(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getUnitDoubleType(key);
}

/**
 * Gets boolean value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Boolean value
 */
export function getBoolean(descriptor: ActionDescriptor, key: number): boolean {
    return descriptor.getBoolean(key);
}

/**
 * Gets enumeration type from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Enumeration type ID
 */
export function getEnumerationType(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getEnumerationType(key);
}

/**
 * Gets enumeration value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Enumeration value ID
 */
export function getEnumerationValue(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getEnumerationValue(key);
}

/**
 * Gets object value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Nested ActionDescriptor
 */
export function getObjectValue(descriptor: ActionDescriptor, key: number): ActionDescriptor {
    return descriptor.getObjectValue(key);
}

/**
 * Gets object type from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Object type ID
 */
export function getObjectType(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getObjectType(key);
}

/**
 * Gets list value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns ActionList instance
 */
export function getList(descriptor: ActionDescriptor, key: number): ActionList {
    return descriptor.getList(key);
}

/**
 * Gets reference value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns ActionReference instance
 */
export function getReference(descriptor: ActionDescriptor, key: number): ActionReference {
    return descriptor.getReference(key);
}

/**
 * Gets path value from ActionDescriptor (using ExtendScriptFile)
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns ExtendScriptFile instance
 */
export function getPath(descriptor: ActionDescriptor, key: number): ExtendScriptFile {
    return descriptor.getPath(key);
}

/**
 * Gets raw data from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Raw data string
 */
export function getData(descriptor: ActionDescriptor, key: number): string {
    return descriptor.getData(key);
}

/**
 * Gets class value from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Class type ID
 */
export function getClass(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getClass(key);
}

/**
 * Gets value type from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns Value type ID
 */
export function getType(descriptor: ActionDescriptor, key: number): number {
    return descriptor.getType(key);
}

/**
 * Gets key at index from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param index Zero-based index
 * @returns Key type ID
 */
export function getKey(descriptor: ActionDescriptor, index: number): number {
    return descriptor.getKey(index);
}

/**
 * Checks if ActionDescriptor has specific key
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @returns true if key exists
 */
export function hasKey(descriptor: ActionDescriptor, key: number): boolean {
    return descriptor.hasKey(key);
}

/**
 * Gets count of properties in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @returns Number of properties
 */
export function getCount(descriptor: ActionDescriptor): number {
    return descriptor.count;
}

// ===================================================================
// ACTIONDESCRIPTOR PUT METHODS (Setting/Writing Data)
// ===================================================================

/**
 * Sets string value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value String value to set
 */
export function putString(descriptor: ActionDescriptor, key: number, value: string): void {
    descriptor.putString(key, value);
}

/**
 * Sets integer value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value Integer value to set
 */
export function putInteger(descriptor: ActionDescriptor, key: number, value: number): void {
    descriptor.putInteger(key, value);
}

/**
 * Sets double value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value Double value to set
 */
export function putDouble(descriptor: ActionDescriptor, key: number, value: number): void {
    descriptor.putDouble(key, value);
}

/**
 * Sets unit double value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param unitType Unit type ID
 * @param value Numeric value
 */
export function putUnitDouble(descriptor: ActionDescriptor, key: number, unitType: number, value: number): void {
    descriptor.putUnitDouble(key, unitType, value);
}

/**
 * Sets boolean value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value Boolean value to set
 */
export function putBoolean(descriptor: ActionDescriptor, key: number, value: boolean): void {
    descriptor.putBoolean(key, value);
}

/**
 * Sets enumerated value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param enumType Enumeration type ID
 * @param value Enumeration value ID
 */
export function putEnumerated(descriptor: ActionDescriptor, key: number, enumType: number, value: number): void {
    descriptor.putEnumerated(key, enumType, value);
}

/**
 * Sets object value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param classType Object class type ID
 * @param value ActionDescriptor to embed
 */
export function putObject(descriptor: ActionDescriptor, key: number, classType: number, value: ActionDescriptor): void {
    descriptor.putObject(key, classType, value);
}

/**
 * Sets list value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value ActionList to embed
 */
export function putList(descriptor: ActionDescriptor, key: number, value: ActionList): void {
    descriptor.putList(key, value);
}

/**
 * Sets reference value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value ActionReference to embed
 */
export function putReference(descriptor: ActionDescriptor, key: number, value: ActionReference): void {
    descriptor.putReference(key, value);
}

/**
 * Sets path value in ActionDescriptor (using ExtendScriptFile)
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value ExtendScriptFile to embed
 */
export function putPath(descriptor: ActionDescriptor, key: number, value: ExtendScriptFile): void {
    descriptor.putPath(key, value);
}

/**
 * Sets raw data in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value Raw data string
 */
export function putData(descriptor: ActionDescriptor, key: number, value: string): void {
    descriptor.putData(key, value);
}

/**
 * Sets class value in ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID)
 * @param value Class type ID
 */
export function putClass(descriptor: ActionDescriptor, key: number, value: number): void {
    descriptor.putClass(key, value);
}

/**
 * Clears all properties from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 */
export function clear(descriptor: ActionDescriptor): void {
    descriptor.clear();
}

/**
 * Erases specific property from ActionDescriptor
 * @param descriptor ActionDescriptor instance
 * @param key Property key (type ID) to remove
 */
export function erase(descriptor: ActionDescriptor, key: number): void {
    descriptor.erase(key);
}

// ===================================================================
// ACTIONREFERENCE PUT METHODS (Building References)
// ===================================================================

/**
 * Sets property reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param property Property type ID
 */
export function putProperty(reference: ActionReference, desiredClass: number, property: number): void {
    reference.putProperty(desiredClass, property);
}

/**
 * Sets enumerated reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param enumType Enumeration type ID
 * @param value Enumeration value ID
 */
export function putEnumeratedRef(reference: ActionReference, desiredClass: number, enumType: number, value: number): void {
    reference.putEnumerated(desiredClass, enumType, value);
}

/**
 * Sets class reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 */
export function putClassRef(reference: ActionReference, desiredClass: number): void {
    reference.putClass(desiredClass);
}

/**
 * Sets identifier reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param identifier Unique identifier
 */
export function putIdentifier(reference: ActionReference, desiredClass: number, identifier: number): void {
    reference.putIdentifier(desiredClass, identifier);
}

/**
 * Sets index reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param index Zero-based index
 */
export function putIndex(reference: ActionReference, desiredClass: number, index: number): void {
    reference.putIndex(desiredClass, index);
}

/**
 * Sets name reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param name Object name
 */
export function putName(reference: ActionReference, desiredClass: number, name: string): void {
    reference.putName(desiredClass, name);
}

/**
 * Sets offset reference
 * @param reference ActionReference instance
 * @param desiredClass Class type ID
 * @param offset Relative offset
 */
export function putOffset(reference: ActionReference, desiredClass: number, offset: number): void {
    reference.putOffset(desiredClass, offset);
}

// ===================================================================
// ACTIONREFERENCE GET METHODS (Reading References)
// ===================================================================

/**
 * Gets desired class from ActionReference
 * @param reference ActionReference instance
 * @returns Class type ID
 */
export function getDesiredClass(reference: ActionReference): number {
    return reference.getDesiredClass();
}

/**
 * Gets enumeration type from ActionReference
 * @param reference ActionReference instance
 * @returns Enumeration type ID
 */
export function getEnumerationTypeRef(reference: ActionReference): number {
    return reference.getEnumeratedType();
}

/**
 * Gets enumeration value from ActionReference
 * @param reference ActionReference instance
 * @returns Enumeration value ID
 */
export function getEnumerationValueRef(reference: ActionReference): number {
    return reference.getEnumeratedValue();
}

/**
 * Gets form from ActionReference
 * @param reference ActionReference instance
 * @returns Reference form type
 */
export function getForm(reference: ActionReference): number {
    return reference.getForm();
}

/**
 * Gets identifier from ActionReference
 * @param reference ActionReference instance
 * @returns Object identifier
 */
export function getIdentifier(reference: ActionReference): number {
    return reference.getIdentifier();
}

/**
 * Gets index from ActionReference
 * @param reference ActionReference instance
 * @returns Object index
 */
export function getIndex(reference: ActionReference): number {
    return reference.getIndex();
}

/**
 * Gets name from ActionReference
 * @param reference ActionReference instance
 * @returns Object name
 */
export function getName(reference: ActionReference): string {
    return reference.getName();
}

/**
 * Gets offset from ActionReference
 * @param reference ActionReference instance
 * @returns Relative offset
 */
export function getOffset(reference: ActionReference): number {
    return reference.getOffset();
}

/**
 * Gets property from ActionReference
 * @param reference ActionReference instance
 * @returns Property type ID
 */
export function getPropertyRef(reference: ActionReference): number {
    return reference.getProperty();
}

// ===================================================================
// ACTIONLIST METHODS (Array Operations)
// ===================================================================

// ActionList PUT methods
export function putStringList(list: ActionList, value: string): void {
    list.putString(value);
}

export function putIntegerList(list: ActionList, value: number): void {
    list.putInteger(value);
}

export function putDoubleList(list: ActionList, value: number): void {
    list.putDouble(value);
}

export function putUnitDoubleList(list: ActionList, unitType: number, value: number): void {
    list.putUnitDouble(unitType, value);
}

export function putBooleanList(list: ActionList, value: boolean): void {
    list.putBoolean(value);
}

export function putEnumeratedList(list: ActionList, enumType: number, value: number): void {
    list.putEnumerated(enumType, value);
}

export function putObjectList(list: ActionList, classType: number, value: ActionDescriptor): void {
    list.putObject(classType, value);
}

export function putReferenceList(list: ActionList, value: ActionReference): void {
    list.putReference(value);
}

export function putPathList(list: ActionList, value: ExtendScriptFile): void {
    list.putPath(value);
}

export function putDataList(list: ActionList, value: string): void {
    list.putData(value);
}

// ActionList GET methods
export function getStringList(list: ActionList, index: number): string {
    return list.getString(index);
}

export function getIntegerList(list: ActionList, index: number): number {
    return list.getInteger(index);
}

export function getDoubleList(list: ActionList, index: number): number {
    return list.getDouble(index);
}

export function getUnitDoubleList(list: ActionList, index: number): number {
    return list.getUnitDoubleValue(index);
}

export function getUnitDoubleTypeList(list: ActionList, index: number): number {
    return list.getUnitDoubleType(index);
}

export function getBooleanList(list: ActionList, index: number): boolean {
    return list.getBoolean(index);
}

export function getEnumerationTypeList(list: ActionList, index: number): number {
    return list.getEnumerationType(index);
}

export function getEnumerationValueList(list: ActionList, index: number): number {
    return list.getEnumerationValue(index);
}

export function getObjectValueList(list: ActionList, index: number): ActionDescriptor {
    return list.getObjectValue(index);
}

export function getObjectTypeList(list: ActionList, index: number): number {
    return list.getObjectType(index);
}

export function getReferenceList(list: ActionList, index: number): ActionReference {
    return list.getReference(index);
}

export function getPathList(list: ActionList, index: number): ExtendScriptFile {
    return list.getPath(index);
}

export function getDataList(list: ActionList, index: number): string {
    return list.getData(index);
}

export function getTypeList(list: ActionList, index: number): number {
    return list.getType(index);
}

export function getCountList(list: ActionList): number {
    return list.count;
}

export function clearList(list: ActionList): void {
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
 * @param desc1 First ActionDescriptor
 * @param desc2 Second ActionDescriptor
 * @returns true if descriptors are equal
 */
export function isEqual(desc1: ActionDescriptor, desc2: ActionDescriptor): boolean {
    return desc1.isEqual(desc2);
}

/**
 * Creates ActionDescriptor from stream
 * @param stream Data stream
 * @returns ActionDescriptor from stream data
 */
export function fromStream(stream: string): ActionDescriptor {
    const desc = ActionDescriptor();
    desc.fromStream(stream);
    return desc;
}

/**
 * Converts ActionDescriptor to stream
 * @param descriptor ActionDescriptor to convert
 * @returns Stream data string
 */
export function toStream(descriptor: ActionDescriptor): string {
    return descriptor.toStream();
}

/**
 * Creates ExtendScriptFile object for path operations
 * @param path File path string (optional)
 * @returns ExtendScriptFile object (namespace type)
 * 
 * @example Good - Create file references
 * ```typescript
 * import { ExtendScriptFile } from '../ps/action-manager';
 * 
 * const file = ExtendScriptFile('/path/to/document.psd');
 * if (file.exists) {
 *   const content = file.read();
 * }
 * ```
 */
export function ExtendScriptFile(path?: string): ExtendScriptFile {
    return new (global as any).File(path) as ExtendScriptFile;
}

/**
 * Creates Folder object for directory operations
 * @param path Folder path string (optional)
 * @returns Folder object (namespace type)
 * 
 * @example Good - Create folder references
 * ```typescript
 * import { Folder } from '../ps/action-manager';
 * 
 * const folder = Folder('/path/to/directory');
 * if (folder.exists) {
 *   const files = folder.getFiles();
 * }
 * ```
 */
export function Folder(path?: string): Folder {
    return new (global as any).Folder(path) as Folder;
}

// ===================================================================
// CONVENIENCE FUNCTIONS (High-level helpers)
// ===================================================================

/**
 * Creates a reference to the current layer
 * @returns ActionReference pointing to current layer
 * 
 * @example Best - Get current layer reference
 * ```typescript
 * import { createCurrentLayerRef, executeActionGet } from '../ps/action-manager';
 * 
 * const ref = createCurrentLayerRef();
 * const desc = executeActionGet(ref);
 * ```
 */
export function createCurrentLayerRef(): ActionReference {
    const ref = ActionReference();
    putEnumeratedRef(ref, ClassTypes.LAYER(), EnumTypes.ORDINAL(), EnumTypes.TARGET());
    return ref;
}

/**
 * Creates a reference to the current document
 * @returns ActionReference pointing to current document
 * 
 * @example Good - Get document properties
 * ```typescript
 * import { createCurrentDocumentRef, executeActionGet } from '../ps/action-manager';
 * 
 * const ref = createCurrentDocumentRef();
 * const desc = executeActionGet(ref);
 * ```
 */
export function createCurrentDocumentRef(): ActionReference {
    const ref = ActionReference();
    putEnumeratedRef(ref, ClassTypes.DOCUMENT(), EnumTypes.ORDINAL(), EnumTypes.TARGET());
    return ref;
}

/**
 * Creates a reference to a layer by name
 * @param layerName Name of the layer to reference
 * @returns ActionReference pointing to named layer
 * 
 * @example Good - Reference specific layer
 * ```typescript
 * import { createLayerByNameRef, executeActionGet } from '../ps/action-manager';
 * 
 * const ref = createLayerByNameRef('Background');
 * const desc = executeActionGet(ref);
 * ```
 */
export function createLayerByNameRef(layerName: string): ActionReference {
    const ref = ActionReference();
    putName(ref, ClassTypes.LAYER(), layerName);
    return ref;
}

/**
 * Creates a reference to a layer by index
 * @param layerIndex Index of the layer (1-based)
 * @returns ActionReference pointing to indexed layer
 * 
 * @example Straightforward - Reference by index
 * ```typescript
 * import { createLayerByIndexRef, executeActionGet } from '../ps/action-manager';
 * 
 * const ref = createLayerByIndexRef(1);  // First layer
 * const desc = executeActionGet(ref);
 * ```
 */
export function createLayerByIndexRef(layerIndex: number): ActionReference {
    const ref = ActionReference();
    putIndex(ref, ClassTypes.LAYER(), layerIndex);
    return ref;
}