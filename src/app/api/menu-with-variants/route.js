function normalizeLinks(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (value && typeof value === "object") {
    return [value];
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [{ id: value }];
}

export async function GET() {
  const baseUrl = process.env.BASEROW_API_URL;
  const menuTableId = process.env.BASEROW_TABLE_ID;
  const variantsTableId = process.env.BASEROW_VARIANTS_TABLE_ID;
  const token = process.env.BASEROW_TOKEN;

  if (!baseUrl || !menuTableId || !variantsTableId || !token) {
    return Response.json(
      { error: "Missing Baserow configuration" },
      { status: 500 }
    );
  }

  const menuUrl = `${baseUrl}/api/database/rows/table/${menuTableId}/?user_field_names=true`;
  const variantsUrl = `${baseUrl}/api/database/rows/table/${variantsTableId}/?user_field_names=true`;

  const [menuRes, variantsRes] = await Promise.all([
    fetch(menuUrl, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    }),
    fetch(variantsUrl, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    }),
  ]);

  if (!menuRes.ok || !variantsRes.ok) {
    const status = !menuRes.ok ? menuRes.status : variantsRes.status;
    return Response.json(
      { error: "Baserow request failed", status },
      { status: 500 }
    );
  }

  const [menuData, variantsData] = await Promise.all([
    menuRes.json(),
    variantsRes.json(),
  ]);

  const menuItems = Array.isArray(menuData?.results) ? menuData.results : [];
  const variants = Array.isArray(variantsData?.results)
    ? variantsData.results
    : [];

  const itemsById = new Map();
  const menuWithVariants = menuItems.map((item) => {
    const mappedItem = {
      id: item?.id ?? null,
      name: item?.name ?? null,
      category: item?.category ?? null,
      description: item?.description ?? null,
      popular: item?.popular ?? null,
      variants: [],
    };

    if (item?.id !== null && item?.id !== undefined) {
      itemsById.set(String(item.id), mappedItem);
    }

    return mappedItem;
  });

  variants.forEach((variant) => {
    const itemLinks = normalizeLinks(variant?.item);
    const sizeLink = normalizeLinks(variant?.size)[0];
    const sizeName =
      sizeLink?.value ??
      sizeLink?.name ??
      sizeLink?.label ??
      sizeLink?.id ??
      null;
    const price = variant?.price ?? null;

    itemLinks.forEach((link) => {
      const target = itemsById.get(String(link?.id));
      if (!target) {
        return;
      }
      target.variants.push({ sizeName, price });
    });
  });

  return Response.json(menuWithVariants);
}
