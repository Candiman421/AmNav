//ActionManager/globals.d.ts
/**
 * ExtendScript global declarations
 * Only included in ExtendScript/Photoshop environment
 */

declare global {
    var $: {
        writeln(message: string): void;
    };

    class ExtendScriptFile {
        constructor(path?: string);
        readonly absoluteURI: string;
        readonly name: string;
        readonly path: string;
        exists: boolean;
        open(mode: string): boolean;
        close(): boolean;
        read(): string;
        write(text: string): boolean;
    }

    class Folder {
        constructor(path?: string);
        readonly absoluteURI: string;
        readonly name: string;
        readonly path: string;
        exists: boolean;
        create(): boolean;
    }

    class ActionReference {
        constructor();
        putEnumerated(classID: number, typeID: number, enumID: number): void;
        putIndex(classID: number, index: number): void;
        putProperty(classID: number, propertyID: number): void;
        putName(classID: number, name: string): void;
        putIdentifier(classID: number, identifier: number): void;
        putOffset(classID: number, offset: number): void;
    }

    class ActionDescriptor {
        constructor();
        count: number;
        hasKey(key: number): boolean;
        getObjectValue(key: number): ActionDescriptor;
        getList(key: number): ActionList;
        getString(key: number): string;
        getDouble(key: number): number;
        getInteger(key: number): number;
        getBoolean(key: number): boolean;
        getEnumerationValue(key: number): number;
        getEnumerationType(key: number): number;
        getReference(key: number): ActionReference;
        getClass(key: number): number;
        getPath(key: number): ExtendScriptFile;
        getData(key: number): string;
        getType(key: number): number;
        getUnitDoubleType(key: number): number;
        getUnitDoubleValue(key: number): number;
        getLargeInteger(key: number): number;
        getObjectType(key: number): number;
    }

    class ActionList {
        constructor();
        count: number;
        getObjectValue(index: number): ActionDescriptor;
        getString(index: number): string;
        getDouble(index: number): number;
        getInteger(index: number): number;
        getBoolean(index: number): boolean;
        getEnumerationValue(index: number): number;
        getReference(index: number): ActionReference;
        getClass(index: number): number;
        getList(index: number): ActionList;
        getType(index: number): number;
        getData(index: number): string;
        getPath(index: number): ExtendScriptFile;
        getUnitDoubleType(index: number): number;
        getUnitDoubleValue(index: number): number;
        getLargeInteger(index: number): number;
        getObjectType(index: number): number;
        getEnumerationType(index: number): number;
    }

    function executeActionGet(reference: ActionReference): ActionDescriptor;
    function executeAction(eventID: number, descriptor?: ActionDescriptor, dialogOptions?: number): ActionDescriptor;
    function stringIDToTypeID(stringID: string): number;
    function typeIDToStringID(typeID: number): string;
    function charIDToTypeID(charID: string): number;
    function typeIDToCharID(typeID: number): string;
    function localize(text: string, ...args: any[]): string;
}

export {};