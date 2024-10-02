import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

async function deleteYmlFiles(directory: string) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDirectory = join(directory, entry.name);
        const files = await readdir(subDirectory);
        
        for (const file of files) {
          if (file.endsWith('.yml')) {
            const filePath = join(subDirectory, file);
            await unlink(filePath);
            console.log(`Deleted: ${filePath}`);
          }
        }
      }
    }

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('An error occurred during cleanup:', error);
  }
}

// Copy the "templates" folder from this repo: https://github.com/jacebrowning/memegen
// and keep it in the same folder as this file and rename it to "meme-templates"
const memeTemplatesDirectory = './meme-templates';
deleteYmlFiles(memeTemplatesDirectory);