"use client";

import dynamic from "next/dynamic";
import styles from "./PadelBallCourt.module.css";

const PadelBallCourtCanvas = dynamic(() => import("./PadelBallCourtCanvas"), {
  ssr: false,
});

export default function PadelBallCourt({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`${styles.scene} ${className}`} aria-hidden="true">
      <span className={styles.label}>THE COURT IS THAT WAY</span>
      <PadelBallCourtCanvas />
      <span className={styles.note}>A LITTLE OUT OF BOUNDS</span>
    </div>
  );
}
