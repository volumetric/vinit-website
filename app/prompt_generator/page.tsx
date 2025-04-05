import dynamic from "next/dynamic";

const PromptGenerator = dynamic(() => import("./components/PromptGenerator"), {
  ssr: false,
});

export default function PromptGeneratorPage() {
  return (
    <main className="min-h-screen">
      <PromptGenerator />
    </main>
  );
}
