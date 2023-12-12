"use client";
import { useEffect, useRef } from "react";

import Card from "@/components/Card";

import { Book } from "@/data/book-data";

import styles from "./SearchResultList.module.css";

interface SearchResultListInterface {
  searchResults: Book[] | null;
}

function SearchResultList({ searchResults }: SearchResultListInterface) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScrolling = (event: WheelEvent) => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollTop + event.deltaY * 1.2,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("wheel", handleScrolling);

    return () => {
      window.removeEventListener("wheel", handleScrolling);
    };
  }, []);

  return (
    <div ref={listRef} className={styles.searchResultList}>
      {searchResults?.map((book) => (
        <Card
          key={book.id}
          id={book.id}
          title={book.title}
          sources={book.sources}
          size={book.size}
          extension={book.extension}
        />
      ))}
    </div>
  );
}

export default SearchResultList;
