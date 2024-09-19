# Project Overview
- This is the personal Vinit agrawal. He is in software engineer by profession and he is also the founder CTO of stars TARS, a conversational AI chatbot company building an AI Agent and Chatbot platform since 2015.


# Feature Requirements
- We will use Next.js, Shadcn, Lucid, Supabase.
- It should have both light mode and dark mode, and it should have dark mode to be the default.


# Website Layout

## Home Page
- Website will have a `Navigation Menu` Component from Shadcn, at the top of the page. It should have "Projects" option that will take the use to the 'Projects Gallery' page. hovering over it will show different categories of Projects. Keep it: "Apps", "Games", "Videos", "Image Art" for now.
- This Navigation Menu should be at the top and sticky at the top of the page, i.e. should not move on page scroll.
- This Mavigation menu should be in all the pages of this website. Incliuding all the pages I have described below.
- At the top left corner of thie Navigation menu, have button saying "Home", clicking on which will take the user to this "Home Page" from wherever they are in the website
- Have a "Contact Me" option in this Navigation menu, that will take the user to a Contact Me page. That has all of my contact details. Like Email, Phone number, Linkedin, Twitter, Youtube Channel link, etc.
- Have an "About Me" option in this Navigation menu, that will take the user to a About Me page. That has some snippet about me, about my life etc. Add a component where a large text can be added with different paragraphs.


## Projects Gallery Page
- The 'Projects Gallery Page', will have the list of all the projects that the author has worked on. Categorized by different cateogries. They will be visible as Card. You should use the `Card` component from Shadcn to do this.
- These Cards will be laid down on a grid, with 4 cards in each row.
- At the top of this grid, on the left side, there should be a dropdown with all the Project Categories. i.e. "Apps", "Games", "Videos", "Image Art". Use the `dropdown menu` component by shadcn.
- At the top of this grid, on the right side, there should be a search option to search and filter the projects. Use the `input` component by shadcn for this.

- These Project cards in the grid will have an image thumbnail, a project title and a few lines of description. And the tag for the category it belongs to. Make a good card layout using the relevant components from the Shadcn library.
- When clicked on any of the Projects, it will take the user to the 'Individual Project Page' for that Project
- This page should have `Breadcrumb` component from Shadcn at the relevant top left of the page, showing that this is a child page of the main 'Home Page'.


## Individual Project Page
- The 'Individual Project Pages' will have all the details about that specific project like Project title, description, screenshots, app/demo links, github links, etc.
- This page should have `Breadcrumb` component from Shadcn at the relevant top left of the page, showing that this is a child page of the 'Project Gallary Page'.


# Relevant Docs


# Current File structure
VINIT-WEBSITE
├── .next
├── app
│   ├── fonts
│   └── projects
│       ├── [id]
│       │   └── page.tsx
│       └── page.tsx
├── components
│   └── ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── footer.tsx
│       ├── main-nav.tsx
│       ├── mode-toggle.tsx
│       ├── project-card.tsx
│       └── theme-provider.tsx
├── lib
├── node_modules
├── requirements
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
├── frontend-instructions.md
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json


#Rules
- All new components should go in /components folder and be named like example-component.tsx unless otherwise specified
- All new pages go in /app folder