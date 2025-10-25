import Link from "next/link";

const Tag = ({ link, children, className, linkClassName }) => (
  <span className={`tag flex cursor-pointer select-none rounded-md border px-1 py-0.5 border-black font-medium text-black transition-colors hover:bg-red-600 hover:text-white ${className}`}>
    <Link className={`text-[9px] ${linkClassName}`} href={link}>{children}</Link>
  </span>
);

export default Tag;
