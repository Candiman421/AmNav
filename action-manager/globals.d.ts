//ps/action-manager/globals.d.ts
/**
 * ExtendScript Global Declarations for ActionManager
 * 
 * NAMESPACE ISOLATED to prevent conflicts with work framework.
 * All ActionManager classes are under ActionManagerGlobals namespace.
 * Global functions remain global (safe, unlikely to conflict).
 * Uses ExtendScriptFile to prevent File class conflicts.
 * 
 * @fileoverview Foundation types for ActionManager module - Conflict-Free
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Usage after namespace isolation
 * ```typescript
 * // Access via namespace
 * const desc = new ActionManagerGlobals.ActionDescriptor();
 * 
 * // Global functions remain global
 * const result = executeActionGet(ref);
 * ```
 */

declare global {
    /**
     * ExtendScript logging interface (conditional declaration)
     * Only declare if not already available from work framework
     */
    var $: {
        writeln(message: string): void;
        write(message: string): void;
        sleep(milliseconds: number): void;
    } | undefined;

    /**
     * ISOLATED ACTIONMANAGER NAMESPACE
     * 
     * All ActionManager-specific classes are namespaced to prevent conflicts
     * with existing work framework declarations in ps-patch.d.ts
     */
    namespace ActionManagerGlobals {
        /**
         * ExtendScript File class (renamed to avoid conflicts)
         * Use ExtendScriptFile to prevent conflicts with native File or work framework File
         */
        class ExtendScriptFile {
            constructor(path?: string);
            readonly absoluteURI: string;
            readonly alias: boolean;
            readonly created: Date;
            readonly creator: string;
            readonly displayName: string;
            readonly encoding: string;
            readonly eof: boolean;
            readonly error: string;
            readonly exists: boolean;
            readonly fsName: string;
            readonly fullName: string;
            readonly hidden: boolean;
            readonly length: number;
            readonly lineFeed: string;
            readonly localizedName: string;
            readonly modified: Date;
            readonly name: string;
            readonly parent: Folder;
            readonly path: string;
            readonly readonly: boolean;
            readonly relativeURI: string;
            readonly type: string;
            
            changePath(path: string): boolean;
            close(): boolean;
            copy(target: string): boolean;
            createAlias(path?: string): boolean;
            execute(): boolean;
            getRelativeURI(basePath?: string): string;
            open(mode: string, type?: string, creator?: string): boolean;
            openDlg(prompt?: string, filter?: string | Function, multiSelect?: boolean): ExtendScriptFile | ExtendScriptFile[] | null;
            read(chars?: number): string;
            readch(): string;
            readln(): string;
            remove(): boolean;
            rename(newName: string): boolean;
            resolve(): ExtendScriptFile | null;
            saveDlg(prompt?: string, filter?: string | Function): ExtendScriptFile | null;
            seek(pos: number, mode?: number): boolean;
            tell(): number;
            write(...text: string[]): boolean;
            writeln(...text: string[]): boolean;
        }

        /**
         * ExtendScript Folder class
         */
        class Folder {
            constructor(path?: string);
            readonly absoluteURI: string;
            readonly alias: boolean;
            readonly created: Date;
            readonly displayName: string;
            readonly error: string;
            readonly exists: boolean;
            readonly fsName: string;
            readonly fullName: string;
            readonly localizedName: string;
            readonly modified: Date;
            readonly name: string;
            readonly parent: Folder;
            readonly path: string;
            readonly relativeURI: string;
            
            changePath(path: string): boolean;
            create(): boolean;
            execute(): boolean;
            getFiles(mask?: string | Function): Array<ExtendScriptFile | Folder>;
            getRelativeURI(basePath?: string): string;
            remove(): boolean;
            rename(newName: string): boolean;
            resolve(): Folder | null;
            selectDlg(prompt?: string): Folder | null;
            
            // Static properties
            static readonly appData: Folder;
            static readonly appPackage: Folder;
            static readonly commonFiles: Folder;
            static readonly current: Folder;
            static readonly desktop: Folder;
            static readonly fs: string;
            static readonly myDocuments: Folder;
            static readonly startup: Folder;
            static readonly system: Folder;
            static readonly temp: Folder;
            static readonly trash: Folder;
            static readonly userData: Folder;
            
            // Static methods
            static decode(uri: string): string;
            static encode(name: string): string;
            static isEncodingAvailable(name: string): boolean;
            static selectDialog(prompt?: string): Folder | null;
        }

        /**
         * ActionReference class for referencing Photoshop objects
         * ISOLATED: No conflict with ps-patch.d.ts ActionReference
         */
        class ActionReference {
            constructor();
            
            // Put methods for building references
            putClass(desiredClass: number): void;
            putEnumerated(desiredClass: number, enumType: number, value: number): void;
            putIdentifier(desiredClass: number, identifier: number): void;
            putIndex(desiredClass: number, index: number): void;
            putName(desiredClass: number, name: string): void;
            putOffset(desiredClass: number, offset: number): void;
            putProperty(desiredClass: number, property: number): void;
            
            // Get methods for reading references
            getDesiredClass(): number;
            getEnumeratedType(): number;
            getEnumeratedValue(): number;
            getForm(): number;
            getIdentifier(): number;
            getIndex(): number;
            getName(): string;
            getOffset(): number;
            getProperty(): number;
            
            // Container reference
            getContainer(): ActionReference;
        }

        /**
         * ActionDescriptor class for complex data structures
         * ISOLATED: No conflict with ps-patch.d.ts ActionDescriptor
         * Comprehensive method declarations for all ActionManager operations
         */
        class ActionDescriptor {
            constructor();
            readonly count: number;
            readonly typename: string;
            
            // Key management
            hasKey(key: number): boolean;
            getKey(index: number): number;
            
            // Value getters
            getBoolean(key: number): boolean;
            getClass(key: number): number;
            getData(key: number): string;
            getDouble(key: number): number;
            getEnumerationType(key: number): number;
            getEnumerationValue(key: number): number;
            getInteger(key: number): number;
            getLargeInteger(key: number): number;
            getList(key: number): ActionList;
            getObjectType(key: number): number;
            getObjectValue(key: number): ActionDescriptor;
            getPath(key: number): ExtendScriptFile;
            getReference(key: number): ActionReference;
            getString(key: number): string;
            getType(key: number): number;
            getUnitDoubleType(key: number): number;
            getUnitDoubleValue(key: number): number;
            
            // Value setters
            putBoolean(key: number, value: boolean): void;
            putClass(key: number, value: number): void;
            putData(key: number, value: string): void;
            putDouble(key: number, value: number): void;
            putEnumerated(key: number, enumType: number, value: number): void;
            putInteger(key: number, value: number): void;
            putLargeInteger(key: number, value: number): void;
            putList(key: number, value: ActionList): void;
            putObject(key: number, classType: number, value: ActionDescriptor): void;
            putPath(key: number, value: ExtendScriptFile): void;
            putReference(key: number, value: ActionReference): void;
            putString(key: number, value: string): void;
            putUnitDouble(key: number, unitType: number, value: number): void;
            
            // Management
            clear(): void;
            erase(key: number): void;
            fromStream(stream: string): void;
            toStream(): string;
            
            // Comparison
            isEqual(other: ActionDescriptor): boolean;
        }

        /**
         * ActionList class for array-like data structures
         * ISOLATED: No conflict with ps-patch.d.ts ActionList
         * Complete method declarations for list operations
         */
        class ActionList {
            constructor();
            readonly count: number;
            readonly typename: string;
            
            // Value getters
            getBoolean(index: number): boolean;
            getClass(index: number): number;
            getData(index: number): string;
            getDouble(index: number): number;
            getEnumerationType(index: number): number;
            getEnumerationValue(index: number): number;
            getInteger(index: number): number;
            getLargeInteger(index: number): number;
            getList(index: number): ActionList;
            getObjectType(index: number): number;
            getObjectValue(index: number): ActionDescriptor;
            getPath(index: number): ExtendScriptFile;
            getReference(index: number): ActionReference;
            getString(index: number): string;
            getType(index: number): number;
            getUnitDoubleType(index: number): number;
            getUnitDoubleValue(index: number): number;
            
            // Value setters
            putBoolean(value: boolean): void;
            putClass(value: number): void;
            putData(value: string): void;
            putDouble(value: number): void;
            putEnumerated(enumType: number, value: number): void;
            putInteger(value: number): void;
            putLargeInteger(value: number): void;
            putList(value: ActionList): void;
            putObject(classType: number, value: ActionDescriptor): void;
            putPath(value: ExtendScriptFile): void;
            putReference(value: ActionReference): void;
            putString(value: string): void;
            putUnitDouble(unitType: number, value: number): void;
            
            // Management
            clear(): void;
        }

        /**
         * Unit value class for measurements
         */
        class UnitValue {
            constructor(value?: number | string, unit?: string);
            value: number;
            type: string;
            
            as(unit: string): UnitValue;
            convert(unit: string): UnitValue;
            toString(): string;
            valueOf(): number;
        }
    }

    /**
     * GLOBAL FUNCTIONS (Safe - unlikely to conflict with work framework)
     * 
     * Core ActionManager execution functions remain global since they're
     * fundamental to ActionManager operation and unlikely to conflict
     */
    function executeActionGet(reference: ActionManagerGlobals.ActionReference): ActionManagerGlobals.ActionDescriptor;
    function executeAction(eventID: number, descriptor?: ActionManagerGlobals.ActionDescriptor, dialogOptions?: number): ActionManagerGlobals.ActionDescriptor;
    
    /**
     * Type conversion utilities (Safe - core ExtendScript functions)
     * Essential for working with ActionManager IDs and strings
     */
    function stringIDToTypeID(stringID: string): number;
    function typeIDToStringID(typeID: number): string;
    function charIDToTypeID(charID: string): number;
    function typeIDToCharID(typeID: number): string;
    
    /**
     * Localization function (Safe - core ExtendScript)
     */
    function localize(text: string, ...args: any[]): string;

    /**
     * Type aliases for cleaner usage outside namespace
     * These allow using the short names while maintaining isolation
     */
    type ExtendScriptFile = ActionManagerGlobals.ExtendScriptFile;
    type ActionDescriptor = ActionManagerGlobals.ActionDescriptor;
    type ActionList = ActionManagerGlobals.ActionList;
    type ActionReference = ActionManagerGlobals.ActionReference;
}

export {};