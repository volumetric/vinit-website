import EmojiMaker from './components/EmojiMaker';
import EmojiGallery from './components/EmojiGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Emoji Generator</h1>
        <div className="flex justify-center mb-12">
          <EmojiMaker />
        </div>
        <EmojiGallery />
      </div>
    </div>
  );
}
