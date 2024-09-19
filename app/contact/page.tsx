import { Breadcrumb } from "@/components/breadcrumb"
import { Mail, Phone, Linkedin, Twitter, Youtube } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Me", href: "/contact" }]} />
      <h1 className="text-4xl font-bold mb-8">Contact Me</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Mail className="w-6 h-6" />
          <a href="mailto:vinit@hellotars.com" className="text-blue-600 hover:underline">vinit@hellotars.com</a>
        </div>
        <div className="flex items-center space-x-4">
          <Linkedin className="w-6 h-6" />
          <a href="https://www.linkedin.com/in/vinitagr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <Twitter className="w-6 h-6" />
          <a href="https://x.com/vinit_agr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twitter Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <Youtube className="w-6 h-6" />
          <a href="https://www.youtube.com/@Vinit_Agrawal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube Channel</a>
        </div>
      </div>
    </div>
  )
}