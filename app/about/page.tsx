import { Breadcrumb } from "@/components/breadcrumb"

export default function AboutPage() {
  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Me", href: "/about" }]} />
      <h1 className="text-4xl font-bold mb-8">About Me</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          Hello! I&apos;m Vinit Agrawal, I am a Programmer by Profession. I am also the founder and CTO of TARS, 
          a conversational AI chatbot company that I&apos;ve been building since 2015.
        </p>
        <p>
          My journey in the world of technology began... [Add more paragraphs about your life, experiences, and interests here]
        </p>
        <p>
          When I&apos;m not coding or brainstorming new AI solutions, you can find me... [Add some personal interests or hobbies]
        </p>
        <p>
          I&apos;m always excited to connect with fellow tech enthusiasts and innovators. Feel free to reach out if you&apos;d like to 
          discuss AI, software engineering, or just have a friendly chat!
        </p>
      </div>
    </div>
  )
}