create table if not exists meme_templates_kym (
  id text primary key,
  title text not null,
  url text,
  kym_url text,
  image_url text,
  image_alt_text text,
  image_title text,
  metadata jsonb,
  stats jsonb,
  image jsonb,
  content jsonb,
  parent jsonb,
  added_on jsonb,
  last_changed_on jsonb,
  external_reference_urls text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists meme_templates_kym_title_idx on meme_templates_kym (title);
create index if not exists meme_templates_kym_created_at_idx on meme_templates_kym (created_at);

-- Enable row level security
alter table meme_templates_kym enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
  on meme_templates_kym
  for select
  to anon
  using (true);