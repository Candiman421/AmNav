import { executeAction, executeActionGet, stringIDToTypeID, charIDToTypeID } from "./ps";
import { ToDwordArray } from "../shared/misc";

export interface LayerAdjustments {
  threshold?: number;
  vibrance?: number;
  saturation?: number;
}


export class ActionScript {
  static GetLayerAdjustments(): LayerAdjustments | undefined {
    // <ActionDescriptor count="44">
    //     <String symname="Name" sym="Nm  " string="Vibrance 1"></String>
    //     ...
    //     <List symname="Adjustment" sym="Adjs" count="1">
    //         <Object objectTypeString="vibrance" objectType="vibrance" count="1">
    //             <Raw symname="legacyContentData" sym="legacyContentData">00000010 00000001 00000000 00006E75
    //                 6C6C0000 00020000 00087669 6272616E
    //                 63656C6F 6E670000 00320000 00005374
    //                 72746C6F 6E670000 0032</Raw>
    // vibrance adjustment can be found in HIWORD(legacyContentData[10])
    // saturation adjustment can be found in HIWORD(legacyContentData[14])
    //              ...
    //         <Object objectTypeString="Threshold" objectType="Thrs" count="1">
    //             <Raw symname="legacyContentData" sym="legacyContentData">00A00000</Raw>
    // threshold ajdustment can be found in HIWORD(legacyContentData[0])

    let hasAdjustments = false;
    let result: LayerAdjustments = {};
    let ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    let ad = executeActionGet(ref);

    let hasAdj = ad.hasKey(charIDToTypeID('Adjs'));
    if (hasAdj) {
      let list = ad.getList(charIDToTypeID('Adjs'));
      for (let i = 0; i < list.count; i++) {
        let t = list.getObjectType(i);
        if (stringIDToTypeID('vibrance') === t) {
          let thresh = list.getObjectValue(i);
          if (thresh.hasKey(stringIDToTypeID("legacyContentData"))) {
            let data = ToDwordArray(thresh.getData(stringIDToTypeID("legacyContentData")));
            result.vibrance = (data[10] >> 16);
            result.saturation = (data[14] >> 16);
            hasAdjustments = true;
            // break;
          }
        } else if (charIDToTypeID('Thrs') === t) {
          let thresh = list.getObjectValue(i);
          if (thresh.hasKey(stringIDToTypeID("legacyContentData"))) {
            let data = ToDwordArray(thresh.getData(stringIDToTypeID("legacyContentData")));
            result.threshold = (data[0] >> 16);
            hasAdjustments = true;
            // break;
          }
        }

      }
    }

    if (hasAdjustments) {
      return result;
    } else {
      return undefined;
    }
  }

  static GetSmartLayerAdjustments(): LayerAdjustments | undefined {
    let hasAdjustments = false;
    let result: LayerAdjustments = {};

    // 'JDWeddingRings' -> smartObject -> filterFX(list) -> filterFX(obj) -> 'Filter'/'Vibrance' -> 'vibrance' & 'start'
    let ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    let ad = executeActionGet(ref);

    let hasSmart = ad.hasKey(stringIDToTypeID('smartObject'));
    let smart;
    if (hasSmart) {
      smart = ad.getObjectValue(stringIDToTypeID('smartObject'));

      if (smart.hasKey(stringIDToTypeID('filterFX'))) {
        let fxList = smart.getList(stringIDToTypeID('filterFX'));
        for (let i = 0; i < fxList.count; i++) {
          let itemType = fxList.getType(i);
          if (itemType == DescValueType.OBJECTTYPE) {
            let x = fxList.getObjectType(i);
            let fxObj = fxList.getObjectValue(i);
            if (fxObj.hasKey(charIDToTypeID('Fltr'))) {
              let filterObjType = fxObj.getObjectType(charIDToTypeID('Fltr'));
              if (filterObjType === stringIDToTypeID('vibrance')) {
                let filterObj = fxObj.getObjectValue(charIDToTypeID('Fltr'));
                result.vibrance = filterObj.getInteger(stringIDToTypeID('vibrance'));
                result.saturation = filterObj.getInteger(charIDToTypeID('Strt'));
                hasAdjustments = true;
                // break;
              } else if (charIDToTypeID('Thrs') === filterObjType) {
                let filterObj = fxObj.getObjectValue(charIDToTypeID("Fltr"));
                // verify that the correct levels preset is used
                if (filterObj.hasKey(charIDToTypeID("Lvl "))) {
                  result.threshold = filterObj.getInteger(charIDToTypeID("Lvl "));
                  hasAdjustments = true;
                  // break;
                }
              }
            }
          }
        }
      }
    }

    if (hasAdjustments) {
      return result;
    } else {
      return undefined;
    }
  }
  static ResetStyles(): void {
    let idRset = charIDToTypeID("Rset");
    let desc32 = new ActionDescriptor();
    let idnull = charIDToTypeID("null");
    let ref7 = new ActionReference();
    let idPrpr = charIDToTypeID("Prpr");
    let idStyl = charIDToTypeID("Styl");
    ref7.putProperty(idPrpr, idStyl);
    let idcapp = charIDToTypeID("capp");
    let idOrdn = charIDToTypeID("Ordn");
    let idTrgt = charIDToTypeID("Trgt");
    ref7.putEnumerated(idcapp, idOrdn, idTrgt);
    desc32.putReference(idnull, ref7);
    executeAction(idRset, desc32, DialogModes.NO);
  }
}
