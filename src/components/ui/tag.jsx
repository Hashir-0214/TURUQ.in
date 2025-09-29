import Link from "next/link";

const Tag = ({ link, children, className }) => (
  <span className={`tag flex cursor-pointer rounded border border-black px-1 text-xs font-semibold text-black transition-colors hover:bg-red-600 hover:text-white ${className}`}>
    <Link className="text-[10px] m-1" href={link}>{children}</Link>
  </span>
);

export default Tag;
