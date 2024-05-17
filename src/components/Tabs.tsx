import { clubCategories } from '../directoryData';

interface TabsProps {
	currentCategory: string;
	changeCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs = ({ currentCategory, changeCategory }: TabsProps) => {
	return (
		<div className="flex items-end px-4 gap-1 overflow-scroll">
			{clubCategories.sort().map((item) => (
				<h2 key={item}>
					<button
						className={`font-medium tabItem text-black p-2 capitalize cursor-pointer hover:text-md hover:px-6 transition-all	 ${item} ${
							item === currentCategory ? 'px-3 text-lg' : ''
						}`}
						onClick={() => changeCategory(item)}>
						{item}
					</button>
				</h2>
			))}
		</div>
	);
};

export default Tabs;
