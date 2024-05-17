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
				<div className="sticky top-0 w-full">
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
			<div className="w-full px-4 py-2 flex flex-col gap-2 sm:flex-row sm:justify-between text-sm">
				<a
					className="hover:underline flex items-center"
					href="https://www.roneilla.com"
					target="_blank">
					Created by Roneilla Bumanlag
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-3 h-3 ml-1">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
						/>
					</svg>
				</a>
				<p>Queer Club Directory Toronto © 2024</p>
			</div>
		</>
	);
}

export default App;
