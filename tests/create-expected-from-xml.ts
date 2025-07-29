// tests/create-expected-from-xml.ts
import * as fs from 'fs';
import * as path from 'path';

export const expectedResults = {
    "complex-text": {
        hasTextKey: true,
        textStyleRangeCount: 1,
        firstRange: {
            from: 0,
            to: 16,
            fontPostScriptName: "ArialMT",  // From your XML: string="ArialMT"
            fontSize: 64,                   // From your XML: unitDoubleValue="64"
            color: { red: 255, green: 0, blue: 0 }  // From your XML
        }
    },
    "simple-title": {
        hasTextKey: true,
        textStyleRangeCount: 1,
        firstRange: {
            from: 0,
            to: 12,
            fontPostScriptName: "ArialMT",
            fontSize: 48
        }
    },
    "multi-layer-bounds": {
        hasTextKey: true,
        textStyleRangeCount: 1,
        layerCount: 2,
        firstRange: {
            from: 0,
            to: 10,
            fontPostScriptName: "ArialMT",
            fontSize: 36
        }
    }
};

// Save as JSON files
Object.entries(expectedResults).forEach(([name, data]) => {
    fs.writeFileSync(`tests/expected/${name}.json`, JSON.stringify(data, null, 2));
});