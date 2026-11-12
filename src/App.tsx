import { lazy, Suspense } from "react";

import { Loader } from "@/components/Loader";

const Experience = lazy(() =>
  import("@/components/Experience").then((module) => ({
    default: module.Experience,
  })),
);

export function App() {
  return (
    <Suspense fallback={<Loader visible />}>
      <Experience />
    </Suspense>
  );
}
