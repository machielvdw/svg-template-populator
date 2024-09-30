const fs = require('fs-extra');
const csv = require('csv-parser');
const handlebars = require('handlebars');

// Paths to your files
const TEMPLATE_SVG = 'template.svg';
const DATA_CSV = 'data.csv';
const OUTPUT_DIR = 'output_svgs';

// Ensure the output directory exists
fs.ensureDirSync(OUTPUT_DIR);

// Function to read the SVG template
async function readSvgTemplate(filePath) {
  try {
    const templateContent = await fs.readFile(filePath, 'utf8');
    return templateContent;
  } catch (error) {
    throw new Error(`Failed to read SVG template: ${error.message}`);
  }
}

// Function to read the CSV data
function readCsvData(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (error) => reject(error));
  });
}

// Main function to generate the populated SVGs
async function generatePopulatedSvgs() {
  try {
    const svgTemplateContent = await readSvgTemplate(TEMPLATE_SVG);
    const dataRows = await readCsvData(DATA_CSV);

    // Compile the SVG template using Handlebars
    const template = handlebars.compile(svgTemplateContent);

    // Generate an SVG file for each data row
    for (const dataRow of dataRows) {
      // Generate the SVG content
      const populatedSvg = template(dataRow);

      // Create a filename-safe version of the name
      const fileNameSafeName = dataRow.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
      const outputFilePath = `${OUTPUT_DIR}/${fileNameSafeName}.svg`;

      // Write the populated SVG to a file
      await fs.writeFile(outputFilePath, populatedSvg, 'utf8');
      console.log(`Generated SVG for ${dataRow.name}: ${outputFilePath}`);
    }

    console.log('All SVG files have been generated successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePopulatedSvgs();
