import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  await sql.unsafe(`
    create table if not exists tags (
      id uuid primary key default gen_random_uuid() not null,
      slug varchar(80) not null unique,
      name varchar(120) not null
    );
  `);

  await sql.unsafe(`
    create table if not exists post_tags (
      post_id uuid not null,
      tag_id uuid not null,
      constraint post_tags_post_id_tag_id_pk primary key (post_id, tag_id)
    );
  `);

  await sql.unsafe(`
    do $$
    begin
      if not exists (
        select 1 from pg_constraint where conname = 'post_tags_post_id_posts_id_fk'
      ) then
        alter table post_tags
          add constraint post_tags_post_id_posts_id_fk
          foreign key (post_id) references posts(id) on delete cascade;
      end if;
      if not exists (
        select 1 from pg_constraint where conname = 'post_tags_tag_id_tags_id_fk'
      ) then
        alter table post_tags
          add constraint post_tags_tag_id_tags_id_fk
          foreign key (tag_id) references tags(id) on delete cascade;
      end if;
    end $$;
  `);

  console.log("Tag tables ready");
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
