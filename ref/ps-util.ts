import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID, sTID } from "./ps";

// ===========================
// ===== General Library =====
// ===========================

export interface Point {
  x: number;
  y: number;
}

export interface PointColor extends Point {
  color?: number;
}

export interface MinMax {
  min: number;
  max: number;
}

export function checkTolerance(currentVal: number, toleranceVal: number, targetVal: number) {
  let n = Math.round(currentVal);
  try {
    let min = Math.round(targetVal - toleranceVal);
    let max = Math.round(targetVal + toleranceVal);
    if (n >= min && n <= max) {
      n = targetVal;
    }
  }
  catch (e) { }
  return n;
}

export function SamplePixelColors(doc: Document, points: Point[], asHex: boolean = false) {
  let result = [];
  let sampler = doc.colorSamplers.add([0, 0]);
  for (let i = 0; i < points.length; i++) {
    let color = undefined;
    try {
      // If the points are within the doc
      if (points[i].x >= 0 && points[i].x <= (doc.width as number) && points[i].y >= 0 && points[i].y <= (doc.height as number)) {
        sampler.move([points[i].x, points[i].y]);
        color = (asHex ? sampler.color.rgb.hexValue : parseInt('0x' + sampler.color.rgb.hexValue, 16));
      }
    }
    catch (e) { }
    result[i] = color;
  }
  sampler.remove();
  return result;
}

export function getColorAtPixel(doc: Document, point: Point): string | undefined {
  let sampler = doc.colorSamplers.add([0, 0]);
  let hexValue = undefined;
  if (point.x < 0 || point.y < 0 || point.x > (doc.width as number) || point.y > (doc.height as number)) return undefined;
  try {
    sampler.move([point.x, point.y]);
    hexValue = sampler.color.rgb.hexValue;
  } catch (e) { }
  finally {
    sampler.remove();
  }
  return hexValue;
}

// function AreEqual(list1: any[], list2: any[]) {
//   if (list1 === list2) return true;
//   if (!list1 || !list1.length || !list2 || !list2.length) return false;
//   if (list1.length !== list2.length) return false;

//   for (let i = 0; i < list1.length; i++) {
//     if (list1[i] !== list2[i]) return false;
//   }

//   return true;
// }

export function ArePixelColorsCorrect(pixels: { color?: number }[], colors: number[]) {
  if (!pixels || !pixels.length || !colors || !colors.length) return false;
  if (pixels.length !== colors.length) return false;

  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i].color !== colors[i]) return false;
  }

  return true;
}

function isArray(value: any): value is any[] {
  return Object.prototype.toString.call(value) === '[object Array]';
}

export function ArePixelColorsCorrectAsHex(pixels: { color?: string }[], colors: string[]) {
  if (!pixels || !pixels.length || !colors || !colors.length) return false;
  if (pixels.length !== colors.length) return false;

  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i].color !== colors[i]) return false;
  }

  return true;
}

export function ArePixelsOfIndiciesCorrect(pixels: { color?: number }[], colors: number[], indicies: { min: number, max: number }, func: any) {
  if (!pixels || !pixels.length || !colors || !colors.length) return false;
  if (pixels.length !== colors.length) return false;

  for (let i = indicies.min; i <= indicies.max; i++) {
    if (!func(pixels[i].color, colors[i])) {
      return false;
    }
  }
  return true;
}

// function ToDwordArray(data) {
//   let result = [];
//   let dword = 0x0;
//   for (let i = 0; i < data.length; i += 4) {
//     dword = (data.charCodeAt(i) << 24) +
//       (data.charCodeAt(i + 1) << 16) +
//       (data.charCodeAt(i + 2) << 8) +
//       data.charCodeAt(i + 3);
//     result[(i / 4)] = dword;
//   }
//   return result;
// }

function CollectColorSamples(doc: Document, samplers: { id: number }[]) {
  let result = [];
  for (let i = 0; i < samplers.length; i++) {
    let samplerIndex = samplers[i].id - 1; // index is 1-based (id:1 is colorSampler[0])
    let sampler = doc.colorSamplers[samplerIndex];
    result[i] = parseInt('0x' + sampler.color.rgb.hexValue, 16);
  }
  return result;
}

export function AreSamplesWithinRange(samples: number[], ranges: MinMax[]) {
  if (!samples || !samples.length || !ranges || !ranges.length) return false;
  if (samples.length !== ranges.length) return false;

  let rMask = 0xFF0000;
  let gMask = 0x00FF00;
  let bMask = 0x0000FF;
  for (let i = 0; i < samples.length; i++) {
    let sample = samples[i];
    let redPart = sample & rMask;
    let greenPart = sample & gMask;
    let bluePart = sample & bMask;
    if (redPart < (ranges[i].min & rMask) || redPart > (ranges[i].max & rMask)) {
      return false;
    }
    if (greenPart < (ranges[i].min & gMask) || greenPart > (ranges[i].max & gMask)) {
      return false;
    }
    if (bluePart < (ranges[i].min & bMask) || bluePart > (ranges[i].max & bMask)) {
      return false;
    }
  }

  return true;
}

