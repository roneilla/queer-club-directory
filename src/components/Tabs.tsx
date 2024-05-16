import React from 'react';
import { clubCategories } from '../directoryData';

interface TabsProps {
	currentCategory: string;
	changeCategory: any;
}

const Tabs = ({ currentCategory, changeCategory }: TabsProps) => {
	return (
		<div className="tabs">
			{clubCategories.sort().map((item) => (
				<button
					key={item}
					className={`tabItem ${item} ${
						item === currentCategory ? 'selected' : ''
					}`}
					onClick={() => changeCategory(item)}>
					{item}
				</button>
			))}
		</div>
	);
};

export default Tabs;
