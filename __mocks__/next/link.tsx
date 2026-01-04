/*
 Этот файл подменяет компонент next/link для тестов.
 Он показывает обычную ссылку с тем же адресом.
 Человек не взаимодействует с ним напрямую, это нужно для проверок.
*/
import React from "react";

// Этот компонент выводит обычную ссылку, чтобы тесты были проще.
const NextLink = ({
  href,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"a"> & { href: string }) => {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

export default NextLink;
