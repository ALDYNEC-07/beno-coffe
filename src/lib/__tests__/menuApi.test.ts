// Этот файл проверяет загрузку меню с сервера и поиск позиции по id.
// Он нужен, чтобы убедиться: мы строим правильный адрес и корректно читаем ответы.
import { headers } from "next/headers";
import { fetchMenuItemById, fetchMenuItems } from "@/lib/menuApi";

// Этот блок заменяет реальные заголовки на тестовые.
jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

// Этот помощник управляет фейковыми заголовками в тестах.
const headersMock = headers as jest.MockedFunction<typeof headers>;

describe("menuApi helpers", () => {
  beforeEach(() => {
    // Этот блок сбрасывает моки перед каждым тестом.
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  // Этот блок проверяет, что адрес собирается из заголовков и данные читаются как массив.
  test("fetchMenuItems builds URL from headers and returns array data", async () => {
    headersMock.mockResolvedValue({
      get: (key: string) => {
        if (key === "host") return "example.com";
        if (key === "x-forwarded-proto") return "https";
        return null;
      },
    } as Headers);

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
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

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
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({ ok: false });

    const items = await fetchMenuItems();

    expect(items).toEqual([]);
  });

  // Этот блок проверяет, что сетевая ошибка не ломает страницу и возвращает пустой список.
  test("fetchMenuItems returns empty list when fetch throws", async () => {
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockRejectedValue(new Error("Network error"));

    const items = await fetchMenuItems();

    expect(items).toEqual([]);
  });

  // Этот блок проверяет, что битый JSON не приводит к падению и возвращает пустой список.
  test("fetchMenuItems returns empty list on invalid json", async () => {
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

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
    headersMock.mockResolvedValue({
      get: () => null,
    } as Headers);

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

  // Этот блок проверяет поиск позиции по id, даже если типы отличаются.
  test("fetchMenuItemById finds item by stringified id", async () => {
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 10 }, { id: "20" }],
    });

    const item = await fetchMenuItemById(20);

    expect(item).toEqual({ id: "20" });
  });

  // Этот блок проверяет, что при отсутствии позиции возвращается null.
  test("fetchMenuItemById returns null when not found", async () => {
    headersMock.mockResolvedValue({
      get: (key: string) => (key === "host" ? "example.com" : "https"),
    } as Headers);

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 10 }],
    });

    const item = await fetchMenuItemById("missing");

    expect(item).toBeNull();
  });
});
