create table projects (
 id uuid primary key, title text not null, slug text unique not null, category text not null,
 service text, type text, client text, year int, role text, description text,
 cover_image text, gallery jsonb default '[]', challenge text, approach text, process text,
 deliverables text, tools text, featured boolean default false, sort_order int default 0,
 status text default 'draft', visibility text default 'public', access_token_hash text,
 client_only boolean default false, seo_title text, seo_description text, live_url text,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table brands (
 id uuid primary key, name text not null, logo_asset text not null, url text,
 sort_order int default 0, active boolean default true, created_at timestamptz default now()
);
create index projects_visibility_idx on projects(visibility);
create index projects_featured_idx on projects(featured);
