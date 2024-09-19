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

const projectCategories = [
  { name: "Apps", href: "/projects?category=apps" },
  { name: "Games", href: "/projects?category=games" },
  { name: "Videos", href: "/projects?category=videos" },
  { name: "Image Art", href: "/projects?category=image-art" },
]

export function MainNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-bold">
          Home
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
          <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink>About</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink>Contact</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {projectCategories.map((category) => (
                    <li key={category.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={category.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {category.name}
                        </Link>
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