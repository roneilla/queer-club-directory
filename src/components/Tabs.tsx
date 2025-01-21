import { clubCategories } from '../directoryData';

interface TabsProps {
	currentCategory: string;
	changeCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs = ({ currentCategory, changeCategory }: TabsProps) => {
	return (
		<div className="w-full pt-2 bg-gray-100">
			<div className="flex items-end flex-wrap px-4 md:px-8 gap-2 pb-4">
				{clubCategories.sort().map((item) => (
					<button
						key={item}
						className={`${
							item === 'all' && currentCategory === 'all'
								? 'text-white'
								: 'text-black'
						} flex items-center gap-2 border border-${item} ${
							item === currentCategory ? item : ''
						} font-medium rounded-full py-1 px-2 capitalize cursor-pointer transition-all text-nowrap`}
						onClick={() => {
							changeCategory(item);
							window.scroll(0, 0);
						}}>
						<div
							className={`h-2 w-2 rounded-full ${
								item === currentCategory ? 'bg-gray-100' : item
							}`}></div>
						{item === 'food' ? 'Food & Drink' : item}
					</button>
				))}
			</div>
		</div>
	);
};

export default Tabs;