export function ColorWithinRange(sample: number, range: MinMax): boolean {
  let rMask = 0xFF0000;
  let gMask = 0x00FF00;
  let bMask = 0x0000FF;
  let redPart = sample & rMask;
  let greenPart = sample & gMask;
  let bluePart = sample & bMask;

  return (
    (redPart >= (range.min & rMask) && redPart <= (range.max & rMask)) &&
    (greenPart >= (range.min & gMask) && greenPart <= (range.max & gMask)) &&
    (bluePart >= (range.min & bMask) && bluePart <= (range.max & bMask))
  );
}

export function DoesSwatchExist(swatchName: string) {
  swatchName = swatchName.toLowerCase();
  let ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  let desc = executeActionGet(ref);
  let List = desc.getList(stringIDToTypeID('presetManager'));
  let list: ActionList = List.getObjectValue(1).getList(charIDToTypeID('Nm  '));

  // loop through the color names looking for swatchName
  for (let i = 0; i < list.count; i++) {
    if (list.getString(i).toLowerCase() === swatchName) {
      return true;
    }
  }
  return false;
}

function RestoreSwatch() {
  throw "Not Implemented";
  // TODO: Not implemented
}

export function deleteStyle(name: string) {
  try {
    let ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    let appDesc = executeActionGet(ref);

    let pmList = appDesc.getList(sTID("presetManager"));
    let nameList = pmList.getObjectValue(3).getList(charIDToTypeID('Nm  '));

    for (let index = 0; index < nameList.count; index++) {
      if (nameList.getString(index).toLowerCase() == name.toLowerCase()) {
        index = index + 1;
        let idDlt = charIDToTypeID("Dlt ");
        let desc2 = new ActionDescriptor();
        let idnull = charIDToTypeID("null");
        let list1 = new ActionList();
        let ref2 = new ActionReference();
        let idtoolPreset = charIDToTypeID("Styl");
        ref2.putIndex(idtoolPreset, index);
        list1.putReference(ref2);
        desc2.putList(idnull, list1);
        executeAction(idDlt, desc2, DialogModes.NO);
      }
    }
  }
  catch (e) { }
}

// function DeleteSwatch( name ){
//   let ref = new ActionReference();
//   ref.putEnumerated( charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
//   let desc = executeActionGet(ref);// get the app descriptor
//   let presetsList = desc.getList(stringIDToTypeID('presetManager'));// the presets list
//   let clrsDesc = presetsList.getObjectValue(1); // colors is the second key
//   let nameList = clrsDesc.getList(charIDToTypeID("Nm  "));

//   let indexToDelete = -1;

//   for (let i = 0; i <  nameList.count; i++) 
//   {
//       if(nameList.getString(i).toLowerCase() == name.toLowerCase())
//       {
//         indexToDelete = i + 1;
//       }
//   }
//   $.writeln(indexToDelete);
//   if(indexToDelete != -1)
//   {
//       let idDlt = charIDToTypeID( "Dlt " );
//       let ad1 = new ActionDescriptor();
//       let idnull = charIDToTypeID( "null" );
//       let ref5 = new ActionReference();
//       let idClrs = charIDToTypeID( "Clrs" );
//       ref5.putIndex( idClrs, indexToDelete );
//       ad1.putReference( idnull, ref5 );
//       executeAction( idDlt, ad1, DialogModes.NO );
//   }
// }
export function DeleteSwatch(name: string) {
  let ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  let desc = executeActionGet(ref);// get the app descriptor
  let presetsList = desc.getList(stringIDToTypeID('presetManager'));// the presets list
  let clrsDesc = presetsList.getObjectValue(1); // colors is the second key
  let nameList = clrsDesc.getList(charIDToTypeID("Nm  "));

  let indexToDelete = -1;

  // walk backwards since we delete in the loop
  for (let i = nameList.count - 1; i >= 0; i--) {
    if (nameList.getString(i).toLowerCase() == name.toLowerCase()) {
      indexToDelete = i + 1;
      let idDlt = charIDToTypeID("Dlt ");
      let ad1 = new ActionDescriptor();
      let idnull = charIDToTypeID("null");
      let ref5 = new ActionReference();
      let idClrs = charIDToTypeID("Clrs");
      ref5.putIndex(idClrs, indexToDelete);
      ad1.putReference(idnull, ref5);
      executeAction(idDlt, ad1, DialogModes.NO);
    }
  }
}


function RestoreBrush() {
  throw "Not Implemented";
  // TODO: Not implemented
}

// // Old version of DeleteBrush, no longer works
// /** Deletes the brush by finding its index and deleting that preset */
// function DeleteBrush(name){
//   try{
//       let ref = new ActionReference();
//       ref.putEnumerated( charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
//       let appDesc = executeActionGet(ref);

//       let pmList = appDesc.getList(stringIDToTypeID("presetManager"));
//       let nameList = pmList.getObjectValue(0).getList(charIDToTypeID('Nm  '));

