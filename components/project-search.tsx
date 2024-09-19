"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export function ProjectSearch() {
  const [search, setSearch] = useState("")

  return (
    <Input
      type="search"
      placeholder="Search projects..."
      value={search}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      className="w-[300px]"
    />
  )
}