import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container py-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold mb-4">Hello, I&apos;m Vinit Agrawal</h1>
        <p className="text-lg text-muted-foreground mb-8">
          A Software Engineer and Founder & CTO of <a href="https://www.hellotars.com" className="underline">TARS</a>.
          Tars is a Conversational AI Agent/Chatbots Platform since 2015.
        </p>
        <Image
          src="https://vinit-agrawal-website.s3.amazonaws.com/vinitagr_A_programmer_working_on_a_laptop_happy_and_excited_in__cb06978c-3a86-4c64-acfb-edb9e60e66a5.webp"
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
