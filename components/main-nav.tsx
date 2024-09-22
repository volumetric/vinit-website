import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Remove or comment out the unused projectCategories variable
// const projectCategories = [
//   { name: "Apps", href: "/projects?category=apps" },
//   { name: "Games", href: "/projects?category=games" },
//   { name: "Videos", href: "/projects?category=videos" },
//   { name: "Image Art", href: "/projects?category=image-art" },
// ]

const tools = [
  { 
    name: "Image Generator", 
    href: "https://my-app-orcin-three.vercel.app/generate-image",
    description: "Create unique images using AI technology.",
    external: true
  },
  { 
    name: "Emoji Maker", 
    href: "https://emoji-maker-eight.vercel.app/",
    description: "Design custom emojis for your messages and social media.",
    external: true
  },
  {
    name: "OpenAPI Describer",
    href: "/openapi-describer",
    description: "Analyze and describe OpenAPI specifications with ease.",
    external: false
  },
]

export function MainNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold">
          Home
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="space-x-4">
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="text-xl px-2">About</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className="text-xl px-2">Contact</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {/* <NavigationMenuItem>
              <NavigationMenuTrigger className="text-xl px-2">Projects</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {projectCategories.map((category) => (
                    <li key={category.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={category.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-xl"
                        >
                          {category.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-xl px-2">Tools</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                  {tools.map((tool) => (
                    <li key={tool.name}>
                      <NavigationMenuLink asChild>
                        <a
                          href={tool.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          target={tool.external ? "_blank" : "_self"}
                          rel={tool.external ? "noopener noreferrer" : ""}
                        >
                          <div className="text-lg font-medium leading-none">{tool.name}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {tool.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle />
      </div>
    </nav>
  )
}