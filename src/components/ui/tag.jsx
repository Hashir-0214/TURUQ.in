import Link from "next/link";

const Tag = ({ link, children, className, linkClassName }) => {
  // Ensure we always have a valid href
  const href = link && typeof link === 'string' ? link : '#';
  
  return (
    <span className={`tag flex cursor-pointer select-none rounded-md border px-1 py-0.5 border-black font-medium text-black transition-colors hover:bg-red-600 hover:text-white ${className}`}>
      <Link className={`text-[9px] ${linkClassName}`} href={href}>
        {children}
      </Link>
    </span>
  );
};

export default Tag;