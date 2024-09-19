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
          <a href="mailto:vinit@example.com" className="text-blue-600 hover:underline">vinit@example.com</a>
        </div>
        <div className="flex items-center space-x-4">
          <Phone className="w-6 h-6" />
          <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a>
        </div>
        <div className="flex items-center space-x-4">
          <Linkedin className="w-6 h-6" />
          <a href="https://www.linkedin.com/in/vinitagrawal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <Twitter className="w-6 h-6" />
          <a href="https://twitter.com/vinitagrawal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twitter Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <Youtube className="w-6 h-6" />
          <a href="https://www.youtube.com/channel/UCxxxxxxxx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube Channel</a>
        </div>
      </div>
    </div>
  )
}