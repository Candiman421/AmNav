import ns from "./normalize";

declare let app: any;
declare let fl: any;
declare let FLfile: any;
declare var JSON: { stringify: (arg0: any, arg1?: any) => string; parse: (arg0: any) => any; };
////////////////////////////////////////////////////////////////////////////////////////////
//Generic Helpers
////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Compares two objects appropriately.
 * Returns false if both args not same type or are 
 * not type of String, Number, Boolean, Array, or Object.
 * @param item1 Any base type object
 * @param item2 Any base type object
 */
export function equalBasedOnType(item1: any, item2: any): boolean {
  if (item1 && item2 && item1.constructor.name !== item2.constructor.name) {
    return false;
  }

  switch (item1.constructor.name) {
    case 'String':
      return stringsAreSame(item1, item2);
    case 'Boolean':
      return item1 === item2;
    case 'Number':
      return parseFloat(item1) === parseFloat(item2);
    case 'Array':
      return arraysAreEqual(item1, item2);
    case 'Object':
      return objectsAreEqual(item1, item2);
    default:
      return false;
  }
}

/**
 * An object with r, g, & b properties that each represent red, green, and blue values of a color respectively.
 */
export declare interface IRGB {
  r: number;
  g: number;
  b: number;
}

// TS compiler says it can't find parseInt in this context...stupid compiler. The below line makes it happy.
declare var parseInt: any;

/**
 * Converts a hex string to an RGB object
 * @param hex Hex value
 * @returns RGB object
 */
export function hexToRGB(hex: string): IRGB {
  let rgb = { r: -1, g: -1, b: -1 };
  try {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      let [_, r, g, b] = result;
      rgb.r = parseInt(r, 16);
      rgb.g = parseInt(g, 16);
      rgb.b = parseInt(b, 16);
    }
  } catch (e) { }

  return rgb;
}

/**
 * Converts RGB object into hex string
 * @param rgb RGB object
 * @returns RGB conversion into hex string
 */
export function rgbToHex(rgb: IRGB): string {
  const componentToHex = (n: number) => {
    let hex = n.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}



////////////////////////////////////////////////////////////////////////////////////////////
//String Helpers
////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Used mainly for easy string comparison, 
 * this function accepts a string, lowercases the string, 
 * then strips all leading and trailing white space, 
 * then turns all spaces between words into single spaces.
 * @param str The string to be manipulated
 */
export function blandString(str: string): string {
  return str.toLowerCase().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/\s\s+/g, ' ');
}
/**
 * Trims a string.
 * @param str The string to trim
 * @returns Same string with leading and trailing whitespace removed, as well as all double spaces changed to single spaces.
 */
export function trim(str: string): string {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/\s\s+/g, ' ');
}

/**
 * For each string: lowercased, stripped of all leading and/or trailing whitespace, 
 * turns all concurrent spaces into a single space, and composes characters 
 * (mainly useful for Korean and other Oriental languages, but normal strings compare the same as always).
 * Compressed with nfc. See here for details: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 * And here: https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html (Search for "let precomposed: Character" to find relevant section)
 * @param str1 String to be compared
 * @param str2 String to be compared
 */
export function stringsAreSame(str1: string, str2: string): boolean {
  let string1 = str1.toLowerCase().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/\s\s+/g, ' ');
  let string2 = str2.toLowerCase().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/\s\s+/g, ' ');
  return ns.nfc(string1) === ns.nfc(string2);
}

/**
 * Takes given string and returns it as lowercase
 * with all spaces, periods, and hyphens replaced with underscores.
 * @param str A string
 */
export function underscoreBlandString(str: string) {
  return blandString(str).replace(/[\s\.\-:]/g, '_');
}

/**
 * Takes in a string (probably from XML) and returns its
 * JavaScript equivolent to be used as expected.
 * Example: 'true' => true, '[2,3]' => [2,3], '12' => 12
 */
