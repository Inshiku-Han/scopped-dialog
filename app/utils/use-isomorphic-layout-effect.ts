import { useEffect, useLayoutEffect } from "react";

const isBrowser = typeof window !== "undefined";

export default isBrowser ? useLayoutEffect : useEffect;
