// Этот файл проверяет загрузку меню с сервера.
// Он нужен, чтобы убедиться: мы строим правильный адрес и корректно читаем ответы.
import { headers } from "next/headers";
import { fetchMenuItems } from "@/lib/menuApi";

// Этот блок заменяет реальные заголовки на тестовые.
jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

// Этот помощник управляет фейковыми заголовками в тестах.
const headersMock = headers as jest.MockedFunction<typeof headers>;
const originalNodeEnv = process.env.NODE_ENV;
const originalVercelUrl = process.env.VERCEL_URL;

// Этот помощник подставляет тестовые заголовки одним объектом.
function mockHeaders(values: Record<string, string | null>) {
  headersMock.mockResolvedValue({
    get: (key: string) => values[key] ?? null,
  } as Headers);
}

describe("menuApi helpers", () => {
  beforeEach(() => {
    // Этот блок сбрасывает моки перед каждым тестом.
    jest.resetAllMocks();
    global.fetch = jest.fn();
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    if (originalVercelUrl === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = originalVercelUrl;
    }
  });

  // Этот блок проверяет, что адрес собирается из заголовков и данные читаются как массив.
  test("fetchMenuItems builds URL from headers and returns array data", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1 }, { id: 2 }],
    });

    const items = await fetchMenuItems();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/menu-with-variants",
      { next: { revalidate: 300 } }
    );
    expect(items).toHaveLength(2);
  });

  // Этот блок проверяет, что список берется из поля results.
  test("fetchMenuItems normalizes results wrapper", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: "a" }] }),
    });

    const items = await fetchMenuItems();

    expect(items).toEqual([{ id: "a" }]);
  });

  // Этот блок проверяет, что при ошибке возвращается пустой список.
  test("fetchMenuItems returns empty list on error", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({ ok: false });

    const items = await fetchMenuItems();

    expect(items).toEqual([]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://example.com/api/menu-with-variants",
      { next: { revalidate: 300 } }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://example.com/api/menu-with-variants",
      { cache: "no-store" }
    );
  });

  // Этот блок проверяет, что сетевая ошибка не ломает страницу и возвращает пустой список.
  test("fetchMenuItems returns empty list when fetch throws", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockRejectedValue(new Error("Network error"));

    const items = await fetchMenuItems();

    expect(items).toEqual([]);
  });

  // Этот блок проверяет, что битый JSON не приводит к падению и возвращает пустой список.
  test("fetchMenuItems returns empty list on invalid json", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const items = await fetchMenuItems();

    expect(items).toEqual([]);
  });

  // Этот блок проверяет запасной адрес, если заголовок host отсутствует.
  test("fetchMenuItems falls back to localhost without host header", async () => {
    mockHeaders({});

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await fetchMenuItems();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/menu-with-variants",
      { next: { revalidate: 300 } }
    );
  });

  // Этот блок проверяет, что в продакшене используется запасной адрес VERCEL_URL.
  test("fetchMenuItems uses VERCEL_URL in production when headers are missing", async () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_URL = "beno-coffee.vercel.app";
    mockHeaders({});

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await fetchMenuItems();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://beno-coffee.vercel.app/api/menu-with-variants",
      { next: { revalidate: 300 } }
    );
  });

  // Этот блок проверяет повторный запрос без кеша после неудачи первого ответа.
  test("fetchMenuItems retries without cache after failed first response", async () => {
    mockHeaders({
      host: "example.com",
      "x-forwarded-proto": "https",
    });

    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "fallback" }],
      });

    const items = await fetchMenuItems();

    expect(items).toEqual([{ id: "fallback" }]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://example.com/api/menu-with-variants",
      { next: { revalidate: 300 } }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://example.com/api/menu-with-variants",
      { cache: "no-store" }
    );
  });
});