export function stringToType(str: string): any {
  try {
    if (+str === +str) return +str; // Number
    if (stringsAreSame(str, 'true') || stringsAreSame(str, 'false')) return eval(str.toLowerCase()); // Boolean
    if ((str.indexOf('[') > -1 && str.indexOf(']') > -1) || (eval(str).constructor.name === 'Array')) return eval(str); // Array
    let obj;
    try {
      obj = JSON.parse(str);
      return obj;
    } catch (e) { }
  } catch (err) { }
  return str; // String
}

/**
 * A quick and dirty way to replace all occurances in a string with another string.
 * @param str String to be manipulated
 * @param strToReplace String you're searching for in str that you want to replace
 * @param strToReplaceWith String you want to replace 'strToReplace' with
 */
export function gReplace(str: string, strToReplace: string, strToReplaceWith: string): string {
  return str.split(strToReplace).join(strToReplaceWith);
}

/**
 * Find the nth last instance of a string within a string.
 * @example nthLastIndexOf("Users/vmova/anywhere/something/perfect.pdf", "/", 2) ==> 20 
 * nthLastIndexOf("Users/vmova/anywhere/something/perfect.pdf", "/", 3) ==> 11
 * @param str String in which to search
 * @param strToFind String whose index you want to find
 * @param n Number instance of string you're looking for
 * @returns Index of string you are searching for
 */
export function nthLastIndexOf(str: string, strToFind: string, n: number): number {
  if (!n || n <= 1) {
    return str.lastIndexOf(strToFind);
  }
  n--;
  return str.lastIndexOf(strToFind, nthLastIndexOf(str, strToFind, n) - 1);
}

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
  // return Array.from(str).reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0);
}


/**
 * Check that any strings are not present in a given string.
 * @param str String to check in
 * @param args Any strings to search for not being present in given str
 * @returns Boolean; true if the given strings are not in the str, false if any of them are.
 */
export function stringDoesNotContain(str: String, ...args: any[]) {
  for (let arg of args) {
    if (str.indexOf(arg) > -1) {
      return false;
    }
  }
  return true;
}

////////////////////////////////////////////////////////////////////////////////////////////
//Array Helpers
////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Returns an array of all items in the passed in array that 
 * meet the criteria of the function sent in.
 * @param arr Array to filter through
 * @param func Function to apply to each item in array
 */
export function filter(arr: any, func: (el: any, i: number, arr: any) => any): any[] {
  let items: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (func(item, i, arr)) {
      items.push(item);
    }
  }
  return items;
}

/**
 * Loops through each item in the array passed in
 * and runs the function passed in on each item.
 * @param arr Array to loop through
 * @param func Function to be applied to each item
 */
export function forEach(arr: any, func: (el: any, i: number, arr: any) => any) {
  for (let i = 0; i < arr.length; i++) {
    func(arr[i], i, arr);
  }
}

/**
 * Searches the sent in array for the item with a == comparison.
 * Returns true if found, false if not.
 * @param arr Array to search
 * @param thing Thing to look for in array (a basic type)
 */
export function includes(arr: any, thing: any): boolean {
  return indexOf(arr, thing) > -1;
}

export function includesBy(arr: any, func: (el: any, i: number, arr: any[]) => boolean): boolean {
  return indexOfBy(arr, func) > -1;
}

/*
 * Returns Last Element of an Array
 * 
*/
export function last(arr: any[]) {
  return arr[arr.length - 1];
}

/**
 * Loops through each element in the given array
 * and runs the function sent in on each element.
 * @param arr Array to loop through
 * @param func Function to call on each element in array
 */
export function map(arr: any, func: string | ((el: any, i: number, arr: any) => any)): any {
  // If func is a string, create a function that returns the property of each item
  if (typeof func === "string") {
    const key = func;
    func = (thing: any) => thing[key];
  }
  let itemArray = [];
  for (let i = 0; i < arr.length; i++) {
    itemArray.push((func as (el: any, i: number, arr: any[]) => any)(arr[i], i, arr));
  }
  return itemArray;
}

