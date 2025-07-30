/// <reference path="./ps-patch.d.ts"/>
/// <reference types="types-for-adobe/photoshop/2015.5"/>

import { objectFind, objectForEach } from "../shared/misc";
import { ActionScript } from "./ps-as";

// https://www.adobe.com/devnet/photoshop/scripting.html
declare let app: Application;
declare let JSON: any;

export let HostApi = "Photoshop 2015.5";

// Look here for help with action scripting: https://community.adobe.com/t5/photoshop/action-manager-scripting/td-p/11160326
export function executeAction(eventID: number, descriptor?: ActionDescriptor, displayDialogs?: DialogModes): ActionDescriptor {
  return app.executeAction(eventID, descriptor, displayDialogs);
}

export function executeActionGet(reference: ActionReference): ActionDescriptor {
  return app.executeActionGet(reference);
}


export function stringIDToTypeID(stringID: string): number {
  return app.stringIDToTypeID(stringID);
};
export function charIDToTypeID(charID: string): number {
  return app.charIDToTypeID(charID);
}
export function typeIDToStringID(typeID: number): string {
  return app.typeIDToStringID(typeID);
};
export function typeIDToCharID(typeID: number): string {
  return app.typeIDToCharID(typeID);
}
export function sTID(stringID: string): number {
  return app.stringIDToTypeID(stringID);
};
export function cTID(charID: string): number {
  return app.charIDToTypeID(charID);
}
export function tSID(typeID: number): string {
  return app.typeIDToStringID(typeID);
};
export function tCID(typeID: number): string {
  return app.typeIDToCharID(typeID);
}

/**
 * Call this instead of 'app.activeDocument' to prevent unrecoverable exceptions if there is no active document 
 */
export function getActiveDocument(): Document | null {
  if (app.documents && app.documents.length > 0) {
    return app.activeDocument;
  }
  return null;
}

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
  let version = parseFloat(versionStr[0] + "." + versionStr[1]); // e.g., 24.6

  let activeLayer = doc.activeLayer;
  let threshold = -1;
  try {
    doc.activeLayer = layer;
    if (version >= versionWhereLegacyContentDataNotAvailable) {
      let r = new ActionReference();
      r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
      threshold = executeActionGet(r).getList(stringIDToTypeID("adjustment")).getObjectValue(0).getInteger(stringIDToTypeID("level"));
    } else {
      let result = ActionScript.GetLayerAdjustments();
      threshold = (result && result.threshold) ? result.threshold : -1;
    }
  } catch (e) { }
  finally {
    doc.activeLayer = activeLayer;
  }
  return threshold;
}

/**
 * Gets the contrast value of the layer sent in.
 * @param doc Active Doc
 * @param layer Layer to read contrast of
 * @returns contrast value or null
 */
export function getLayerAdjustmentContrast(doc: Document, layer: Layer): number {
  return getLayerAdjustment(doc, layer, "contrast");
}

/**
 * Gets the brightness value of the layer sent in.
 * @param doc Active Doc
 * @param layer Layer to read brightness of
 * @returns brightness value or null
 */
export function getLayerAdjustmentBrightness(doc: Document, layer: Layer): number {
  return getLayerAdjustment(doc, layer, "brightness");
}

/**
 * Gets the vibrance value of the layer sent in.
 * @param doc Active Doc
 * @param layer Layer to read vibrance of
 * @returns Vibrance value or null
 */
export function getLayerAdjustmentVibrance(doc: Document, layer: Layer): number {
  return getLayerAdjustment(doc, layer, "vibrance");
}

/**
 * Gets the saturation value of the layer sent in.
 * @param doc Active Doc
 * @param layer Layer to read saturation of
 * @returns Saturation value or null
 */
export function getLayerAdjustmentSaturation(doc: Document, layer: Layer): number {
  return getLayerAdjustment(doc, layer, "saturation");
}

function getLayerAdjustment(doc: Document, layer: Layer, adjustment: string): any | null {
  const versionWhereLegacyContentDataNotAvailable = 24.6;

  let versionStr = app.version.split("."); // e.g., 24.6.0
  let version = parseFloat(versionStr[0] + "." + versionStr[1]); // e.g., 24.6

  let activeLayer = doc.activeLayer;
  let result = null;
  try {
    doc.activeLayer = layer;
    if (version >= versionWhereLegacyContentDataNotAvailable) {
      let r = new ActionReference();
      r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
      result = executeActionGet(r).getList(stringIDToTypeID("adjustment")).getObjectValue(0).getInteger(stringIDToTypeID(adjustment));
    } else {
      let adjs = ActionScript.GetLayerAdjustments();
      result = (adjs && (adjs as any)[adjustment]) ? (adjs as any)[adjustment] : null;
    }
  } catch (e) { }
  finally {
    doc.activeLayer = activeLayer;
  }
  return result;
}

