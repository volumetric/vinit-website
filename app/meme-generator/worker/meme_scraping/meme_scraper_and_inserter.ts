// To run this script independently, copy environment variables from .env.local file
process.env.MONGODB_URI = "";
process.env.MONGODB_DB = "vinit-agrawal-website";

import { connectToDatabase } from '../../../shared/mongodb';
import playwright from 'playwright';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone'; // Make sure to install moment.js: npm install moment
import { Collection, InsertManyResult } from 'mongodb';

const mongodb_collection_name = "meme-templates-kym";


const { db } = await connectToDatabase();
const collection: Collection = db.collection(mongodb_collection_name);

interface ContentItem {
  heading: string;
  text: string[];
  image_url: string[];
  a_urls: string[];
  yt_videoid: string[];
}

interface MemeInfo {
  url: string;
  image: {
    image_url: string;
    image_alt_text: string;
    image_title: string;
  };
  title: string;
  metadata: {
    category: string;
    status: string;
    types: string[];
    year: string;
    origin: string;
    tags: string[];
  };
  stats: {
    fav_count: number;
    views_count: number;
    videos_count: number;
    photos_count: number;
    comments_count: number;
  };
  added_on: {
    date: string;
    user: string;
  };
  last_changed_on: {
    date: string;
    user: string;
  };
  parent: {
    name: string;
    url: string;
  } | null;
  content: ContentItem[];
  external_reference_urls: string[];
}

interface MemeEntry {
  _id: any;
  title: string;
  url: string | undefined;
  kym_url: string | undefined;
  image_url: string | undefined;
  image_alt_text: string | undefined;
  image_title: string | undefined;
  created_at: Date;
  updated_at: Date;
}

function parseCustomDate(dateString: string): string {
  // Parse the date string and set the timezone to EDT
  const parsedDate = moment.tz(dateString, "MMM D, YYYY [at] hh:mmA", "America/New_York");
  
  // Format the date in ISO format and return
  return parsedDate.toISOString();
}

