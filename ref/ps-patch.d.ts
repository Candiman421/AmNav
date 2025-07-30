/** Updates to declarations found in types-for-adobe */

declare interface XML {
  child(name: string | number): XML;
}

declare interface DocumentInfo {
  [key: string]: any;
}

declare interface Document {
	readonly info: DocumentInfo;
}

declare interface ActionList {
  // types-for-adobe has these declared 'static'
  /**
	 * The number of commands that comprise the action.
	 */
	readonly count: number;

	/**
	 * The class name of the referenced ActionList object.
	 */
	readonly typename: string;
}

declare interface ActionDescriptor {
  // types-for-adobe has these declared 'static'
	/**
	 * The number of keys contained in the descriptor.
	 */
	readonly count: number;

	/**
	 * The class name of the referenced ActionDescriptor object.
	 */
	readonly typename: string;
}

declare interface ColorSamplers {
	/**
	 * Creates a color sampler.
	 * @param position The horizontal and vertical (x,y) locations, respectively, of the color sampler.
	 */
	add(position: UnitPoint): ColorSampler;
	removeAll(): void;
}

declare interface Guides {
  [key: number]: Guide;
	/**
	 * A guide.
	 * @param direction Indicates whether the guide is vertical or horizontal.
	 * @param coordinate Location of the guide from origin of image.
	 */
	add(direction: Direction, coordinate: UnitValue | number): Guide;
}

declare interface Layer {
	kind: LayerKind;

	/**
	 * The text that is associated with the layer. Valid only when 'kind' is text layer.
	 */
	readonly textItem: TextItem;
	/**
	 * If true, the pixels in the layer's image cannot be edited.
	 */
	pixelsLocked: boolean;
	/**
	 * If true, the pixels in the layer's image cannot be moved within the layer.
	 */
	positionLocked: boolean;
	/**
	 * If true, editing is confined to the opaque portions of the layer.
	 */
	transparentPixelsLocked: boolean;

}

declare interface UnitValue {
  value: number;
	toFixed(decimals: number): string;
}

declare let preferences: Preferences;

/** Updates to declarations found in JavaScript.d.ts */
declare interface XML {
  [key: number]: XML;
}

declare enum TextCase {
	/**
	 * Caps is set to all caps
	 */
	ALLCAPS = 1,
	/**
	 * Caps is set to normal caps level
	 */
	NORMAL = 2,
	/**
	 * All letters are capitalized with the first letter of each word twice as large as the others
	 */
	SMALLCAPS = 3
}
