"use client";

import dynamic from "next/dynamic";

import { Loader } from "@/components/Loader";

const Experience = dynamic(
  () =>
    import("@/components/Experience").then((module) => module.Experience),
  {
    ssr: false,
    loading: () => <Loader visible />,
  },
);

export default function HomePage() {
  return <Experience />;
}
