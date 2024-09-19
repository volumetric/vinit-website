import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  project: {
    id: number
    title: string
    description: string
    image: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={project.image}
            alt={project.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2">{project.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.id}`} passHref>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}