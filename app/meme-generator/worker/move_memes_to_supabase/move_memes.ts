import { createClient } from '@supabase/supabase-js'
import { connectToDatabase } from '../../../shared/mongodb'
import { Collection } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Types based on meme_scraper_and_inserter.ts
interface ContentItem {
  heading: string
  text: string[]
  image_url: string[]
  a_urls: string[]
  yt_videoid: string[]
}

interface MemeTemplate {
  _id?: string
  title: string
  url: string
  kym_url: string
  image_url: string
  image_alt_text: string
  image_title: string
  metadata: {
    category: string
    status: string
    types: string[]
    year: string
    origin: string
    tags: string[]
  }
  stats: {
    fav_count: number
    views_count: number
    videos_count: number
    photos_count: number
    comments_count: number
  }
  image: {
    image_url: string
    image_alt_text: string
    image_title: string
  }
  content: ContentItem[]
  parent: {
    name: string
    url: string
  } | null
  added_on: {
    date: string
    user: string
  }
  last_changed_on: {
    date: string
    user: string
  }
  external_reference_urls: string[]
  created_at?: Date
  updated_at?: Date
}

// Add a custom error type
interface MigrationError extends Error {
  totalProcessed?: number
}

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configuration
const BATCH_SIZE = 10
const START_PAGE = 501  // Change this to resume from a specific page

async function migrateMemesBatch(collection: Collection, page: number): Promise<{ count: number, hasMore: boolean }> {
  try {
    // Calculate skip value for pagination
    const skip = page * BATCH_SIZE

    // Fetch batch of documents from MongoDB
    const memes = await collection
      .find({})
      .skip(skip)
      .limit(BATCH_SIZE)
      .toArray() as unknown as MemeTemplate[]

    if (memes.length === 0) {
      return { count: 0, hasMore: false }
    }

    console.log(`\nProcessing batch ${page + 1} (documents ${skip + 1} to ${skip + memes.length})...`)

    // Transform the data to match Supabase schema
    const transformedMemes = memes.map((meme: MemeTemplate) => ({
      id: meme._id?.toString(),
      title: meme.title,
      url: meme.url,
      kym_url: meme.kym_url,
      image_url: meme.image_url,
      image_alt_text: meme.image_alt_text,
      image_title: meme.image_title,
      metadata: meme.metadata || {
        category: '',
        status: '',
        types: [],
        year: '',
        origin: '',
        tags: []
      },
      stats: meme.stats || {
        fav_count: 0,
        views_count: 0,
        videos_count: 0,
        photos_count: 0,
        comments_count: 0
      },
      image: meme.image || {
        image_url: '',
        image_alt_text: '',
        image_title: ''
      },
      content: meme.content || [],
      parent: meme.parent,
      added_on: meme.added_on || {
        date: '',
        user: ''
      },
      last_changed_on: meme.last_changed_on || {
        date: '',
        user: ''
      },
      external_reference_urls: meme.external_reference_urls || [],
      created_at: meme.created_at || new Date(),
      updated_at: meme.updated_at || new Date()
    }))

    // Insert batch into Supabase
    const { error } = await supabase
      .from('meme_templates_kym')
      .upsert(transformedMemes, {
        onConflict: 'id'
      })

    if (error) {
      console.error(`❌ Error inserting batch ${page + 1}:`, error)
      throw error
    }

    console.log(`✅ Successfully inserted batch ${page + 1} (${memes.length} documents)`)
    
    // Log the titles of processed memes
    memes.forEach((meme: MemeTemplate, index: number) => {
      console.log(`   ${skip + index + 1}. ${meme.title}`)
    })

    return { 
      count: memes.length, 
      hasMore: memes.length === BATCH_SIZE 
    }
  } catch (error) {
    console.error(`❌ Failed to process batch ${page + 1}:`, error)
    throw error
  }
}

async function migrateMemes() {
  let totalProcessed = 0

  try {
    // Connect to MongoDB using the shared connection
    const { db } = await connectToDatabase()
    const collection = db.collection('meme-templates-kym')

    // Get total count of documents
    const totalDocs = await collection.countDocuments()
    console.log(`\nTotal documents to migrate: ${totalDocs}`)
    console.log(`Starting from page ${START_PAGE + 1}`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log('='.repeat(50))

    let currentPage = START_PAGE
    let hasMore = true

    while (hasMore) {
      const { count, hasMore: moreDocuments } = await migrateMemesBatch(collection, currentPage)
      hasMore = moreDocuments
      totalProcessed += count
      
      // Progress update
      const progress = (totalProcessed / totalDocs) * 100
      console.log(`\nProgress: ${totalProcessed}/${totalDocs} (${progress.toFixed(2)}%)`)
      console.log('='.repeat(50))

      currentPage++

      // Optional: Add a small delay between batches to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n✨ Migration complete! Total documents processed: ${totalProcessed}`)

  } catch (error) {
    const migrationError: MigrationError = new Error('Migration failed')
    migrationError.totalProcessed = totalProcessed
    migrationError.stack = error instanceof Error ? error.stack : undefined
    
    console.error('\n❌ Migration failed:', error)
    if (totalProcessed > 0) {
      const resumePage = Math.floor(totalProcessed / BATCH_SIZE)
      console.log(`\n⚠️ To resume migration, set START_PAGE to ${resumePage}`)
    }
    
    throw migrationError
  }
}

// Run the migration with proper error handling
migrateMemes().catch((error: unknown) => {
  console.error('Migration script failed:', error)
  process.exit(1)
})