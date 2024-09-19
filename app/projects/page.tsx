import { ProjectCard } from "@/components/project-card"
import { ProjectFilter } from "@/components/project-filter"
import { ProjectSearch } from "@/components/project-search"
import { Breadcrumb } from "@/components/breadcrumb"

const projects = [
  { id: 1, title: "Project 1", description: "Description 1", image: "/images/project1.jpg", category: "Apps" },
  { id: 2, title: "Project 2", description: "Description 2", image: "/images/project2.jpg", category: "Games" },
  // Add more projects as needed
]

export default function ProjectsPage() {
  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }]} />
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <ProjectFilter />
        <ProjectSearch />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}