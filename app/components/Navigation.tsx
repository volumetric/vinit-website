import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav>
      {/* ... existing navigation items ... */}
      <Link href="/meme-generator">
        <a>Meme Generator</a>
      </Link>
    </nav>
  );
};

export default Navigation;