/*
 Этот файл проверяет компонент Features.
 Он подтверждает, что секция преимуществ показывает заголовок и карточки.
 Человек напрямую с тестами не взаимодействует, они только фиксируют ожидаемое поведение.
*/
import { render, screen } from "@testing-library/react";
import Features from "./Features";

// Этот блок проверяет отображение ключевых преимуществ кофейни.
describe("Features", () => {
  // Этот тест убеждается, что секция имеет правильный заголовок и якорь.
  it("показывает заголовок и якорь секции", () => {
    render(<Features />);

    const section = screen.getByRole("region", {
      name: "Ключевые преимущества BENO coffee",
    });

    expect(section).toHaveAttribute("id", "features");
    expect(
      screen.getByRole("heading", { name: "Почему BENO" })
    ).toBeInTheDocument();
  });

  // Этот тест убеждается, что все карточки преимуществ видны на экране.
  it("показывает карточки с преимуществами", () => {
    render(<Features />);

    expect(screen.getByText("Отличный кофе")).toBeInTheDocument();
    expect(screen.getByText("Уютная атмосфера")).toBeInTheDocument();
    expect(screen.getByText("Свежая выпечка")).toBeInTheDocument();
  });
});
