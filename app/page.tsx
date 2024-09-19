import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container py-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold mb-4">Hello, I'm Vinit Agrawal</h1>
        <p className="text-lg text-muted-foreground mb-8">
          A passionate Software Engineer and Founder & CTO of <a href="https://www.startstars.com" className="underline">Stars TARS</a>, building conversational AI chatbots since 2015.
        </p>
        <Image
          src="/images/vinit-arcade.png"
          alt="Vinit in 90s Cartoon Style"
          width={300}
          height={300}
          className="mx-auto mb-8 rounded-full"
        />
        <p className="text-md">
          Welcome to my personal website! Explore my projects, learn more about my work, and get in touch.
        </p>
      </section>
    </div>
  );
}
