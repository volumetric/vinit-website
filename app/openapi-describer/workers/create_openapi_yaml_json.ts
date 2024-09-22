import fs from 'fs';
import path from 'path';

function findYamlFiles(rootDir: string): { files: Record<string, any>; count: number } {
    const yamlFiles: Record<string, any> = {};
    let count = 0;

    function traverseDir(currentPath: string): Record<string, any> {
        const result: Record<string, any> = {};
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            const fullPath = path.join(currentPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                result[file] = traverseDir(fullPath);
            } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                const relativePath = path.relative(rootDir, fullPath);
                result[path.parse(file).name] = relativePath;
                count++;
            }
        }
        return result;
    }

    yamlFiles['APIs'] = traverseDir(rootDir);
    return { files: yamlFiles, count };
}

const rootDirectory = 'APIs';
const outputFile = 'openapi_specs_file_urls.json';

const { files: yamlFiles, count } = findYamlFiles(rootDirectory);

fs.writeFileSync(outputFile, JSON.stringify(yamlFiles, null, 2));

console.log(`JSON file '${outputFile}' has been created with nested YAML file entries.`);
console.log(`Total number of YAML files added: ${count}`);

function countTopLevelAPIs(outputFile: string) {
    try {
        const fileContent = fs.readFileSync(outputFile, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        if (jsonData && jsonData.APIs && typeof jsonData.APIs === 'object') {
            return Object.keys(jsonData.APIs).length;
        } else {
            console.error('Invalid file structure: "APIs" key not found or not an object');
            return 0;
        }
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        return 0;
    }
}

// Usage
const apiCount = countTopLevelAPIs(outputFile);
console.log(`Number of top-level objects in "APIs": ${apiCount}`);