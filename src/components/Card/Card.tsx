"use client";

import styles from "./Card.module.css";
import Image from "next/image";

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
        <Image
          src={cover}
          alt="Cover image of a book"
          height={102}
          width={72}
          className={styles.cover}
        />
      ) : (
        <Image
          src={"/placeholder.avif"}
          alt="Cover image of a book"
          height={102}
          width={72}
          className={styles.cover}
          unoptimized={true}
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
