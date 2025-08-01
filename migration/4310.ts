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

        // Find first textStyle with matching fontName
        const matchingTextStyles = titleTextObj
          .getList('textStyleRange')
          .selectWhere(
            range => {
              const textStyle = range.getObject('textStyle');
              const color = textStyle.getObject('color');

              return {
                fontName: textStyle.getString('fontName'),
                fontSize: textStyle.getUnitDouble('impliedFontSize'),
                fontCaps: textStyle.getEnumerationString('fontCaps'),
                horizontalScale: textStyle.getDouble('horizontalScale'),
                verticalScale: textStyle.getDouble('verticalScale'),
                fillColorRed: color.getDouble('red'),
                fillColorGreen: color.getDouble('green'),
                fillColorBlue: color.getDouble('blue')
              };
            },
            style => style.fontName === magic.fontName && style.fontName !== SENTINELS.string
          )
          .toResultArray();

        // If match found, use its values
        if (matchingTextStyles.length > 0) {
          const textStyleMatch = matchingTextStyles[0];

          answers.fontName = textStyleMatch.fontName;
          answers.fontSize = textStyleMatch.fontSize;
          answers.fontCaps = textStyleMatch.fontCaps;
          answers.horizontalScale = textStyleMatch.horizontalScale;
          answers.verticalScale = textStyleMatch.verticalScale;
          answers.fillColorRed = textStyleMatch.fillColorRed;
          answers.fillColorGreen = textStyleMatch.fillColorGreen;
          answers.fillColorBlue = textStyleMatch.fillColorBlue;
        }

        // Warp properties
        answers.warpStyle = warpObj.getEnumerationString('warpStyle');
        answers.warpValue = warpObj.getDouble('warpValue');

        // Layer positioning
        const subtitleLayer = ActionDescriptorNavigator.forLayerByName(magic.lighthouseTours);
        const titleLayerBounds = titleLayer.getBounds();
        const subtitleLayerBounds = subtitleLayer.getBounds();

        answers.titleIsAboveSubtitle = titleLayerBounds.top < subtitleLayerBounds.top;
        answers.titleBoundsBottom = titleLayerBounds.bottom;
      }
    } catch (e) {
      // Error handling - answers remain as sentinel values
    } finally {
      return answers;
    }
  }
}