// components/Footer.jsx
import Image from 'next/image';
import { BsTwitterX, BsInstagram, BsFacebook } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-background mt-[60px]">
      <div className="border-t border-b border-[#989696]">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between w-[83%] max-w-[1250px] py-6 md:py-4 gap-6 md:gap-0">
          <div className="footer-logo">
            <h2 className="font-oswald text-[35px] md:text-[45px] font-medium text-main-text m-0">TURUQ</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-[75px]">
            <a href="#" className="flex items-center justify-center sm:justify-start gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsFacebook size={20} />
              <span>Facebook</span>
            </a>
            <a href="#" className="flex items-center justify-center sm:justify-start gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsInstagram size={20} />
              <span>Instagram</span>
            </a>
            <a href="#" className="flex items-center justify-center sm:justify-start gap-2 font-poppins text-[15px] font-normal text-[#575757] capitalize transition-colors hover:text-[#d64545]">
              <BsTwitterX  size={20} />
              <span>X.com</span>
            </a>
          </div>
        </div>
      </div>
      {/* <div className="text-center py-5 w-[83%] max-w-[1250px] mx-auto">
        <div className="flex flex-col gap-2">
          <span className="font-poppins text-[15px] font-normal text-[#717171]">© 2025 TURUQ</span>
          <span className="font-poppins text-[13px] font-normal text-[#888888]">
            Developed by <span className="text-[#d64545] font-medium">Your Name</span>
          </span>
        </div>
      </div> */}
    </footer>
  );
}