//       for (let index = 0; index < nameList.count; index++){
//           if (nameList.getString(index).toLowerCase() == name.toLowerCase()){
//               index = index + 2;
//               let idDlt = charIDToTypeID( "Dlt " );
//               let desc2 = new ActionDescriptor();
//               let idnull = charIDToTypeID( "null" );
//               let list1 = new ActionList();
//               let ref2 = new ActionReference();
//               let idtoolPreset = stringIDToTypeID( "brush" );
//               // let idtoolPreset = stringIDToTypeID( "toolPreset" );
//               ref2.putIndex( idtoolPreset, index );
//               list1.putReference( ref2 );
//               desc2.putList( idnull, list1 );
//               executeAction( idDlt, desc2, DialogModes.NO );
//               }
//           }
//   }
//   catch(e){}
// }

/** Deletes the brush by selecting the brush, then deleting the selected brush */
function DeleteBrush(brushName: string) {
  try {
    let ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    let appDesc = executeActionGet(ref);

    let pmList = appDesc.getList(stringIDToTypeID("presetManager"));
    let nameList = pmList.getObjectValue(0).getList(charIDToTypeID('Nm  '));

    for (let index = 0; index < nameList.count; index++) {
      if (nameList.getString(index).toLowerCase() == brushName.toLowerCase()) {
        let name = nameList.getString(index); // get the name, with casing preserved

        // select the brush to delete
        let idslct = charIDToTypeID("slct");
        let desc8 = new ActionDescriptor();
        let idnull = charIDToTypeID("null");
        let ref4 = new ActionReference();
        let idBrsh = charIDToTypeID("Brsh");
        ref4.putName(idBrsh, name);
        desc8.putReference(idnull, ref4);
        executeAction(idslct, desc8, DialogModes.NO);

        let idDlt = charIDToTypeID("Dlt ");
        let desc7 = new ActionDescriptor();
        idnull = charIDToTypeID("null");
        let ref3 = new ActionReference();
        idBrsh = charIDToTypeID("Brsh");
        let idOrdn = charIDToTypeID("Ordn");
        let idTrgt = charIDToTypeID("Trgt");
        ref3.putEnumerated(idBrsh, idOrdn, idTrgt);
        desc7.putReference(idnull, ref3);
        executeAction(idDlt, desc7, DialogModes.NO);

        break;
      }
    }
  } catch (e) { }
}

function SetCurrentBrushFeatures(Diameter: number, Hardness: number, Spacing: number) {
  try {
    let ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    let appDesc = executeActionGet(ref);
    let toolDesc = appDesc.getObjectValue(stringIDToTypeID('currentToolOptions'));
    let brushDesc = toolDesc.getObjectValue(stringIDToTypeID('brush'));
    if (Diameter == undefined) Diameter = brushDesc.getDouble(stringIDToTypeID('diameter'));
    if (Hardness == undefined) Hardness = brushDesc.getDouble(stringIDToTypeID('hardness'));
    if (Spacing == undefined) Spacing = brushDesc.getDouble(stringIDToTypeID('spacing'));
    let desc = new ActionDescriptor();
    ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Brsh"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    desc.putReference(charIDToTypeID("null"), ref);
    let desc1 = new ActionDescriptor();
    desc1.putDouble(stringIDToTypeID('diameter'), Diameter);
    desc1.putDouble(stringIDToTypeID('hardness'), Hardness);
    desc1.putDouble(stringIDToTypeID('spacing'), Spacing);
    desc.putObject(stringIDToTypeID('to'), charIDToTypeID("Brsh"), desc1);
    executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
  }
  catch (e) { }
}

export function ResetStylesMenu() {
  let dialogMode = DialogModes.NO;
  let desc1 = new ActionDescriptor();
  let ref1 = new ActionReference();
  ref1.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Styl'));
  ref1.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  desc1.putReference(charIDToTypeID('null'), ref1);
  executeAction(charIDToTypeID('Rset'), desc1, dialogMode);
}

export function findIt(enumeratedType: string, it: string) {
  let r = new ActionReference();
  r.putEnumerated(stringIDToTypeID(enumeratedType), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  let d = executeActionGet(r);


}

function diveIntoType(d: ActionDescriptor) {
  for (let i = 0; i < d.count; i++) {
    let t = d.getType(i);
    switch (t) {
      case DescValueType.ALIASTYPE:
        // Handle ALIASTYPE
        break;
      case DescValueType.BOOLEANTYPE:
        return d.getBoolean(i);
        break;
      case DescValueType.CLASSTYPE:
        // Handle CLASSTYPE
        break;
      case DescValueType.DOUBLETYPE:
        return d.getDouble(i);
        break;
      case DescValueType.ENUMERATEDTYPE:
        // Handle ENUMERATEDTYPE
        break;
      case DescValueType.INTEGERTYPE:
        return d.getInteger(i);
        break;
      case DescValueType.LISTTYPE:
        // Handle LISTTYPE
        break;
      case DescValueType.OBJECTTYPE:
        return d.getObjectValue(i);
        break;
      case DescValueType.RAWTYPE:
        // Handle RAWTYPE
        break;
      case DescValueType.REFERENCETYPE:
        // Handle REFERENCETYPE
        break;
      case DescValueType.STRINGTYPE:
        return d.getString(i);
        break;
      default:

        break;
    }
  }
}