/**
 * Loops through each element in array and passes callback function
 * the accumulator and current value. Do with them as you will.
 * Refer here for help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 * @param arr Array to reduce
 * @param callback Function to be called on each item in array
 * @param initialValue Value to start at
 */
export function reduce(arr: any, callback: (accumulator: any, el: any, i: number, arr: any[]) => any, initialValue?: any): any {
  let value;
  if (initialValue !== undefined && initialValue !== null) {
    value = initialValue;
  }
  for (let i = 0; i < arr.length; i++) {
    value = callback(value, arr[i], i, arr);
  }
  return value;
}

/**
 * Will search through the given array and return the first element
 * where the function returns true.
 * Otherwise, returns null
 * @param arr Array to search through
 * @param func Function to apply to each element (returns boolean)
 */
export function find(arr: any, func: (el: any, i: number, arr: any) => any): any | null {
  try {
    for (let i = 0; i < arr.length; i++) {
      if (func(arr[i], i, arr)) {
        return arr[i];
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Loops through array to find index of value in array or -1 if not found.
 * @param haystack Array to search through
 * @param needle Value to find in haystack
 * @param fromIndex Index to start from
 */
export function indexOf(haystack: any, needle: any, fromIndex: number = 0): number {
  if (fromIndex >= haystack.length) {
    return -1;
  }
  let k = Math.max(fromIndex >= 0 ? fromIndex : haystack.length - Math.abs(fromIndex), 0);
  for (let i = k; i < haystack.length; i++) {
    if (haystack[i] === needle) {
      return i;
    }
  }
  return -1;
}

/**
 * Loops through array and returns new array
 * without any duplicates.
 * @param arr Array to remove dups from
 */
export function uniq(arr: any): any {
  var noDups: any = [];
  for (let i = 0; i < arr.length; i++) {
    if (indexOf(noDups, arr[i]) === -1) {
      noDups.push(arr[i]);
    }
  }
  return noDups;
}

/**
 * Returns a flattened array. Works only 1 level deep.
 * @param arr An array of arrays
 */
export function flatten(arr: any): any {
  return ([].concat as any).apply([], arr);
}

/**
 * Takes in two arrays and returns true if both arrays
 * have same values (order independent).
 * @param arr An array
 * @param arr1 An array
 */
export function sameValues(arr: any, arr1: any): boolean {
  if (arr == null || arr1 == null || (arr.length !== arr1.length)) {
    return false;
  }
  arr.sort(); arr1.sort();
  for (let i = 0; i < arr.length; i++) {
    let a = arr[i] + '';
    let b = arr1[i] + '';
    if (!stringsAreSame(a, b)) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param object
 */
export function isArray(object: any): Boolean {
  return object.constructor === Array;
}

/**
 * Returns boolean of whether element is in array
 * @param haystack Array to search for element in
 * @param needle Element to search in array for
 */
export function existsInArray(haystack: any[], needle: any): boolean {
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle) {
      return true;
    }
  }
  return false;
}

/**
 * Returns boolean for existence of item in array
 * @param array  Array to be evaluated
 * @param func Conditions of truth
 */
export function existsInArrayBy(array: any, func: (el: any, i: number, arr: any[]) => boolean): boolean {
  try {
    for (var i = 0; i < array.length; i++) {
      if (func(array[i], i, array)) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Returns element sought for from array if present, null if not
 * @param haystack Array to search for element in
 * @param needle Element to search in array for
 */
export function findInArray(haystack: any, needle: any): any | null {
  try {
    for (let i = 0; i < haystack.length; i++) {
      if (haystack[i] == needle) {
        return haystack[i];
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Returns the only matching element in array
 * @param array Array to search through
 * @param func Function to apply to each element (returns boolean)
 * @returns The element, null if not found or if found more than once.
 */
export function single(array: any, func: (el: any, i: number, arr: any[]) => boolean): any | null {
  try {
    let foundOnce = false;
    let returnValue = null;
    for (var i = 0; i < array.length; i++) {
      if (func(array[i], i, array)) {
        if (!foundOnce) {
          returnValue = array[i];
          foundOnce = true;
        } else {
          return null;
        }
      }
    }
    return returnValue;
  } catch (e) {
    return null;
  }
}

/**
 * Get index of element in array
 * @param arr Array to serch through
 * @param func Function to apply on each element in arr
 * @param fromRight Start search from end of array
 * @returns Index of found element or -1
 */
export function indexOfBy(arr: any, func: (el: any, i: number, arr: any[]) => boolean, fromRight: boolean = false): number {
  let { length } = arr;
  let index = fromRight ? length : -1;
  while ((fromRight ? --index > -1 : ++index < length)) {
    if (func(arr[index], index, arr)) {
      return index;
    }
  }
  return -1;
}

/**
 * 
 * @param data
 */
export function ToDwordArray(data: string): number[] {
  let result: number[] = [];
  let dword = 0x0;
  for (let i = 0; i < data.length; i += 4) {
    dword = (data.charCodeAt(i) << 24) +
      ((data.charCodeAt(i + 1) | 0) << 16) +
      ((data.charCodeAt(i + 2) | 0) << 8) +
      (data.charCodeAt(i + 3) | 0);
    result[(i / 4)] = dword;
  }
  return result;
}

/**
 * Compares two arrays. Used for arrays of basic values only.
 * Returns true if all values are same. Order specific.
 * @param list1 Array of any type
 * @param list2 Array of any type
 */
export function arraysAreEqual(list1: any[], list2: any[]) {
  try {
    if (list1 === list2) return true;
    if (!(list1 instanceof Array) || !(list2 instanceof Array)) return false;
    if (list1.length !== list2.length) return false;

    for (let i = 0; i < list1.length; i++) {
      if (!equalBasedOnType(list1[i], list2[i])) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Used to compare two arrays of same length to check if all values in both 
 * are the same, disregards content index order.
 * For flat arrays filled with base types.
 * @param list1 Array of any type
 * @param list2 Array of any type
 */
export function arraysAreEqualUnordered(list1: any[], list2: any[]): boolean {
  try {
    if (list1 === list2) return true;
    if (!list1 || !list1.length || !list2 || !list2.length) return false;
    if (list1.length !== list2.length) return false;

    for (let item of list1) {
      if (!includesBy(list2, (item2: any) => { return equalBasedOnType(item, item2); })) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Compares two arrays of same length according to passed-in equality function
 * @param list1 Array of any type
 * @param list2 Array of any type
 * @param equalFunc Anonymous function used to check if each value in both arrays return true;
 */
export function arraysAreEqualBy(list1: any[], list2: any[], equalFunc: (el1: any, el2: any, i: number) => boolean) {
  try {
    if (list1 === list2) return true;
    if (!list1 || !list1.length || !list2 || !list2.length) return false;
    if (list1.length !== list2.length) return false;
    for (let i = 0; i < list1.length; i++) {
      if (!equalFunc(list1[i], list2[i], i)) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Compares two arrays of objects to see if they have the same values.
 * Arrays must be same length and keys in each element must be same to return true.
 * @param arr1 First array of objects to be compared
 * @param arr2 Second array of objects to be compared
 */
export function arrayOfObjectsAreEqual(arr1: any[], arr2: any[]): boolean {
  try {
    if (arr1 === undefined || arr2 === undefined || arr1.constructor.name !== "Array" || arr2.constructor.name !== "Array" || arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      const keys = getObjectKeys(arr1[i]);
      for (let j = 0; j < keys.length; j++) {
        const k = keys[j];
        if (arr1[i][k] !== arr2[i][k]) {
          return false;
        }
      }
    }
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Compares two arrays of objects to see if they are equal according to the function sent in.
 * Arrays must be same length and keys in each element must be same to return true.
 * @param arr1 First array of objects to be compared
 * @param arr2 Second array of objects to be compared
 */
export function arrayOfObjectsAreEqualBy(arr1: any[], arr2: any[], equalFunc: (el1: any, el2: any, i: number) => boolean): boolean {
  try {
    if (arr1 === undefined || arr2 === undefined || arr1.constructor.name !== "Array" || arr2.constructor.name !== "Array" || arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (!equalFunc(arr1[i], arr2[i], i)) {
        return false;
      }
    }
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Removes an element from the array passed in if that
 * element is in the array. Works only on arrays of basic types.
 * Removes first instance of element.
 * @param arr An array of basic types
 * @param thing The basic type to look fro
 */
export function removeFromArray(arr: any, thing: any): any {
  let index = indexOf(arr, thing);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

/**
 * Search for an element with a name attribute that is compared with stringsAreSame to the name sent in.
 * Same thing as doing find(doc.layers, (l: Layer) => stringsAreSame(l.name, magic.layerName));, for example.
 * @param arr Array of items to search thru that have the name attribute
 * @param name The name to find
 * @returns The thing with the matching .name attribute
 */
export function findByName(arr: any, name: string) {
  return find(arr, (thing: { name: string }) => stringsAreSame(thing.name, name));
}

////////////////////////////////////////////////////////////////////////////////////////////
//XML Array Helpers
////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Loops through each element in the given array
 * and runs the function sent in on each element.
 * @param arr Array to loop through
 * @param func Function to call on each element in array
 */
export function xmlMap(arr: any, func: (el: any, i: number, arr: any) => any): any {
  let itemArray = [];
  for (let i = 0; i < arr.length(); i++) {
    itemArray.push(func(arr[i], i, arr));
  }
  return itemArray;
}

/**
 * Returns an array of all items in the passed in xml array that 
 * meet the criteria of the function sent in.
 * @param arr Array to filter through
 * @param func Function to apply to each item in array
 */
export function xmlFilter(arr: any, func: (el: any, i: number, arr: any) => any): any[] {
  let items: any[] = [];
  for (let i = 0; i < arr.length(); i++) {
    const item = arr[i];
    if (func(item, i, arr)) {
      items.push(item);
    }
  }
  return items;
}

/**
 * Loops through each element in array and passes callback function
 * the accumulator and current value. Do with them as you will.
 * Refer here for help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 * @param arr Array to reduce
 * @param callback Function to be called on each item in array
 * @param initialValue Value to start at
 */
export function xmlReduce(arr: any, callback: (accumulator: any, el: any, i: number, arr: any[]) => any, initialValue?: any): any {
  let value;
  if (initialValue !== undefined && initialValue !== null) {
    value = initialValue;
  }
  for (let i = 0; i < arr.length(); i++) {
    value = callback(value, arr[i], i, arr);
  }
  return value;
}

/**
 * Will search through the given array and return the first element
 * where the function returns true.
 * Otherwise, returns null
 * @param arr Array to search through
 * @param func Function to apply to each element (returns boolean)
 */
export function xmlFind(arr: any, func: (el: any, i: number, arr: any) => any): any | null {
  for (let i = 0; i < arr.length(); i++) {
    if (func(arr[i], i, arr)) {
      return arr[i];
    }
  }
  return null;
}

////////////////////////////////////////////////////////////////////////////////////////////
//Number Helpers
////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns number with as many decimal places as specified. Does not round.
 * E.g., decimalPlaces(5.667, 2) => 5.66
 * @param number number - Number to limit decimal places
 * @param decimalPlaces How many decimals places to limit number to
 */
export function decimalPlaces(number: number, decimalCount: number): number {
  // Add '.0' to avoid error if whole number sent in
  var nums = (number.toString() + '.0').split('.');
  return parseFloat(nums[0] + '.' + nums[1].substring(0, decimalCount)); // Turn back into string with decimal between and parseFloat
}


////////////////////////////////////////////////////////////////////////////////////////////
//Object Helpers
////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Send in a JS object to check if it is empty.
 * @param obj Javascript object
 * @returns True if has no keys in it (i.e., {}), false otherwise
 */
export function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  for (let k in obj) {
    return false;
  }
  return true;
}

/**
 * 
 * @param value
 */
export function isNotNullObject(value: any) {
  return value !== null && typeof value == 'object';
}

/**
 * 
 * @param value
 */
export function isObjectOrFunction(value: any) {
  let type = typeof value;
  let result = !!value && (type == 'object' || type == 'function');
  return result;
}


// /**
//  * 
//  * @param object
//  * @param properties
//  */
export function getObjectKey(object: any, properties: any[]) {
  object = Object(object);
  return getObjectKeyBy(object, properties, function (value: any, key: any) { //todo are returns correct?
    return key in object;
  });
}

// /**
//  * 
//  * @param object
//  * @param properties
//  * @param predicate
//  */
export function getObjectKeyBy(obj: any, properties: any, predicate: any): any {
  let index = -1;
  let length = properties.length;
  let result: any = {};

  while (++index < length) {
    let key = properties[index],
      value = obj[key];

    if (predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Returns a new object with subset of matched key/value/properties from array against original object
 * @param obj
 * @param keys
 */
export function getObjectKeyValuePairs(obj: any, keys: any[]): any {
  let result = Object({});
  for (let key in Object(obj)) {
    if (obj.hasOwnProperty(key) && key != 'constructor') {
      for (let compareToKey in keys) {
        if (key === compareToKey) {
          result[key] = obj[key];
        }
      }

    }
  }
  return result;
}

/**
 * 
 * @param object
 */
export function getObjectKeys(object: Object): any[] {
  let result = [];
  for (let key in Object(object)) {
    if (object.hasOwnProperty(key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * 
 * @param object
 * @param keysFunc
 */
export function getObjectKeysBy(object: any, keysFunc: any) {
  let result = keysFunc(object);
  return result;
}

/**
 * 
 * @param object
 * @param key
 */
export function getObjectValueByKey(object: any, key: any) {
  return object === null ? undefined : object[key];
}

/**
 * Works just like map for an array, but this loops through each
 * key/value pair in the object, runs the passed in function on
 * them, and returns an array.
 * @param object JS object with key/value pairs
 * @param func function to run against each key/value pair.
 */
export function objectMap(object: { [key: string]: any }, func: (key: string, value: any, i: number, object: { [key: string]: any }) => any): any[] {
  return map(getObjectKeys(object), (k: string, i: number) => {
    return func(k, object[k], i, object);
  });
}

/**
 * Works just like forEach for an array, but this loops through each
 * key/value pair in the object, runs the passed in function on them.
 * @param object JS object with key/value pairs
 * @param func function to run against each key/value pair.
 */
export function objectForEach(object: { [key: string]: any }, func: (key: string, value: any, i: number, object: { [key: string]: any }) => any) {
  let keys = getObjectKeys(object);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i], value = object[key];
    func(key, value, i, object);
  }
}

/**
 * Works just like find for an array, but this loops through each
 * key/value pair in the object, runs the passed in function on them.
 * @param object JS object with key/value pairs
 * @param func function to run against each key/value pair.
 * @param keyAndValue Set to true if you want key and value returned as a seperate object { key: key, value: value }, default false returns just the value
 */
export function objectFind(object: { [key: string]: any }, func: (key: string, value: any, i: number, object: { [key: string]: any }) => any, keyAndValue: boolean = false): { key: string, value: any } | any | null {
  let keys = getObjectKeys(object);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i], value = object[key];
    if (func(key, value, i, object)) {
      if (keyAndValue) { return { key, value } }
      return object[key];
    }
  }
  return null;
}

/**
 * Works just like filter for an array, but this loops through each
 * key/value pair in the object, runs the passed in function on them.
 * @param object JS object with key/value pairs
 * @param func function to run against each key/value pair.
 */
export function objectFilter(object: { [key: string]: any }, func: (key: string, value: any, i: number, object: { [key: string]: any }) => any, keyAndValue: boolean = false): { key: string, value: any } | any | null {
  let items: any[] = [];
  let keys = getObjectKeys(object);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i], value = object[key];
    if (func(key, value, i, object)) {
      items.push((keyAndValue ? { key, value } : object[key]));
    }
  }
  return items;
}

/**
 * Works just like single for an array, but this loops through each
 * key/value pair in the object, runs the passed in function on them.
 * @param object JS object with key/value pairs
 * @param func function to run against each key/value pair.
 */
export function objectSingle(object: { [key: string]: any }, func: (key: string, value: any, i: number, object: { [key: string]: any }) => any, keyAndValue: boolean = false): { key: string, value: any } | any | null {
  let keys = getObjectKeys(object);
  let foundOnce = false;
  let returnValue = null;
  for (var i = 0; i < keys.length; i++) {
    let key = keys[i], value = object[key];
    if (func(key, value, i, object)) {
      if (!foundOnce) {
        returnValue = (keyAndValue ? { key, value } : object[key]);
        foundOnce = true;
      } else {
        return null;
      }
    }
  }
  return returnValue;
}

/**
 * Loops through each element in array and passes callback function
 * the accumulator and current value. Do with them as you will.
 * Refer here for help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 * @param arr Array to reduce
 * @param callback Function to be called on each item in array
 * @param initialValue Value to start at
 */
export function objectReduce(object: any, callback: (accumulator: any, key: string, value: any, i: number, obj: any) => any, initialValue?: any): any {
  let value;
  if (initialValue !== undefined && initialValue !== null) {
    value = initialValue;
  }
  let keys = getObjectKeys(object);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i], objValue = object[key];
    value = callback(value, key, objValue, i, object);
  }
  return value;
}


export function objectsAreEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // They can't be null or undefined
  if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
    return false;
  }
  // If they are strings
  if (typeof obj1 === "string" && typeof obj2 === "string") {
    return stringsAreSame(obj1, obj2);
  }
  // If they are arrays
  if (obj1 instanceof Array && obj2 instanceof Array) {
    return arraysAreEqual(obj1, obj2);
  }
  // If they are objects
  const keys1 = getObjectKeys(obj1);
  const keys2 = getObjectKeys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!objectsAreEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  // If none of the other checks failed, then they are equal
  return true;
}

/**
 * 
 * @param object1
 * @param object2
 * @param equalFunc
 */
export function objectsAreEqualBy(object1: any, object2: any, equalFunc: any): boolean {
  let object1Properties = getObjectKeys(object1);
  let object1Length = object1Properties.length;
  let object2Properties = getObjectKeys(object2);
  let object2Length = object2Properties.length;

  if (object1Length != object2Length) {
    return false;
  }

  let index = -1;
  let result = true;

  while (++index < object1Length) {
    let key = object1Properties[index];
    let object1Value = object1[key],
      object2Value = object2[key];
    if ((isArray(object1Value) && isArray(object2Value) && !(arraysAreEqualBy(object1Value, object2Value, equalFunc)))
      || (isNotNullObject(object1Value) && isNotNullObject(object2Value) && !(objectsAreEqualBy(object1Value, object2Value, equalFunc)))
      || (!(object1Value === object2Value || equalFunc(object1Value, object2Value)))
    ) {
      result = false;
      break;
    }
  }
  return result;
}

/**
 * Utility for comparing nested objects
 * @param object1
 * @param object2
 * @param equalFunc
 */
export function objectsAreEqualDeeplyBy(object1: any, object2: any, equalFunc: any): boolean {
  equalFunc = !equalFunc ? objectsAreEqual : equalFunc;

  if (!object1 || !object2) return false;

  if (isArray(object1)) return arraysAreEqualBy(object1, object2, equalFunc);

  return objectsAreEqualBy(object1, object2, equalFunc);
}


export function cloneDeep(obj: any) {
  if (obj.constructor.name !== "Object") {
    return obj;
  }

  let keys = getObjectKeys(obj);
  if (keys.length === 0) {
    return obj;
  }
  let newObj: any = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    newObj[key] = cloneDeep(obj[key]);
  }
  return newObj;
}

////////////////////////////////////////////////////////////////////////////////////////////
//END Object Helpers
////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Checks that a given number (currentVal) is within the tolerance amount
 * above and below the target value. If within range, true is returned.
 * If not, false is returned.
 * @param currentVal (number) Current value to be checked
 * @param toleranceVal (number) Amount of tolerance +/- allowed
 * @param targetVal (number) Target/expected value
 * @param decimalCount (number) Default = 2, How many decimal places to round to
 */
export function withinToleranceRange(currentVal: number, toleranceVal: number, targetVal: number, decimalCount?: number): boolean {
  decimalCount = (decimalCount) ? decimalCount : 2;
  try {
    currentVal = parseFloat(currentVal.toFixed(decimalCount));
    let min = parseFloat((targetVal - toleranceVal).toFixed(decimalCount));
    let max = parseFloat((toleranceVal + targetVal).toFixed(decimalCount));
    if (currentVal >= min && currentVal <= max) {
      return true;
    }
  }
  catch (e) { }
  return false;
}

export function withinToleranceMaxMin(currentVal: number, max: number, min: number, decimalCount?: number): boolean {
  decimalCount = (decimalCount) ? decimalCount : 2;
  try {
    currentVal = parseFloat(currentVal.toFixed(decimalCount));
    if (currentVal >= min && currentVal <= max) {
      return true;
    }
  }
  catch (e) { }
  return false;
}

/**
 * Checks that a given number (currentVal) is within the tolerance amount
 * above and below the target value. If within range, targetVal is returned.
 * If not, currentVal is returned.
 * @param currentVal (number) Current value to be checked
 * @param toleranceVal (number) Amount of tolerance +/- allowed
 * @param targetVal (number) Target/expected value
 * @param decimalCount (number) How many decimal places to round to
 */
export function applyTolerance(currentVal: number, toleranceVal: number, targetVal: number, decimalCount?: number): number {
  decimalCount = (decimalCount) ? decimalCount : 3;
  try {
    currentVal = parseFloat(currentVal.toFixed(decimalCount));
    let min = parseFloat((targetVal - toleranceVal).toFixed(decimalCount));
    let max = parseFloat((toleranceVal + targetVal).toFixed(decimalCount));
    if (currentVal >= min && currentVal <= max) {
      return targetVal;
    }
  }
  catch (e) { }
  return currentVal;
}

/**
 * App agnostic function for opening a document or project. 
 * Simply specify the 2 letter appName and the path.
 * @param appName Two letter app abbreviation. ae, ai, in, ps, or pr.
 * @param path Path to the document to open.
 */
export function openDocument(appName: string, path: string): any {
  switch (appName) {
    case 'ae':
    case 'ai':
    case 'in':
    case 'ps':
      return app.open(new File(path));
    case 'pr':
      if (app.openDocument(path)) {
        return app.project;
      }
      break;
    case 'an':
      if (path.indexOf('file:///') !== 0) {
        path = FLfile.platformPathToURI(path);
      }
      return fl.openDocument(path);
  }
}

export function getColorName(colorHex: string) {
  
}