/*
  ActionScript tutorial:
  
  To learn what shows up for certain actionscript items and to write your own getter code, use the following steps:

function some() {
  let r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  let d = executeActionGet(r);

  let str = '';
  for (let i = 0; i < d.count; i++) { 
      str += typeIDToStringID(d.getKey(i)) + ': ' + d.getType(d.getKey(i)) + '\n' ;
  }
  $.writeln(str);

  // As a one liner
    for (var i = 0; i < d.count; i++) { $.writeln(app.typeIDToStringID(d.getKey(i)) + ': ' + d.getType(d.getKey(i))); }
}
some();

Which would print out something like this: 
name: DescValueType.STRINGTYPE
color: DescValueType.ENUMERATEDTYPE
visible: DescValueType.BOOLEANTYPE
mode: DescValueType.ENUMERATEDTYPE
opacity: DescValueType.INTEGERTYPE
layerID: DescValueType.INTEGERTYPE
itemIndex: DescValueType.INTEGERTYPE
count: DescValueType.INTEGERTYPE
preserveTransparency: DescValueType.BOOLEANTYPE
layerFXVisible: DescValueType.BOOLEANTYPE
globalAngle: DescValueType.INTEGERTYPE
background: DescValueType.BOOLEANTYPE
layerSection: DescValueType.ENUMERATEDTYPE
layerLocking: DescValueType.OBJECTTYPE
group: DescValueType.BOOLEANTYPE
targetChannels: DescValueType.LISTTYPE
visibleChannels: DescValueType.LISTTYPE
channelRestrictions: DescValueType.LISTTYPE
fillOpacity: DescValueType.INTEGERTYPE
hasUserMask: DescValueType.BOOLEANTYPE
hasVectorMask: DescValueType.BOOLEANTYPE
proportionalScaling: DescValueType.BOOLEANTYPE
layerKind: DescValueType.INTEGERTYPE
hasFilterMask: DescValueType.BOOLEANTYPE
userMaskDensity: DescValueType.INTEGERTYPE
userMaskFeather: DescValueType.DOUBLETYPE
vectorMaskDensity: DescValueType.INTEGERTYPE
vectorMaskFeather: DescValueType.DOUBLETYPE
filterMaskDensity: DescValueType.INTEGERTYPE
filterMaskFeather: DescValueType.DOUBLETYPE
adjustment: DescValueType.LISTTYPE
bounds: DescValueType.OBJECTTYPE
boundsNoEffects: DescValueType.OBJECTTYPE
boundsNoMask: DescValueType.OBJECTTYPE
pathBounds: DescValueType.OBJECTTYPE
useAlignedRendering: DescValueType.BOOLEANTYPE
generatorSettings: DescValueType.OBJECTTYPE
AGMStrokeStyleInfo: DescValueType.OBJECTTYPE
keyOriginType: DescValueType.LISTTYPE
fillEnabled: DescValueType.BOOLEANTYPE
animationProtection: DescValueType.OBJECTTYPE
artboardEnabled: DescValueType.BOOLEANTYPE
vectorMaskEnabled: DescValueType.BOOLEANTYPE
vectorMaskEmpty: DescValueType.BOOLEANTYPE
vectorMaskLinked: DescValueType.BOOLEANTYPE
textWarningLevel: DescValueType.INTEGERTYPE
parentLayerID: DescValueType.INTEGERTYPE

Then you can drill down. Let's go into AGMStrokeStyleInfo like this:

function some() {
  let r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  let d = executeActionGet(r).getObjectValue(stringIDToTypeID("AGMStrokeStyleInfo"));

  let str = '';
  for (let i = 0; i < d.count; i++) { 
      str += typeIDToStringID(d.getKey(i)) + ': ' + d.getType(d.getKey(i)) + '\n' ;
  }
  $.writeln(str);
}
some();

Which gives the following:

strokeStyleVersion: DescValueType.INTEGERTYPE
strokeEnabled: DescValueType.BOOLEANTYPE
fillEnabled: DescValueType.BOOLEANTYPE
strokeStyleLineWidth: DescValueType.UNITDOUBLE
strokeStyleLineDashOffset: DescValueType.UNITDOUBLE
strokeStyleMiterLimit: DescValueType.DOUBLETYPE
strokeStyleLineCapType: DescValueType.ENUMERATEDTYPE
strokeStyleLineJoinType: DescValueType.ENUMERATEDTYPE
strokeStyleLineAlignment: DescValueType.ENUMERATEDTYPE
strokeStyleScaleLock: DescValueType.BOOLEANTYPE
strokeStyleStrokeAdjust: DescValueType.BOOLEANTYPE
strokeStyleLineDashSet: DescValueType.LISTTYPE
strokeStyleBlendMode: DescValueType.ENUMERATEDTYPE
strokeStyleOpacity: DescValueType.UNITDOUBLE
strokeStyleContent: DescValueType.OBJECTTYPE
strokeStyleResolution: DescValueType.DOUBLETYPE

Let's look into strokeStyleContent:

function some() {
  let r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  let d = executeActionGet(r).getObjectValue(stringIDToTypeID("AGMStrokeStyleInfo")).getObjectValue(stringIDToTypeID("strokeStyleContent"));

  let str = '';
  for (let i = 0; i < d.count; i++) { 
      str += typeIDToStringID(d.getKey(i)) + ': ' + d.getType(d.getKey(i)) + '\n' ;
  }
  $.writeln(str);
}
some();

Which gives:

color: DescValueType.OBJECTTYPE

Then we can look at color:

function some() {
    let r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
    let d = executeActionGet(r).getObjectValue(stringIDToTypeID("AGMStrokeStyleInfo")).getObjectValue(stringIDToTypeID("strokeStyleContent")).getObjectValue(stringIDToTypeID("color"));

    let str = '';
    for (let i = 0; i < d.count; i++) { 
        str += typeIDToStringID(d.getKey(i)) + ': ' + d.getType(d.getKey(i)) + '\n' ;
    }
    $.writeln(str);
}
some();

Which gives:

----2023----
redFloat: DescValueType.DOUBLETYPE
greenFloat: DescValueType.DOUBLETYPE
blueFloat: DescValueType.DOUBLETYPE

----2022----
red: DescValueType.DOUBLETYPE
grain: DescValueType.DOUBLETYPE
blue: DescValueType.DOUBLETYPE

*/