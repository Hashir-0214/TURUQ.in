// src/components/webzine/webzinepage.jsx

import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/mongodb";
import Webzine from "@/models/Webzine";
import Footer from "@/components/footer/footer";

async function getWebzines() {
  try {
    await dbConnect();
    const webzines = await Webzine.find({ status: 'published' })
      .sort({ published_at: -1 })
      .lean();

    return webzines.map(w => ({
      ...w,
      _id: w._id.toString(),
      published_date: w.published_at 
        ? new Date(w.published_at).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) 
        : ''
    }));
  } catch (error) {
    console.error("Error fetching webzines:", error);
    return [];
  }
}

export default async function WebzineComponent() {
  const webzines = await getWebzines();

  return (
    <div className="mt-10 min-h-screen flex flex-col justify-between">
      <main className="mb-20">
        
        {/* Page Header */}
        <div className="w-[83%] max-w-[1250px] mx-auto mb-8">
          <h1 className="text-4xl font-bold text-[#a82a2a] local-font-rachana border-b border-black/20 pb-4">
            Webzines
          </h1>
        </div>

        {/* Content Grid */}
        {webzines.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-xl font-medium text-gray-500">No webzines found.</p>
          </div>
        ) : (
          <div className="mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {webzines.map((webzine) => (
              <article
                key={webzine._id}
                className="group relative rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg bg-white"
              >
                {/* Image */}
                <div className="mb-4 h-[200px] md:h-[250px] w-full overflow-hidden rounded-xl bg-gray-100">
                  <Link href={`/webzine/${webzine.slug}`}>
                    <Image
                      unoptimized={true} 
                      src={webzine.cover_image || 'https://placehold.co/400x250/ccc/333?text=Cover+Missing'}
                      alt={webzine.name}
                      width={400}
                      height={250}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                  </Link>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  {/* Title */}
                  <Link href={`/webzine/${webzine.slug}`}>
                    <h3 className="local-font-rachana text-[25px] font-bold leading-[28px] text-[#a82a2a] hover:text-red-700 transition-colors capitalize">
                      {webzine.name}
                    </h3>
                  </Link>

                  {/* Description Excerpt */}
                  {webzine.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {webzine.description}
                    </p>
                  )}
                  
                  {/* Meta / Date */}
                  <div className="mt-2 flex items-center gap-2 border-t border-black/10 pt-2">
                    <span className="text-xs font-normal text-black opacity-45">
                      {webzine.published_date}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}