async function autoScroll(page: playwright.Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        // const scrollHeight = 2000;
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

async function scrapeMemeInfo(url: string): Promise<MemeInfo> {
  console.log('Starting to scrape:', url);
  
  const browser = await playwright.chromium.launch({
    // headless: false,
    slowMo: 1000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to the page...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded');
    
    console.log('Waiting for #entry_body');
    await page.waitForSelector('#entry_body', { timeout: 30000 });
    console.log('#entry_body found');

    console.log('Scrolling the page to load images...');
    await autoScroll(page);
    console.log('Page scrolled');

    // Wait for images to load
    await page.waitForTimeout(2000);

    console.log('Getting page content...');
    const content = await page.content();
    console.log('Page content retrieved');

    const $ = cheerio.load(content);

    console.log('Extracting meme info...');
    const memeInfo: MemeInfo = {
      url: url,
      metadata: {
        category: $('#maru .entry .entry-category-badge').text().trim(),
        status: $('#maru .entry aside.left dl dt:contains("Status") + dd').text().trim(),
        types: $('#maru .entry aside.left dl dt:contains("Type:") + dd a.entry-type-link').map((_, el) => $(el).text().trim()).get(),
        year: $('#maru .entry aside.left dl dt:contains("Year") + dd a').text().trim(),
        origin: $('#maru .entry aside.left dl dt:contains("Origin") + dd').text().trim(),
        tags: $('#maru .entry #entry_tags dd a').map((_, el) => $(el).text().trim()).get(),
      },
      stats: {
        fav_count: parseInt($('#maru .entry .fave span').text().trim(), 10) || 0,
        views_count: parseInt($('#maru .entry aside.stats.right dd.views a').text().replace(/,/g, ''), 10) || 0,
        videos_count: parseInt($('#maru .entry aside.stats.right dd.videos a').text(), 10) || 0,
        photos_count: parseInt($('#maru .entry aside.stats.right dd.photos a').text(), 10) || 0,
        comments_count: parseInt($('#maru .entry aside.stats.right dd.comments a').text(), 10) || 0,
      },
      title: $('#maru .entry section.info h1').text().trim(),
      image: {
        image_url: $('#maru .entry img').attr('src') || '',
        image_alt_text: $('#maru .entry img').attr('alt') || '',
        image_title: $('#maru .entry img').attr('title') || '',
      },
      content: [],
    //   about: get_content_between_selectors('#maru .entry #entry_body .bodycopy #about', '#maru .entry #entry_body .bodycopy #origin'),
    //   origin: get_content_between_selectors('#maru .entry #entry_body .bodycopy #origin', '#maru .entry #entry_body .bodycopy #spread'),
    //   spread: get_content_between_selectors('#maru .entry #entry_body .bodycopy #spread', '#maru .entry #entry_body .bodycopy #exploitables'),
    //   exploitables: get_content_between_selectors('#maru .entry #entry_body .bodycopy #exploitables', '#maru .entry #entry_body .bodycopy #templates'),
      parent: null,
    //   parent: $('#maru .entry h5.parent').text().trim(),
      added_on: {
        date: '',
        user: '',
      },
      last_changed_on: {
        date: '',
        user: '',
      },
      external_reference_urls: [],
    };

    // Extract added_on and last_changed_on information
    const footer = $('footer');
    const addedOnElement = footer.find('p:contains("Added")');
    const lastChangedOnElement = footer.find('p:contains("Updated")');

    if (addedOnElement.length > 0) {
      const addedOnDate = addedOnElement.find('abbr.timeago').attr('title');
      memeInfo.added_on.date = addedOnDate ? parseCustomDate(addedOnDate) : '';
      memeInfo.added_on.user = addedOnElement.find('a').text().trim();
    }

    if (lastChangedOnElement.length > 0) {
      const lastChangedOnDate = lastChangedOnElement.find('abbr.timeago').attr('title');
      memeInfo.last_changed_on.date = lastChangedOnDate ? parseCustomDate(lastChangedOnDate) : '';
      memeInfo.last_changed_on.user = lastChangedOnElement.find('a').text().trim();
    }

    // Extract parent meme information
    const parentElement = $('#maru .entry h5.parent');
    if (parentElement.length > 0) {
      const parentLink = parentElement.find('span a').first();
      if (parentLink.length > 0) {
        memeInfo.parent = {
          name: parentLink.text().trim(),
          url: parentLink.attr('href') || '',
        };
      }
    }

    // Extract content
    const bodyCopy = $('section.bodycopy');
    let currentItem: ContentItem | null = null;

    bodyCopy.children().each((_, element) => {
      const $element = $(element);

      if ($element.is('h2')) {
        if (currentItem) {
          memeInfo.content.push(currentItem);
        }
        currentItem = {
          heading: $element.text().trim(),
          text: [],
          image_url: [],
          yt_videoid: [],
          a_urls: [],
        };
      } else if ($element.is('p')) {
        if (currentItem) {
          currentItem.text.push($element.text().trim());
          $element.find('a').each((_, a) => {
            const href = $(a).attr('href');
            if (href) currentItem!.a_urls.push(href);
          });
        }
      } else if ($element.is('center')) { // div.references
        if (currentItem) {
          $element.find('img').each((_, img) => {
            const src = $(img).attr('src');
            if (src) currentItem!.image_url.push(src);
          });
          $element.find('lite-youtube').each((_, yt) => {
            const videoId = $(yt).attr('videoid');
            if (videoId) currentItem!.yt_videoid.push(videoId);
          });
          $element.find('a').each((_, a) => {
            const href = $(a).attr('href');
            if (href) currentItem!.a_urls.push(href);
          });
        }
      }
    });

    // Push the last item if it exists
    if (currentItem) {
      memeInfo.content.push(currentItem);
    }

    // Add to external_reference_urls
    const referencesDiv = $('div.references');
    referencesDiv.find('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !memeInfo.external_reference_urls.includes(href)) {
        memeInfo.external_reference_urls.push(href);
      }
    });

    console.log('Meme info extracted successfully');
    return memeInfo;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    console.log('Closing browser...');
    await context.close();
    await browser.close();
    console.log('Browser closed');
  }
}

