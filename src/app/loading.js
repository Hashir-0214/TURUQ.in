// src/app/loading.js

export default function Loading() {
  // You can use the same Tailwind styles and icons here
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#ffedd9] z-[9999]">
      {/* You can show your logo, an animated spinner, or a simple message */}
      <h1 className="text-6xl text-red-700 font-bold local-font-rachana animate-pulse">
        TURUQ
      </h1>
    </div>
  );
}