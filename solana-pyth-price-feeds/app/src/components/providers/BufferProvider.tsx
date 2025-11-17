"use client";

import { useEffect } from "react";
import * as buffer from "buffer";

export function BufferProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.Buffer = buffer.Buffer;
    }
  }, []);

  return null;
}
