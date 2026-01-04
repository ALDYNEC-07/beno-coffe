/*
 Этот файл подменяет компонент next/image для тестов.
 Он показывает обычную картинку img с переданными параметрами.
 Человек не взаимодействует с ним напрямую, это нужно для проверок.
*/
import React from "react";

// Этот компонент заменяет сложное изображение простой картинкой для тестов.
const NextImage = ({
  src,
  alt,
  ...rest
}: Omit<React.ComponentPropsWithoutRef<"img">, "src"> & {
  src: string | { src?: string };
  alt?: string;
  fill?: boolean;
}) => {
  const resolvedSrc = typeof src === "string" ? src : src?.src ?? "";

  return <img src={resolvedSrc} alt={alt ?? ""} {...rest} />;
};

export default NextImage;
