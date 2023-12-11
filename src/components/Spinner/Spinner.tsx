import React from "react";
import { Hexagon } from "react-feather";

import styles from "./Spinner.module.css";

interface SpinnerInterface {
  color: string | undefined;
  size: string | number | undefined;
  isLoading: boolean | undefined;
}

const Spinner = ({ color, size, isLoading }: SpinnerInterface) => {
  return (
    <div className={`${styles.wrapper} ${isLoading && styles.loading}`}>
      <Hexagon color={color} size={size} />
    </div>
  );
};

export default Spinner;
