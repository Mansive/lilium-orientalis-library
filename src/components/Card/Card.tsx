"use client";

import styles from "./Card.module.css";

type CardInterface = {
  id: string;
  title: string;
  sources: string[];
  size: string;
  extension: string;
};

function Card({ id, title, sources, size, extension }: CardInterface) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.bookInfo}>
        <span className={styles.title}>{title}</span>
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
