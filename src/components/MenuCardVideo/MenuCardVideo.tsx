/*
 Этот файл определяет фон-видео для карточки меню.
 Он показывает анимацию только у выбранной позиции и останавливает ее у остальных.
 Человек видит движение лишь у активной карточки и не отвлекается на другие.
*/
"use client";
import { useEffect, useRef } from "react";

type MenuCardVideoProps = {
  src: string;
  isActive: boolean;
  wrapperClassName: string;
  videoClassName: string;
};

// Этот компонент показывает фоновое видео карточки и управляет его запуском.
export default function MenuCardVideo({
  src,
  isActive,
  wrapperClassName,
  videoClassName,
}: MenuCardVideoProps) {
  // Этот объект хранит доступ к тегу видео, чтобы запускать и останавливать его.
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Этот блок запускает видео для выбранной карточки и ставит его на паузу у остальных.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isActive) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isActive]);

  return (
    // Этот блок выводит видеофон внутри карточки.
    <div className={wrapperClassName} aria-hidden="true">
      <video
        ref={videoRef}
        className={videoClassName}
        autoPlay={isActive}
        muted
        loop
        playsInline
        preload={isActive ? "auto" : "metadata"}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
