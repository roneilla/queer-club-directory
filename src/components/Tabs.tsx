import { clubCategories } from '../directoryData';

interface TabsProps {
	currentCategory: string;
	changeCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs = ({ currentCategory, changeCategory }: TabsProps) => {
	return (
		<div className="w-full bg-white pt-4">
			<div className="flex items-end overflow-scroll px-8 gap-1">
				{clubCategories.sort().map((item) => (
					<h2 key={item}>
						<button
							className={`font-medium tabItem text-black py-1.5 px-4 capitalize cursor-pointer hover:text-base hover:px-6 transition-all text-nowrap ${item} ${
								item === currentCategory ? 'text-lg' : ''
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
