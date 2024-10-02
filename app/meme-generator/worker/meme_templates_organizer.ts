// import * as fs from 'fs';
// import * as path from 'path';
// import * as yaml from 'js-yaml';

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface TemplateConfig {
    name: string;
    media: {
        image_url: string;
        gif_url: string;
        video_url: string;
    };
    source: string;
    keywords: string[];
    text: any[];
    example: string[];
    overlay: any[];
}

function convertYamlToJson(yamlFile: string): TemplateConfig {
    const fileContents = fs.readFileSync(yamlFile, 'utf8');
    return yaml.load(fileContents) as TemplateConfig;
}

function processTemplatesFolder(memeTemplatesDir: string): TemplateConfig[] {
    const result: TemplateConfig[] = [];

    fs.readdirSync(memeTemplatesDir).forEach(folder => {
        const folderPath = path.join(memeTemplatesDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            let yamlFile: string | null = null;
            let imageFile: string | null = null;
            let gifFile: string | null = null;

            fs.readdirSync(folderPath).forEach(file => {
                if (file.endsWith('.yml')) {
                    yamlFile = path.join(folderPath, file);
                } else if (file.endsWith('.jpg') || file.endsWith('.png')) {
                    imageFile = file;
                } else if (file.endsWith('.gif')) {
                    gifFile = file;
                }
            });

            if (yamlFile && imageFile) {
                const jsonData = convertYamlToJson(yamlFile);

                // Add media property
                jsonData.media = {
                    image_url: `/images/${folder}/${imageFile}`,
                    video_url: "",
                    gif_url: ""
                };

                if (gifFile) {
                    jsonData.media.gif_url = `/images/${folder}/${gifFile}`;
                }

                result.push(jsonData);
            }
        }
    });

    return result;
}

function main() {
    // Copy the "templates" folder from this repo: https://github.com/jacebrowning/memegen
    // and keep it in the same folder as this file and rename it to "meme-templates"
    const memeTemplatesDir = 'meme-templates';
    const outputFile = 'meme-templates.json';

    const templatesData = processTemplatesFolder(memeTemplatesDir);

    fs.writeFileSync(outputFile, JSON.stringify(templatesData, null, 2));

    console.log(`Conversion complete. Output saved to ${outputFile}`);
}

main();
