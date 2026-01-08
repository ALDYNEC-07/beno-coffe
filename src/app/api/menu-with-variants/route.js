// Этот файл обслуживает запрос /api/menu-with-variants и отдает меню с вариантами.
import { fetchBaserowTable, getBaserowEnv } from "@/lib/baserow";
import { parseNumericValue } from "@/lib/number";

// Эта функция приводит поле со ссылками к списку объектов одного вида.
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

// Этот обработчик загружает меню и варианты, склеивает их и возвращает JSON.
export async function GET() {
  // Этот блок собирает настройки доступа к Baserow и проверяет их наличие.
  const { values, missing } = getBaserowEnv([
    "BASEROW_API_URL",
    "BASEROW_TABLE_ID",
    "BASEROW_SIZES_TABLE_ID",
    "BASEROW_VARIANTS_TABLE_ID",
    "BASEROW_TOKEN",
  ]);

  if (missing.length > 0) {
    return Response.json(
      { error: "Missing Baserow configuration", missing },
      { status: 500 }
    );
  }

  // Этот блок делает запросы параллельно: меню, таблицу вариантов и размеры.
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
    // Если хотя бы один запрос не удался, возвращаем 500.
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

  // Этот блок вытаскивает строки из ответов Baserow.
  const menuItems = Array.isArray(menuRes.data?.results)
    ? menuRes.data.results
    : [];
  const variants = Array.isArray(variantsRes.data?.results)
    ? variantsRes.data.results
    : [];
  const sizes = Array.isArray(sizesRes.data?.results)
    ? sizesRes.data.results
    : [];

  // Этот блок собирает быстрый поиск объема по идентификатору размера.
  const sizeMlById = new Map(
    sizes.map((size) => {
      const mlValue = parseNumericValue(size?.ml);
      return [String(size?.id), Number.isFinite(mlValue) ? mlValue : null];
    })
  );

  // Этот блок готовит быстрый поиск позиции по ее id.
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

  // Этот блок раскладывает варианты по соответствующим позициям меню.
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

  // Этот блок сортирует варианты по объему, чтобы размеры шли по возрастанию.
  menuWithVariants.forEach((item) => {
    item.variants.sort((a, b) => {
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

  // Этот блок возвращает меню вместе с вариантами.
  return Response.json(menuWithVariants);
}
