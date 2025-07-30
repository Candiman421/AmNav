//ps/action-manager/index.ts
/**
 * ActionManager Navigator - Complete Adobe ExtendScript ActionManager API
 * 
 * Self-contained module for new scoring scripts with namespace safety.
 * Does not conflict with existing ps.ts exports or work framework globals.
 * 
 * @fileoverview Complete module exports with conflict prevention
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Direct imports (recommended)
 * ```typescript
 * import { ActionDescriptorNavigator, SENTINELS } from '../ps/action-manager';
 * 
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const fontName = layer.getObject('textKey')
 *   .getList('textStyleRange')
 *   .getFirstWhere(range => range.getInteger('from') === 0)
 *   .getObject('textStyle')
 *   .getString('fontPostScriptName');
 * 
 * if (fontName !== SENTINELS.string) {
 *   console.log('Font:', fontName);
 * }
 * ```
 * 
 * @example Good - Namespace imports for safety
 * ```typescript
 * import { ActionManager } from '../ps/action-manager';
 * 
 * const layer = ActionManager.Navigator.forCurrentLayer();
 * const bounds = layer.getBounds();
 * 
 * if (ActionManager.hasValidBounds(bounds)) {
 *   console.log('Layer size:', bounds.width, 'x', bounds.height);
 * }
 * ```
 */

// ===================================================================
// CORE NAVIGATOR CLASSES
// ===================================================================

/**
 * Primary navigation classes for ActionManager API
 */
export {
    ActionDescriptorNavigator,
    ActionListNavigator
} from './ActionDescriptorNavigator';

/**
 * Default export for convenience
 */
export { ActionDescriptorNavigator as default } from './ActionDescriptorNavigator';

// ===================================================================
// ACTIONMANAGER API FUNCTIONS
// ===================================================================

/**
 * Core execution functions
 */
export {
    executeActionGet,
    executeAction
} from './action-manager-api';

/**
 * Type conversion utilities
 */
export {
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID,
    typeIDToCharID
} from './action-manager-api';

/**
 * Constructor functions for ActionManager objects
 */
export {
    ActionDescriptor,
    ActionReference,
    ActionList
} from './action-manager-api';

/**
 * ActionDescriptor operations
 */
export {
    getString,
    getInteger,
    getDouble,
    getUnitDouble,
    getUnitDoubleType,
    getBoolean,
    getEnumerationType,
    getEnumerationValue,
    getObjectValue,
    getObjectType,
    getList,
    getReference,
    getPath,
    getData,
    getClass,
    getType,
    getKey,
    hasKey,
    getCount,
    putString,
    putInteger,
    putDouble,
    putUnitDouble,
    putBoolean,
    putEnumerated,
    putObject,
    putList,
    putReference,
    putPath,
    putData,
    putClass,
    clear,
    erase
} from './action-manager-api';

/**
 * ActionReference operations
 */
export {
    putProperty,
    putEnumeratedRef,
    putClassRef,
    putIdentifier,
    putIndex,
    putName,
    putOffset,
    getDesiredClass,
    getEnumerationTypeRef,
    getEnumerationValueRef,
    getForm,
    getIdentifier,
    getIndex,
    getName,
    getOffset,
    getPropertyRef
} from './action-manager-api';

/**
 * ActionList operations
 */
export {
    putStringList,
    putIntegerList,
    putDoubleList,
    putUnitDoubleList,
    putBooleanList,
    putEnumeratedList,
    putObjectList,
    putReferenceList,
    putPathList,
    putDataList,
    getStringList,
    getIntegerList,
    getDoubleList,
    getUnitDoubleList,
    getUnitDoubleTypeList,
    getBooleanList,
    getEnumerationTypeList,
    getEnumerationValueList,
    getObjectValueList,
    getObjectTypeList,
    getReferenceList,
    getPathList,
    getDataList,
    getTypeList,
    getCountList,
    clearList
} from './action-manager-api';

/**
 * Constants and utilities
 */
