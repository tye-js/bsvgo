import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  const rows = await sql.unsafe(
    "select id, hash, created_at from drizzle.__drizzle_migrations order by created_at"
  );

  console.log(JSON.stringify(rows, null, 2));

  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
