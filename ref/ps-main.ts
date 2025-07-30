import "../../../json2";
import "../../../es5-pollyfills";
// import { Exam } from "../shared/exam";
import { stringIDToTypeID } from "./ps";
// import { PhotoshopExam } from "./ps-exam";
// import { itemList } from "./ps-items";

declare let JSON: { stringify: (arg0: any) => string; parse: (arg0: any) => any; };
declare function Award(points: number, skillGroup: string): void;

// declare let exam: Exam;

// let thisExam = new PhotoshopExam(itemList);









declare global {
  // function Initialize(): void;
  // function Terminate(): void;
  // function Score(): void;
}

