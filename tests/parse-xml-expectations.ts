import * as fs from 'fs';
import * as path from 'path';

// Parse your existing XML dumps into expected results
export function parseXMLExpectations() {
    const xmlDir = './tests/xml-dumps';
    const expectations: Record<string, any> = {};

    const testFiles = [
        'simple-title_updated01',
        'complex-text_updated01',
        'multi-layer-bounds_updated01'
    ];

    testFiles.forEach(testName => {
        const layersXml = path.join(xmlDir, `${testName}.layers.xml`);

        if (fs.existsSync(layersXml)) {
            const xmlContent = fs.readFileSync(layersXml, 'utf8');

            // Basic XML parsing - you'll refine based on your actual XML structure
            expectations[testName] = {
                testName,
                psdFile: `${testName}.psd`,
                // Parse XML here to extract actual values
                expectedLayer: {
                    hasTextKey: xmlContent.includes('textKey'),
                    layerName: extractLayerName(xmlContent),
                    fontName: extractFontName(xmlContent),
                    fontSize: extractFontSize(xmlContent)
                }
            };
        }
    });

    // Save for ExtendScript access
    fs.writeFileSync('./tests/xml-expectations.json', JSON.stringify(expectations, null, 2));
    return expectations;
}

function extractLayerName(xml: string): string {
    // Parse your XML structure to get layer name
    return "Sample Title"; // Placeholder - implement based on your XML
}

function extractFontName(xml: string): string {
    // Parse your XML to get font name  
    return "ArialMT"; // Placeholder - implement based on your XML
}

function extractFontSize(xml: string): number {
    // Parse your XML to get font size
    return 48.0; // Placeholder - implement based on your XML
}

// Run parser
if (require.main === module) {
    const expectations = parseXMLExpectations();
    console.log('✅ Parsed XML expectations:', Object.keys(expectations));
}