import { fetchBaserowTable, getBaserowEnv } from "@/lib/baserow";
import { parseNumericValue } from "@/lib/number";

const BASEROW_ENV_KEYS = [
  "BASEROW_API_URL",
  "BASEROW_TABLE_ID",
  "BASEROW_VARIANTS_TABLE_ID",
  "BASEROW_SIZES_TABLE_ID",
  "BASEROW_TOKEN",
];

type BaserowRecord = Record<string, unknown>;

// Эта функция приводит поле ссылок к списку объектов одного вида.
function normalizeLinks(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as BaserowRecord[];
  }
  if (value && typeof value === "object") {
    return [value as BaserowRecord];
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [{ id: value }];
}

// Этот обработчик возвращает данные меню вместе с вариантами.
export async function GET() {
  const { values, missing } = getBaserowEnv(BASEROW_ENV_KEYS);
  if (missing.length > 0) {
    return Response.json(
      { error: "Missing Baserow configuration", missing },
      { status: 500 }
    );
  }

  const [menuRes, variantsRes, sizesRes] = await Promise.all([
    fetchBaserowTable({
      baseUrl: values.BASEROW_API_URL,
      tableId: values.BASEROW_TABLE_ID,
      token: values.BASEROW_TOKEN,
    }),
    fetchBaserowTable({
      baseUrl: values.BASEROW_API_URL,
      tableId: values.BASEROW_VARIANTS_TABLE_ID,
      token: values.BASEROW_TOKEN,
    }),
    fetchBaserowTable({
      baseUrl: values.BASEROW_API_URL,
      tableId: values.BASEROW_SIZES_TABLE_ID,
      token: values.BASEROW_TOKEN,
    }),
  ]);

  if (!menuRes.ok || !variantsRes.ok || !sizesRes.ok) {
    const status = !menuRes.ok
      ? menuRes.status
      : !variantsRes.ok
      ? variantsRes.status
      : sizesRes.status;
    return Response.json(
      { error: "Baserow request failed", status },
      { status: 500 }
    );
  }

  const menuItems = Array.isArray(menuRes.data?.results)
    ? (menuRes.data.results as BaserowRecord[])
    : [];
  const variants = Array.isArray(variantsRes.data?.results)
    ? (variantsRes.data.results as BaserowRecord[])
    : [];
  const sizes = Array.isArray(sizesRes.data?.results)
    ? (sizesRes.data.results as BaserowRecord[])
    : [];

  const sizeMlById = new Map(
    sizes.map((size) => {
      const mlValue = parseNumericValue(size?.ml);
      return [String(size?.id), Number.isFinite(mlValue) ? mlValue : null];
    })
  );

  const itemsById = new Map<string, BaserowRecord>();
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
    const sizeId = sizeLink?.id ?? null;
    const sizeName =
      sizeLink?.value ??
      sizeLink?.name ??
      sizeLink?.label ??
      sizeLink?.id ??
      null;
    const price = variant?.price ?? null;
    const ml =
      sizeId !== null && sizeId !== undefined
        ? sizeMlById.get(String(sizeId)) ?? null
        : null;

    itemLinks.forEach((link) => {
      const target = itemsById.get(String(link?.id));
      if (!target) {
        return;
      }
      target.variants.push({ sizeName, ml, price });
    });
  });

  menuWithVariants.forEach((item) => {
    item.variants.sort((a: BaserowRecord, b: BaserowRecord) => {
      const aMl = parseNumericValue(a?.ml);
      const bMl = parseNumericValue(b?.ml);
      const aValid = Number.isFinite(aMl);
      const bValid = Number.isFinite(bMl);
      if (aValid && bValid) {
        return aMl - bMl;
      }
      if (aValid) {
        return -1;
      }
      if (bValid) {
        return 1;
      }
      return 0;
    });
  });

  return Response.json(menuWithVariants);
}