async function get_meme_info_from_url(url: string): Promise<MemeInfo | null> {
  try {
    console.log('Starting main function...');
    const memeInfo = await scrapeMemeInfo(url);
    console.log('Meme info scraped successfully:');
    console.log(JSON.stringify(memeInfo, null, 2));
    return memeInfo;
  } catch (error) {
    console.error('Error in main function:', error);
    return null;
  }
}

async function updateMemeInfoInMongoDB(memeEntry: MemeEntry, memeInfo: MemeInfo): Promise<void> {
  try {

    console.log("=========================")
    console.log(JSON.stringify(memeEntry, null, 2))
    console.log("=========================")
    // console.log(JSON.stringify(memeInfo, null, 2))
    // console.log("=========================")
    
    const updatedMeme = {
      ...memeEntry,
      metadata: memeInfo.metadata,
      stats: memeInfo.stats,
      image: memeInfo.image,
      content: memeInfo.content,
      parent: memeInfo.parent,
      added_on: memeInfo.added_on,
      last_changed_on: memeInfo.last_changed_on,
      external_reference_urls: memeInfo.external_reference_urls,
      updated_at: new Date()
    };

    const result = await collection.updateOne(
      { _id: memeEntry._id },
      { $set: updatedMeme },
      { upsert: false }
    );

    console.log(`Update result for meme ${memeEntry.title}:`, result);

    if (result.matchedCount === 0) {
      console.warn(`No document found for meme: ${memeEntry.title}`);
    } else if (result.modifiedCount === 0) {
      console.warn(`No changes made to meme: ${memeEntry.title}`);
    } else {
      console.log(`Successfully updated meme: ${memeEntry.title}`);
    }

    // Verify the update
    const updatedDocument = await collection.findOne({ _id: memeEntry._id });
    console.log(`Updated document for meme ${memeEntry.title}:`, updatedDocument);

  } catch (error) {
    console.error('Error updating meme in MongoDB:', error);
    throw error;
  }
}

async function processMemeBatch(batch: MemeEntry[]): Promise<void> {
  for (const meme of batch) {
    try {
      if (meme.url) {
        const memeInfo = await get_meme_info_from_url(meme.url);
        if (memeInfo) {
          await updateMemeInfoInMongoDB(meme, memeInfo);
        }
      } else {
        console.warn(`Skipping meme ${meme.title} due to missing URL`);
      }
    } catch (error) {
      console.error(`Error processing meme ${meme.title}:`, error);
    }
  }
}

async function main(): Promise<void> {
  try {
    // const { db } = await connectToDatabase();
    // const collection: Collection = db.collection(mongodb_collection_name);

    const batchSize = 1; // Adjust this value based on your needs
    const maxItemsToProcess = 8839; // Maximum number of items to process
    let processed = 0;

    console.log(`Starting meme processing. Max items to process: ${maxItemsToProcess}`);

    while (processed < maxItemsToProcess) {
      const batch = await collection.find({ metadata: { $exists: false } })
        .sort({ _id: 1 })
        .limit(batchSize)
        .toArray();

      if (batch.length === 0) {
        console.log('All memes processed');
        break;
      }

    //   const mappedBatch = batch.map(doc => ({
    //     _id: doc._id,
    //     title: doc.title,
    //     url: doc.url,
    //     kym_url: doc.kym_url,
    //     image_url: doc.image_url,
    //     image_alt_text: doc.image_alt_text,
    //     image_title: doc.image_title,
    //     // ... include other required properties
    //   } as MemeEntry));

      await processMemeBatch(batch as MemeEntry[]);
      processed += batch.length;
      console.log(`Processed ${processed} memes. Total processed so far: ${processed}`);

      if (processed >= maxItemsToProcess) {
        console.log(`Reached maximum number of items to process (${maxItemsToProcess}). Total processed: ${processed}`);
        break;
      }
    }

    console.log(`Meme processing complete. Total memes processed: ${processed}`);

  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();