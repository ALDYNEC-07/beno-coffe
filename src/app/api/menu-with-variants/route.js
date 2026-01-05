// Этот файл обслуживает запрос /api/menu-with-variants и отдает меню с вариантами.
import { fetchBaserowTable, getBaserowEnv } from "@/lib/baserow";

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
    "BASEROW_VARIANTS_TABLE_ID",
    "BASEROW_TOKEN",
  ]);

  if (missing.length > 0) {
    return Response.json(
      { error: "Missing Baserow configuration", missing },
      { status: 500 }
    );
  }

  // Этот блок делает два запроса параллельно: меню и таблицу вариантов.
  const [menuRes, variantsRes] = await Promise.all([
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
  ]);

  if (!menuRes.ok || !variantsRes.ok) {
    // Если хотя бы один запрос не удался, возвращаем 500.
    const status = !menuRes.ok ? menuRes.status : variantsRes.status;
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

  // Этот блок возвращает меню вместе с вариантами.
  return Response.json(menuWithVariants);
}
