import React, {  useState } from 'react';
import { ArrowLeftIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';

export type InfoPageProps = {
    title: string;
    menuItems: any[];
    children: any;
    activeSection: string;
    setActiveSection: React.Dispatch<React.SetStateAction<string>>
}

const InfoPage = ({ title, menuItems, children, activeSection, setActiveSection } : InfoPageProps) => {
    const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

    return <>
        <a className="text-black hidden sm:flex items-center p-4" href="/"><ArrowLeftIcon /> <span>Back</span></a>
        <div className='flex flex-col lg:p-24 lg:container lg:mx-auto'>
        {/* mobile menu */}
        <div className={`sm:hidden text-lg drop-shadow-sm sticky top-0 flex flex-col w-full ${isSectionMenuOpen ? 'bg-cyan-500' : 'bg-white'}`}>
            <div className={`flex flex-row justify-between`}>
                <a className={`flex items-center text-black`} href="/"><ArrowLeftIcon className="mr-4" /> Back</a>
                <span className="flex items-center">{title}
                    <HamburgerMenuIcon className='ml-4' onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)} />
                </span>
            </div>
            {
                isSectionMenuOpen &&
                <ul className="list-none text-right text-white">
                    {menuItems.map((menuItem) => {
                        return <li><span className={`cursor-pointer ${activeSection === menuItem ? `text-white font-bold` : `text-white`}`} onClick={() => { setActiveSection(menuItem)}} >{menuItem}</span></li>
                    })}
                </ul>
            }
        </div>

        {/* end mobile menu */}

        <div className='hidden sm:block sm:text-7xl w-full mb-10'>{title}</div> 
        <div className='flex px-8 md:px-0 md:w-full'>
            <div className='hidden sm:block'>
                <ul className="list-none text-2xl leading-10 whitespace-nowrap  sticky top-0">
                    {menuItems.map((menuItem) => {
                        return <li><span className={`cursor-pointer ${activeSection === menuItem ? `text-cyan-500 font-bold` : `text-black`}`} onClick={() => { setActiveSection(menuItem)}} >{menuItem}</span></li>
                    })}
                </ul>
            </div>
            <div className="grow md:ml-48">
                {children}
            </div>
        </div>
    </div>
    </>
};
export default InfoPage;