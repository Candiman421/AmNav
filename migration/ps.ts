//ps/ps.ts
/**
 * Core Photoshop API Functions - Enhanced Framework Version
 * 
 * This file contains essential Photoshop functions that form the foundation
 * of the framework. Contains both ActionManager and DOM functions that are
 * fundamental to Photoshop scripting.
 * 
 * ENHANCED: Added getDOMLayerByName for parallel systems support
 * PRESERVED: All existing framework functionality unchanged
 */

/// <reference path="./ps-patch.d.ts"/>
/// <reference types="types-for-adobe/photoshop/2015.5"/>

import { objectFind, objectForEach } from "../shared/misc";
import { ActionScript } from "./ps-as";

// Global dependencies (existing)
declare let app: Application;
declare let JSON: any;

export let HostApi = "Photoshop 2015.5";

// ===================================================================
// CORE ACTIONMANAGER FUNCTIONS (EXISTING - PRESERVED)
// ===================================================================

/**
 * Executes an ActionManager action (set/create/modify operations)
 * @param eventID The action event ID
 * @param descriptor ActionDescriptor with parameters (optional)
 * @param displayDialogs Dialog display mode (optional)
 * @returns ActionDescriptor with results
 */
export function executeAction(eventID: number, descriptor?: ActionDescriptor, displayDialogs?: DialogModes): ActionDescriptor {
  return app.executeAction(eventID, descriptor, displayDialogs);
}

/**
 * Executes an ActionManager get operation
 * @param reference ActionReference pointing to the object to retrieve
 * @returns ActionDescriptor containing the object's properties
 */
export function executeActionGet(reference: ActionReference): ActionDescriptor {
  return app.executeActionGet(reference);
}

/**
 * Converts string ID to type ID
 */
export function stringIDToTypeID(stringID: string): number {
  return app.stringIDToTypeID(stringID);
}

/**
 * Converts character ID to type ID
 */
export function charIDToTypeID(charID: string): number {
  return app.charIDToTypeID(charID);
}

/**
 * Converts type ID to string ID
 */
export function typeIDToStringID(typeID: number): string {
  return app.typeIDToStringID(typeID);
}

/**
 * Converts type ID to character ID
 */
export function typeIDToCharID(typeID: number): string {
  return app.typeIDToCharID(typeID);
}

/**
 * Convenience aliases for type conversion functions (existing framework pattern)
 */
export function sTID(stringID: string): number {
  return app.stringIDToTypeID(stringID);
}

export function cTID(charID: string): number {
  return app.charIDToTypeID(charID);
}

export function tSID(typeID: number): string {
  return app.typeIDToStringID(typeID);
}

export function tCID(typeID: number): string {
  return app.typeIDToCharID(typeID);
}

// ===================================================================
// CORE DOM FUNCTIONS (EXISTING + ENHANCED)
// ===================================================================

/**
 * Call this instead of 'app.activeDocument' to prevent unrecoverable exceptions if there is no active document 
 */
export function getActiveDocument(): Document | null {
  if (app.documents && app.documents.length > 0) {
    return app.activeDocument;
  }
  return null;
}

/**
 * Gets a DOM layer by name safely - ENHANCED for parallel systems support
 * @param layerName Name of the layer to find
 * @returns Layer object or null if not found
 */
export function getDOMLayerByName(layerName: string): Layer | null {
  const doc = getActiveDocument();
  if (!doc) return null;
  
  try {
    return doc.layers.getByName(layerName);
  } catch {
    return null; // Layer not found
  }
}

/**
 * Save and get initialize data for document
 */
export function saveAndGetIntializeData(doc: Document, value?: any): (any | null) | void {
  let _sourceKey = "source";
  if (value) {
    doc.info[_sourceKey] = JSON.stringify(value);
  } else {
    let data = doc.info[_sourceKey];
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
}

/**
 * Gets the threshold value of the layer sent in.
 * @param doc Active Doc
 * @param layer Layer to read threshold of
 * @returns Threshold value or -1
 */
export function getLayerAdjustmentThreshold(doc: Document, layer: Layer): number {
  const versionWhereLegacyContentDataNotAvailable = 24.6;

  let versionStr = app.version.split("."); // e.g., 24.6.0
  let version = parseFloat(versionStr[0] + "." + versionStr[1]);

  if (version >= versionWhereLegacyContentDataNotAvailable) {
    let adjustment = ActionScript.GetLayerAdjustments();
    if (adjustment && adjustment.threshold !== undefined) {
      return adjustment.threshold;
    } else {
      return -1;
    }
  }

  let ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  let ad = executeActionGet(ref);

  let hasAdj = ad.hasKey(charIDToTypeID('Adjs'));
  if (hasAdj) {
    let list = ad.getList(charIDToTypeID('Adjs'));
    for (let i = 0; i < list.count; i++) {
      let t = list.getObjectType(i);
      if (stringIDToTypeID('thresholdClassEvent') === t) {
        let thresh = list.getObjectValue(i);
        if (thresh.hasKey(stringIDToTypeID("legacyContentData"))) {
          let data = thresh.getData(stringIDToTypeID("legacyContentData"));
          if (data && data.length >= 4) {
            return (data.charCodeAt(0) << 8) | data.charCodeAt(1);
          }
        }
      }
    }
  }
  return -1;
}

/**
 * Get layer adjustment saturation using ActionScript functionality
 */
export function getLayerAdjustmentSaturation(doc: Document, layer: Layer): number {
  return ActionScript.GetLayerAdjustments()?.saturation || -1;
}

/**
 * Get layer adjustment vibrance using ActionScript functionality
 */
export function getLayerAdjustmentVibrance(doc: Document, layer: Layer): number {
  return ActionScript.GetLayerAdjustments()?.vibrance || -1;
}