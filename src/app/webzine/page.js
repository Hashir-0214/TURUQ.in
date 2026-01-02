// src/app/webzine/page.js

import WebzineComponent from "@/components/webzine/webzinepage";

export const metadata = {
  title: "Webzines | TURUQ",
  description: "Read our latest webzines and collections.",
};

export default function WebzinePage() {
  return (
    <WebzineComponent />
  );
}