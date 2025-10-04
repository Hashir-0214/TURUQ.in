// src/components/reusable/SectionHeader.jsx
import { ArrowRight } from 'lucide-react';
import React from 'react';

const SectionHeader = ({ children }) => { 
    return (
        <div className="section-header mx-auto mb-10 flex h-20 lg:h-28 w-[83%] max-w-[1250px] items-center justify-between rounded-2xl border border-black px-6 lg:px-14">
            <h2 className="section-title font-oswald text-2xl lg:text-4xl font-normal uppercase text-black">{children}</h2> 
            <ArrowRight size={28} className="h-[34px] hover:translate-x-2 cursor-pointer transition-all duration-300" />
        </div>
    );
};

export default SectionHeader;