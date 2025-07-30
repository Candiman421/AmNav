import { IAnswers, IItemInstance, IMagic, ItemOd4Base } from "./ItemOd4Base";
import { getActiveDocument } from "../ps";
import { ActionDescriptorNavigator } from "../action-manager/ActionDescriptorNavigator";
import { stringsAreSame, withinToleranceRange, withinToleranceMaxMin } from "../../shared/misc";

declare var app: Application;
declare let VirtualPath: string;

export class Item4_3_10 extends ItemOd4Base {
  public magic = {};

  public scorePaths = [{
    title: "Default path",
    criteria: [
      {
        desc: "Warp settings",
        check(answers: IAnswers, magic: IMagic): boolean {
          return (stringsAreSame(answers.warpStyle, magic.warpStyle)
            && withinToleranceRange(answers.warpValue, magic.tolerance, magic.warpValue));
        }
      },
      {
        desc: "Font settings",
        check(answers: IAnswers, magic: IMagic): boolean {
          return (stringsAreSame(answers.fontName, magic.fontName)
            && withinToleranceRange(answers.fontSize, magic.tolerance, magic.fontSize)
            && stringsAreSame(answers.fontCaps, magic.fontCaps)
            && withinToleranceRange(answers.horizontalScale, magic.tolerance, magic.horizontalScale)
            && withinToleranceRange(answers.verticalScale, magic.tolerance, magic.verticalScale));
        }
      },
      {
        desc: "Fill color is white",
        check(answers: IAnswers, magic: IMagic): boolean {
          return (answers.fillColorRed === magic.fillColorRed
            && answers.fillColorGreen === magic.fillColorGreen
            && answers.fillColorBlue === magic.fillColorBlue);
        }
      },
      {
        desc: "Title is properly placed over subtitle",
        check(answers: IAnswers, magic: IMagic): boolean {
          return answers.titleIsAboveSubtitle
            && withinToleranceMaxMin(answers.titleBoundsBottom, magic.titleBottomMax, magic.titleBottomMin);
        }
      },
    ]
  }];

  GetAnswers(item: IItemInstance): IAnswers {
    let answers: IAnswers = {
      warpStyle: "",
      warpValue: "",
      fontName: "",
      fontSize: -1,
      fontCaps: "",
      horizontalScale: -1,
      verticalScale: -1,
      fillColorRed: -1,
      fillColorGreen: -1,
      fillColorBlue: -1,
      titleIsAboveSubtitle: false,
      titleBoundsBottom: -1,
      titlesHaveCorrectVerticalSeparation: false
    };
    let { magic } = item;

    try {
      let doc = getActiveDocument();
      if (doc) {
        const titleLayer = ActionDescriptorNavigator.forLayerByName(magic.companyPro);
        const titleTextObj = titleLayer.getObject('textKey');
        const warpObj = titleTextObj.getObject('warp');
        const textStyleRangeList = titleTextObj.getList('textStyleRange');

        const textStyleRangeObj = titleTextObj
                           .getList('textStyleRange')
                           .getFirstWhere(range => {
                            
                           })
        // const textStyleRangeObj = textStyleRangeList.getObject
        //   'textStyle',    //Navigate into TextStyle object
        //   'fontName',     // Check fontName property
        //   magic.fontName  // Search for font name, ie "Arial"
        // )

        const textStyleObj = textStyleRangeObj.object('textStyle');
        const colorObj = textStyleObj.object('color');

        answers.warpStyle = warpObj.getEnumeratedString('warpStyle');
        answers.warpValue = warpObj.getDouble('warpValue');

        answers.fontName = textStyleObj.getStringValue('fontName');
        answers.fontSize = textStyleObj.getUnitDoubleValue('impliedFontSize');
        answers.fontCaps = textStyleObj.getEnumeratedString('fontCaps');
        answers.horizontalScale = textStyleObj.getDoubleValue('horizontalScale');
        answers.verticalScale = textStyleObj.getDoubleValue('verticalScale');

        answers.fillColorRed = colorObj.getDoubleValue('red');
        answers.fillColorGreen = colorObj.getDoubleValue('green');
        answers.fillColorBlue = colorObj.getDoubleValue('blue');

        const subtitleLayer = ActionDescriptorNavigator.forLayerByName(magic.lightHouseTours);
        const titleLayerBounds = titleLayer.getBounds();
        const subtitleLayerBounds = subtitleLayer.getBounds();
      
        answers.titleIsAboveSubtitle = titleLayerBounds.top < subtitleLayerBounds.top;
        answers.titleBoundsBottom = titleLayerBounds.bottom;
      }
    } catch (e) {

    } finally {
      return answers;
    }
  }
}