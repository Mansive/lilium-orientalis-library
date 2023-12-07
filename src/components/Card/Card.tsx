'use client'

import React from "react";
import Image from "next/image";

import styles from "./Card.module.css";

type CardInterface = {
  id: string;
  title: string;
  sources: string[];
  size: number;
  extension: string;
};

function Card({ id, title, sources, size, extension }: CardInterface) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.cover}>
        <Image src="/tevi.png" alt="TEVI" fill />
      </div>

      <div className={styles.infoWrapper}>
        <span className={styles.name}>{title}</span>
        <div>
          <span className={styles.type}>{extension}</span>
        </div>
        <span className={styles.source}>{sources}</span>
      </div>

      <div className={styles.size}>
        <span>{size} MB</span>
      </div>
    </div>
  );
}

export default Card;
