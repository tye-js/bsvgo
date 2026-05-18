import postgres from "postgres";

// One-time production repair helper kept for historical recovery only.
// Do not use this for routine migration work.
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  await sql.unsafe(`
    create schema if not exists drizzle;
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    );
  `);

  await sql.unsafe(`
    insert into drizzle.__drizzle_migrations (hash, created_at)
    select '0000_bsvgo_blog', 1778572496344
    where not exists (
      select 1 from drizzle.__drizzle_migrations where created_at = 1778572496344
    );
  `);

  console.log("Migration state repaired");
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
