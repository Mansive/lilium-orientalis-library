"use client";
import { useRef } from "react";

import Card from "@/components/Card";

import { Book } from "@/data/book-data";

import styles from "./SearchResultList.module.css";

interface SearchResultListInterface {
  searchResults: Book[] | null;
}

function SearchResultList({ searchResults }: SearchResultListInterface) {
  const listRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const handleScrolling = (event: WheelEvent) => {
  //     if (listRef.current) {
  //       listRef.current.scrollTo({
  //         top: listRef.current.scrollTop + event.deltaY * 1.2,
  //         behavior: "smooth",
  //       });
  //     }
  //   };

  //   window.addEventListener("wheel", handleScrolling);

  //   return () => {
  //     window.removeEventListener("wheel", handleScrolling);
  //   };
  // }, []);

  // https://stackoverflow.com/a/48764436
  function round(num: number, decimalPlaces = 0) {
    var p = Math.pow(10, decimalPlaces);
    var n = num * p * (1 + Number.EPSILON);
    return Math.round(n) / p;
  }

  return (
    <div ref={listRef} className={styles.searchResultList}>
      {searchResults?.map((book) => (
        <Card
          key={book.id}
          id={book.id}
          title={book.title}
          sources={book.sources}
          size={round(book.size / 1048576, 2).toFixed(1)} // to mebibytes
          extension={book.extension}
        />
      ))}
    </div>
  );
}

export default SearchResultList;
