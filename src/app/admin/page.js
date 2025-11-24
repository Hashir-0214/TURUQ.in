import React from 'react';
import Head from 'next/head';
import {
    Plus,
    FileText,
    Package,
    List,
    MonitorPlay,
} from 'lucide-react';

const currentUser = {
    name: 'Admin User',
};

const DashboardPage = () => {
    return (
        <>
            {/* Main Content Area */}
            <main className="flex flex-col flex-1 transition-all duration-300">
                {/* Welcome Section */}
                <section className="welcome-section mb-8">
                    <h1 className="font-poppins font-bold text-[20px] text-black m-0 leading-none">
                        <span className='uppercase'> Welcome back,</span> {currentUser.name}
                    </h1>
                    <p className="font-poppins text-[12px] px-2 py-1 mt-1 w-fit rounded-lg bg-[#f2cfa6] uppercase font-normal text-black">
                        July 14, 2025
                    </p>
                </section>

                {/* Statistics Section */}
                <section className="stats-section w-full">
                    <div className="w-full flex flex-wrap gap-4 justify-start">
                        {/* Stat Card: Total Posts */}
                        <div className="relative w-fit h-fit bg-[#ffedd9] border border-black rounded-xl p-5 flex flex-col items-center justify-between gap-4">
                            <h3 className="font-poppins text-[12px] bg-[#f2cfa6] uppercase px-2 py-1 rounded-lg text-black leading-none">Total Posts</h3>
                            <div className="flex flex-row justify-center gap-2 items-center">
                                {/* Content Container - positioned relative to the card */}
                                <p className="font-poppins text-[25px] font-bold text-black leading-none">
                                    100
                                </p>
                            </div>
                        </div>

                        {/* Stat Card: Comments */}
                        <div className="relative w-fit h-fit bg-[#ffedd9] border border-black rounded-xl p-5 flex flex-col items-center justify-between gap-4">
                            <h3 className="font-poppins text-[12px] bg-[#f2cfa6] uppercase px-2 py-1 rounded-lg text-black leading-none">Total Authors</h3>
                            <div className="flex flex-row justify-center gap-2 items-center">
                                {/* Content Container - positioned relative to the card */}
                                <p className="font-poppins text-[25px] font-bold text-black leading-none">
                                    100
                                </p>
                            </div>
                        </div>

                        {/* Stat Card: Subscribers */}
                        <div className="relative w-fit h-fit bg-[#ffedd9] border border-black rounded-xl p-5 flex flex-col items-center justify-between gap-4">
                            <h3 className="font-poppins text-[12px] bg-[#f2cfa6] uppercase px-2 py-1 rounded-lg text-black leading-none">Total Authors</h3>
                            <div className="flex flex-row justify-center gap-2 items-center">
                                {/* Content Container - positioned relative to the card */}
                                <p className="font-poppins text-[25px] font-bold text-black leading-none">
                                    100
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Shortcuts Section */}
                <section className="flex flex-col">
                    <div className="flex items-center my-8 gap-1">
                        <h2 className="font-poppins text-[20px] uppercase font-bold text-black m-0 leading-none">
                            Quick Shortcuts
                        </h2>
                        <Plus
                            className="w-5 h-5 text-black cursor-pointer transition duration-200 hover:scale-110"
                            aria-label="Add new shortcut"
                        />
                    </div>

                    <div className="flex flex-wrap gap-5 w-full">
                        {/* Shortcut Card: New Post */}
                        <div className="w-[200px] bg-[#ffedd9] border border-black rounded-lg flex items-center p-4 gap-2 cursor-pointer transition-all duration-200 hover:bg-[#f2cfa6] shadow-gray-400 hover:shadow-md">
                            <FileText className="w-6 h-6 text-black" />
                            <p className="font-poppins text-[18px] font-medium text-black">
                                New Post
                            </p>
                        </div>

                        {/* Shortcut Card: New Packet */}
                        <div className="w-[200px] bg-[#ffedd9] border border-black rounded-lg flex items-center p-4 gap-2 cursor-pointer transition-all duration-200 hover:bg-[#f2cfa6] shadow-gray-400 hover:shadow-md">
                            <Package className="w-6 h-6 text-black" />
                            <p className="font-poppins text-[18px] font-medium text-black">
                                New Packet
                            </p>
                        </div>

                        {/* Shortcut Card: View Comments */}
                        <div className="w-[200px] bg-[#ffedd9] border border-black rounded-lg flex items-center p-4 gap-2 cursor-pointer transition-all duration-200 hover:bg-[#f2cfa6] shadow-gray-400 hover:shadow-md">
                            <List className="w-6 h-6 text-black" />
                            <p className="font-poppins text-[18px] font-medium text-black">
                                View Comments
                            </p>
                        </div>

                        {/* Shortcut Card: New Slide */}
                        <div className="w-[200px] bg-[#ffedd9] border border-black rounded-lg flex items-center p-4 gap-2 cursor-pointer transition-all duration-200 hover:bg-[#f2cfa6] shadow-gray-400 hover:shadow-md">
                            <MonitorPlay className="w-6 h-6 text-black" />
                            <p className="font-poppins text-[18px] font-medium text-black">
                                New Slide
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default DashboardPage;