export async function GET() {
  const baseUrl = process.env.BASEROW_API_URL;
  const tableId = process.env.BASEROW_TABLE_ID;
  const token = process.env.BASEROW_TOKEN;

  const url = `${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Token ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json(
      { error: "Baserow request failed", status: res.status },
      { status: 500 }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
