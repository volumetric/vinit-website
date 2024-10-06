// To run this script independently, copy environment variables from .env.local file
process.env.MONGODB_URI = "";
process.env.MONGODB_DB = "vinit-agrawal-website";

import { connectToDatabase } from '../../../shared/mongodb';
import playwright from 'playwright';
import * as cheerio from 'cheerio';
import { Collection, InsertManyResult } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

const mongodb_collection_name = "meme-templates-kym";

interface MemeEntry {
    title: string;
    url: string | undefined;
    kym_url: string | undefined;
    image_url: string | undefined;
    image_alt_text: string | undefined;
    image_title: string | undefined;
    created_at: Date;
    updated_at: Date;
}

async function insertMemesToMongoDB(memes: MemeEntry[]): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      const collection: Collection = db.collection(mongodb_collection_name);
      const result: InsertManyResult<MemeEntry> = await collection.insertMany(memes);
      console.log(`${result.insertedCount} memes inserted into MongoDB`);
    } catch (error) {
      console.error('Error inserting memes into MongoDB:', error);
      throw error;
    }
}

async function scrapePageEntries(page: playwright.Page, url: string): Promise<MemeEntry[]> {
    console.log(`Scraping page: ${url}`);
    
    // Wait for the page to load or a maximum of 10 seconds
    await Promise.race([
      page.goto(url, { waitUntil: 'load' }),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
    
    // Scroll the page to trigger image loading
    await autoScroll(page);
    
    let entries: MemeEntry[] = [];
    let retries = 0;
    const maxRetries = 3;
    const expectedEntries = 16;
  
    while (entries.length < expectedEntries && retries < maxRetries) {
      const content = await page.content();
      const $ = cheerio.load(content);
  
      entries = $('#entries .entry_list td[class^="entry_"]').map((_, element): MemeEntry => {
        const $element = $(element);
        const currentDate = new Date(); // Get the current date
  
        return {
          title: $element.find('h2').text().trim(),
          url: $element.find('a').attr('href'),
          kym_url: $element.find('a').attr('href'),
          image_url: $element.find('img').attr('src'),
          image_alt_text: $element.find('img').attr('alt'),
          image_title: $element.find('img').attr('title'),
          created_at: currentDate,
          updated_at: currentDate,
        };
      }).get();
  
      if (entries.length < expectedEntries) {
        console.log(`Found ${entries.length} entries, expected ${expectedEntries}. Retrying...`);
        await page.waitForTimeout(2000);
        retries++;
      }
    }
  
    console.log(`Scraped ${entries.length} entries from ${url}`);
    return entries.slice(0, expectedEntries);
  }
  
  // Add this new function to perform auto-scrolling
  async function autoScroll(page: playwright.Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          // const scrollHeight = document.body.scrollHeight;
          const scrollHeight = 2000;
          window.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  
async function scrapeMemeEntries(startPage: number, endPage: number): Promise<MemeEntry[]> {
    console.log(`Starting to scrape meme entries from page ${startPage} to ${endPage}`);
    
    const browser = await playwright.chromium.launch({
      // headless: false,
      slowMo: 1000,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const allMemeEntries: MemeEntry[] = [];
  
    try {
      for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
        const url = `https://knowyourmeme.com/memes/page/${currentPage}?sort=chronological`;
        const pageEntries = await scrapePageEntries(page, url);
        
        await insertMemesToMongoDB(pageEntries);
  
        console.log('Meme found:');
        console.log(JSON.stringify(pageEntries, null, 2));
        
        allMemeEntries.push(...pageEntries);
  
        console.log(`Total meme entries scraped and inserted so far: ${allMemeEntries.length}`);
        
        await page.waitForTimeout(1000);
      }
  
      console.log(`Finished scraping. Total meme entries: ${allMemeEntries.length}`);
      return allMemeEntries;
    } catch (error) {
      console.error('Error scraping meme entries:', error);
      throw error;
    } finally {
      // await context.close();
      // await browser.close();
      console.log('Browser closed');
      return [];
    }
  }
  
async function exportMemesFromMongoDB(): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const collection: Collection = db.collection(mongodb_collection_name);
    
    const memes = await collection.find({}).toArray();
    console.log(`Found ${memes.length} memes in MongoDB`);

    const exportPath = 'exported_memes.json';
    await fs.writeFile(exportPath, JSON.stringify(memes, null, 2));
    
    console.log(`Memes exported to ${exportPath}`);
  } catch (error) {
    console.error('Error exporting memes from MongoDB:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    // Uncomment the following line to scrape memes
    // const memeEntries = await scrapeMemeEntries(404, 553);
    
    // Export memes from MongoDB
    await exportMemesFromMongoDB();
    
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();