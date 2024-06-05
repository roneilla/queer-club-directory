import { clubCategories } from '../directoryData';

interface TabsProps {
	currentCategory: string;
	changeCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs = ({ currentCategory, changeCategory }: TabsProps) => {
	return (
		<div className="w-full bg-white sm:pt-2">
			<div className="flex items-end overflow-scroll px-4 gap-1">
				<button
					className={`font-medium tabItem text-black py-2 px-2 capitalize cursor-pointer hover:text-md hover:px-6 transition-all text-nowrap search ${
						currentCategory === 'search' ? 'px-3 py-2.5' : ''
					}`}
					onClick={() => {
						changeCategory('search');
						window.scroll(0, 0);
					}}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
						strokeWidth={1.5}
						stroke="black"
						className="size-4">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
						/>
					</svg>
				</button>{' '}
				{clubCategories.sort().map((item) => (
					<h2 key={item}>
						<button
							className={`font-medium tabItem text-black py-1 px-2 capitalize cursor-pointer hover:text-md hover:px-6 transition-all text-nowrap ${item} ${
								item === currentCategory ? 'px-3 text-lg' : ''
							}`}
							onClick={() => {
								changeCategory(item);
								window.scroll(0, 0);
							}}>
							{item === 'food' ? 'Food & Drink' : item}
						</button>
					</h2>
				))}
			</div>
			<div className={`w-full h-4 ${currentCategory}`} />
		</div>
	);
};

export default Tabs;
