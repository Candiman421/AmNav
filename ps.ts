/**
 * Minimal Photoshop ActionManager API for development
 * Re-exports global functions as named exports for import compatibility
 * Types are already defined in types.ts
 */

import type { ActionDescriptor, ActionReference } from './ActionManager/types';

// Re-export global functions as named exports for import compatibility
export function executeActionGet(reference: ActionReference): ActionDescriptor {
    // Development stub - in real ExtendScript this calls the actual Photoshop API
    throw new Error('executeActionGet: Runtime implementation required');
}

export function stringIDToTypeID(stringID: string): number {
    // Development stub - in real ExtendScript this converts string to type ID
    return stringID.length; // Simple hash for development
}

export function charIDToTypeID(charID: string): number {
    // Development stub - in real ExtendScript this converts 4-char string to type ID
    return charID.charCodeAt(0) + charID.charCodeAt(1) + charID.charCodeAt(2) + charID.charCodeAt(3);
}

export function typeIDToStringID(typeID: number): string {
    // Development stub - in real ExtendScript this converts type ID back to string
    return `type_${typeID}`;
}

export function typeIDToCharID(typeID: number): string {
    // Development stub - in real ExtendScript this converts type ID to 4-char string
    return String.fromCharCode(typeID & 0xFF, (typeID >> 8) & 0xFF, (typeID >> 16) & 0xFF, (typeID >> 24) & 0xFF);
}