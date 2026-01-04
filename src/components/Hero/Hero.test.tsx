/*
 Этот файл проверяет компонент Hero.
 Он подтверждает, что на экране есть приветственный текст, ссылки и изображение.
 Человек напрямую с тестами не взаимодействует, они только фиксируют ожидаемое поведение.
*/
import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

// Этот блок проверяет ключевые элементы первого экрана.
describe("Hero", () => {
  // Этот тест убеждается, что заголовок и подзаголовок видны.
  it("показывает основной текст приветствия", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { name: "BENO — больше, чем кофе" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Заходите смелее — кофе уже заждался!")
    ).toBeInTheDocument();
  });

  // Этот тест убеждается, что есть ссылка на карту и изображение.
  it("показывает ссылку на карту и изображение", () => {
    render(<Hero />);

    expect(
      screen.getByRole("link", { name: "Как добраться" })
    ).toHaveAttribute("href", "/map");
    expect(
      screen.getByAltText(
        "Интерьер кофейни BENO с тёплым светом и чашкой кофе"
      )
    ).toBeInTheDocument();
  });
});
