import React, { useState } from 'react';
import { ArrowLeftIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';

export type InfoPageProps = {
    title: string;
    menuItems: any[];
    children: any;
}

const InfoPage = ({ title, menuItems, children} : InfoPageProps) => {
    const [activeSection, setActiveSection] = useState('');
    const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(true);

    return <div className='flex flex-col px-4 md:p-24 md:container md:mx-auto'>
        {/* mobile menu */}
        <div className={`sm:hidden sticky top-0 flex flex-col ${isSectionMenuOpen ? 'bg-cyan-500' : 'bg-white'}`}>
            <div className={`flex flex-row justify-between`}>
                <a className="flex items-center text-white" href="/"><ArrowLeftIcon /> Back</a>
                <span className="flex items-center">{title}
                    <HamburgerMenuIcon className='ml-2' onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)} />
                </span>
            </div>
            {
                isSectionMenuOpen &&
                <ul className="list-none text-right text-white">
                    {menuItems.map((menuItem) => {
                        return <li><a className="text-white" href={`#${menuItem}`}>{menuItem}</a></li>
                    })}
                </ul>
            }
        </div>

        {/* end mobile menu */}

        <a className="hidden sm:flex items-center" href="/"><ArrowLeftIcon /> <span>Back</span></a>
        <div className='hidden sm:block sm:text-7xl w-full mb-10'>{title}</div> 
        <div className='flex w-full'>
            <div className='hidden sm:block'>
                <li className="list-none text-2xl leading-10 whitespace-nowrap  sticky top-0">
                    {menuItems.map((menuItem) => {
                        return <li><a className="text-black" href={`#${menuItem}`}>{menuItem}</a></li>
                    })}
                </li>
            </div>
            <div className="grow md:ml-48">
                {children}
            </div>
        </div>
    </div>
};
export default InfoPage;