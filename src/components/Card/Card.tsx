"use client";

import styles from "./Card.module.css";
import Image from "next/image";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";

type CardInterface = {
  id: string;
  title: string;
  true_title: string;
  sources: string[];
  size: string;
  extension: string;
  description: string;
  cover: string;
};

function Card({
  id,
  title,
  true_title,
  sources,
  size,
  extension,
  description,
  cover,
}: CardInterface) {
  return (
    <div className={styles.wrapper}>
      {cover ? (
        <ImageWithFallback
          unoptimized={true}
          src={cover}
          fallbackSrc={"/placeholder_dark.avif"}
          alt="Cover image of a book"
          height={102}
          width={72}
          className={styles.cover}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Image
          src={"/placeholder_light.avif"}
          alt="Placeholder image"
          height={102}
          width={72}
          className={styles.cover}
          unoptimized={true} // Optimizing avif increases file size
        />
      )}
      <div className={styles.bookInfo}>
        <span className={styles.title}>{title}</span>
        <span className={styles.true_title}>{true_title}</span>
        <span className={styles.source}>{sources.join(" | ")}</span>
      </div>

      <div className={styles.fileInfo}>
        <span className={styles.size}>{size} MB</span>
        <span className={styles.extension}>{extension}</span>
      </div>
    </div>
  );
}

export default Card;