export {
    DialogModes,
    UnitTypes,
    ClassTypes,
    PropertyTypes,
    EnumTypes,
    isEqual,
    fromStream,
    toStream,
    ExtendScriptFile,
    Folder,
    createCurrentLayerRef,
    createCurrentDocumentRef,
    createLayerByNameRef
} from './action-manager-api';

// ===================================================================
// TYPE SYSTEM EXPORTS
// ===================================================================

/**
 * Runtime values (constants and utility functions)
 */
export {
    SENTINELS,
    hasValidBounds,
    isSentinelFile,
    isSentinelReference,
    isValidValueType,
    isSentinelValue,
    isActionDescriptorNavigator,
    isActionListNavigator
} from './types';

/**
 * TypeScript interfaces and types
 */
export type {
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray,
    PredicateFunction,
    SelectorFunction,
    BoundsObject,
    FontStyleProperties,
    ColorProperties,
    WarpProperties,
    LayerProperties,
    ValueType,
    SentinelValue,
    SentinelValueMap,
    FontDataProjection,
    ColorDataProjection,
    TextStyleProjection
} from './types';

/**
 * Namespace type aliases (for TypeScript development only)
 * Note: These are type aliases, not the constructor functions above
 */
export type {
    ActionDescriptor as ActionDescriptorType,
    ActionReference as ActionReferenceType,
    ActionList as ActionListType,
    ExtendScriptFile as ExtendScriptFileType
} from './types';

// ===================================================================
// NAMESPACE EXPORT FOR MAXIMUM SAFETY
// ===================================================================

import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';
import {
    executeActionGet as apiExecuteActionGet,
    executeAction as apiExecuteAction,
    stringIDToTypeID as apiStringIDToTypeID,
    charIDToTypeID as apiCharIDToTypeID,
    ActionDescriptor as apiActionDescriptor,
    ActionReference as apiActionReference,
    ActionList as apiActionList,
    DialogModes as apiDialogModes,
    createCurrentLayerRef as apiCreateCurrentLayerRef,
    createCurrentDocumentRef as apiCreateCurrentDocumentRef
} from './action-manager-api';
import {
    SENTINELS as typesSENTINELS,
    hasValidBounds as typesHasValidBounds
} from './types';

/**
 * ActionManager namespace for conflict-free usage
 * 
 * @example Namespace usage
 * ```typescript
 * import { ActionManager } from '../ps/action-manager';
 * 
 * const layer = ActionManager.Navigator.forCurrentLayer();
 * const bounds = layer.getBounds();
 * 
 * if (ActionManager.hasValidBounds(bounds)) {
 *   const layerRef = ActionManager.createCurrentLayerRef();
 *   const desc = ActionManager.executeActionGet(layerRef);
 * }
 * ```
 */
export namespace ActionManager {
    // Core navigator class
    export const Navigator = ActionDescriptorNavigator;

    // Essential execution functions
    export const executeActionGet = apiExecuteActionGet;
    export const executeAction = apiExecuteAction;
    export const stringIDToTypeID = apiStringIDToTypeID;
    export const charIDToTypeID = apiCharIDToTypeID;

    // Constructor functions
    export const ActionDescriptor = apiActionDescriptor;
    export const ActionReference = apiActionReference;
    export const ActionList = apiActionList;

    // Constants
    export const DialogModes = apiDialogModes;
    export const SENTINELS = typesSENTINELS;

    // Utilities
    export const hasValidBounds = typesHasValidBounds;
    export const createCurrentLayerRef = apiCreateCurrentLayerRef;
    export const createCurrentDocumentRef = apiCreateCurrentDocumentRef;
}

// ===================================================================
// MODULE METADATA
// ===================================================================

/**
 * Module version and basic info
 */
export const VERSION = '1.0.0' as const;

export const MODULE_INFO = {
    name: 'ActionManager Navigator',
    version: VERSION,
    description: 'Complete Adobe ExtendScript ActionManager API with fluent navigation',
    author: 'ActionManager Navigator Team',
    license: 'MIT'
} as const;