import { useState } from 'react';
import './App.css';
import Container from './components/Container';
import DirectoryCard from './components/DirectoryCard';
import Navigation from './components/Navigation';
import { directoryData } from './directoryData';
import Tabs from './components/Tabs';

function App() {
	const [category, setCategory] = useState<string>('all');

	return (
		<>
			<div className={`page ${category}`}>
				<div className="w-full bg-white">
					<Navigation />
					<Tabs currentCategory={category} changeCategory={setCategory} />
				</div>
				<Container>
					{directoryData
						.sort((a, b) => {
							const nameA = a.name.toUpperCase();
							const nameB = b.name.toUpperCase();
							if (nameA < nameB) {
								return -1;
							}
							if (nameA > nameB) {
								return 1;
							}

							return 0;
						})
						.filter((item) => {
							if (category === 'all') return true;
							return category === item.category;
						})
						.map((item) => (
							<DirectoryCard
								key={item.instagram}
								name={item.name}
								description={item.description}
								instagram={item.instagram}
								tags={item.tags}
								website={item.website}
							/>
						))}
				</Container>
			</div>
			<div className="w-full px-4 py-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
				<a
					className="text-xs text-black hover:underline"
					href="https://www.roneilla.com"
					target="_blank">
					Created by Roneilla Bumanlag
				</a>
				<p className="text-xs">Queer Club Directory Toronto © 2024</p>
			</div>
		</>
	);
}

export default App;
