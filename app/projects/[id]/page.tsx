import { notFound } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"

// This would typically come from a database or API
const projects = [
  { id: 1, title: "Project 1", description: "Full description 1", image: "/images/project1.jpg", category: "Apps", demoLink: "https://demo1.com", githubLink: "https://github.com/user/repo1" },
  { id: 2, title: "Project 2", description: "Full description 2", image: "/images/project2.jpg", category: "Games", demoLink: "https://demo2.com", githubLink: "https://github.com/user/repo2" },
]

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = projects.find(p => p.id === parseInt(params.id))

  if (!project) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: project.title, href: `/projects/${project.id}` }
      ]} />
      <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
      <img src={project.image} alt={project.title} className="w-full max-w-2xl mb-4 rounded-lg" />
      <p className="mb-4 text-lg">{project.description}</p>
      <p className="mb-4 text-sm font-semibold">Category: {project.category}</p>
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <a href={project.demoLink} target="_blank" rel="noopener noreferrer">View Demo</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">GitHub Repo</a>
        </Button>
      </div>
    </div>
  )
}