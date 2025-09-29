// components/Footer.jsx
import Image from 'next/image';
import { Oswald, Poppins } from 'next/font/google';
import { BsTwitterX, BsInstagram, BsFacebook } from "react-icons/bs";

// Configure fonts (alternative to Google Fonts in CSS)
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-oswald'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-poppins'
});

export default function Footer() {
  return (
    <footer className={`${oswald.variable} ${poppins.variable} bg-background mt-[60px]`}>
      <div className="border-t border-b border-[#989696]">
        <div className="mx-auto flex items-center justify-between w-[83%] max-w-[1250px] py-4">
          <div className="footer-logo">
            <h2 className="font-oswald text-[45px] font-medium text-main-text m-0">TURUQ</h2>
          </div>
          <div className="flex gap-[75px]">
            <a href="#" className="flex items-center gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsFacebook size={20} />
              <span>Facebook</span>
            </a>
            <a href="#" className="flex items-center gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsInstagram size={20} />
              <span>Instagram</span>
            </a>
            <a href="#" className="flex items-center gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsTwitterX  size={20} />
              <span>X.com</span>
            </a>
          </div>
        </div>
      </div>
      <div className="text-center py-5 w-[83%] max-w-[1250px] mx-auto">
        <span className="font-poppins text-[15px] font-normal text-[#717171]">© 2025 TURUQ</span>
      </div>
    </footer>
  );
}