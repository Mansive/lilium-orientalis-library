"use client";
import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string;
}

// https://stackoverflow.com/a/66953317
const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [isUnoptimized, setIsUnoptimized] = useState(false);

  return (
    <Image
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
        setIsUnoptimized(true);
      }}
      unoptimized={isUnoptimized}
    />
  );
};

export default ImageWithFallback;
