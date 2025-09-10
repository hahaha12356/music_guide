/**
 * build-index.js
 * 
 * This script generates a search index for the static site using Lunr.js.
 * It scans all HTML files, extracts relevant content, and builds a JSON index file.
 * 
 * To Run:
 * 1. Make sure you have Node.js installed.
 * 2. Install dependencies: npm install lunr cheerio glob
 * 3. Run the script from your project root: node build-index.js
 */

const lunr = require('lunr');
const cheerio = require('cheerio');
const glob = require('glob');
const fs = require('fs');

// The main function to build the index
function buildIndex() {
    console.log('Starting to build search index...');

    // Find all HTML files in the directory
    const files = glob.sync('**/*.html', { ignore: ['node_modules/**'] });
    const documents = [];
    const store = {};

    files.forEach((file, index) => {
        const fileContent = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(fileContent);

        // Extract title, description, and body content
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content') || '';
        const body = $('main').text().replace(/\s+/g, ' ').trim(); // Clean up whitespace

        const doc = {
            id: file,
            title: title,
            description: description,
            body: body
        };

        documents.push(doc);
        store[file] = { title: title, description: description.substring(0, 150) + '...' };
        console.log(`- Indexed: ${file}`);
    });

    // Create the Lunr index
    const idx = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('description', { boost: 5 });
        this.field('body');

        documents.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    // Write the index and the document store to files
    fs.writeFileSync('search-index.json', JSON.stringify({ index: idx, store: store }));

    console.log('\nSearch index built successfully!');
    console.log(`- Total files indexed: ${files.length}`);
    console.log('- Output file: search-index.json');
}

// Run the build process
buildIndex();
