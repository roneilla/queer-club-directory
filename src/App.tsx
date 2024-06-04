import { useEffect, useState } from 'react';
import './App.css';
import Container from './components/Container';
import DirectoryCard from './components/DirectoryCard';
import Navigation from './components/Navigation';
import { directoryData } from './directoryData';
import Tabs from './components/Tabs';

function App() {
	const [category, setCategory] = useState<string>('all');
	const [tags, setTags] = useState<string[]>([]);
	const [filterTags, setFilterTags] = useState<string[]>([]);
	const [showFilter, setShowFilter] = useState(false);

	useEffect(() => {
		clearFilterTags();
		setTags([]);
		setShowFilter(false);

		if (category === 'all') return;

		const tagArr: string[] = [];

		directoryData
			.filter((item) => {
				return category === item.category;
			})
			.map((item) => {
				const splitTags = item?.tags?.split(', ');
				tagArr.push(...splitTags);
			});

		const uniqueArr = Array.from(new Set(tagArr)).sort();

		setTags(uniqueArr);
	}, [category]);

	const clearFilterTags = () => {
		setFilterTags([]);
	};

	return (
		<>
			<div className={`page ${category}`}>
				<div className="sticky top-0 w-full">
					<Navigation />
					<Tabs currentCategory={category} changeCategory={setCategory} />
				</div>
				{tags.length > 0 && (
					<div className="w-full pb-2 px-8 lg:px-12">
						<button
							className="flex gap-2 items-center"
							onClick={() => setShowFilter(!showFilter)}>
							<p className="text-sm text-black monospace">More categories</p>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="black"
								className="size-4">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m19.5 8.25-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>
						{showFilter && (
							<>
								{tags?.map((tag) => (
									<button
										className={`px-2 py-1 bg-gray-100 hover:bg-gray-300 capitalize rounded-full m-0.5 text-xs monospace ${
											filterTags.includes(tag)
												? 'bg-zinc-950 text-white  hover:bg-zinc-700'
												: 'text-zinc-950'
										}`}
										onClick={() => {
											if (filterTags.includes(tag)) {
												setFilterTags([
													...filterTags.filter((fTag) => fTag != tag),
												]);
											} else {
												setFilterTags([...filterTags, tag]);
											}
										}}>
										{tag}
									</button>
								))}
								<button
									className="p-2 font-medium text-black text-sm hover:underline"
									onClick={clearFilterTags}>
									Clear
								</button>
							</>
						)}
					</div>
				)}
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
							if (filterTags.length === 0) return category === item.category;

							const splitTags = item?.tags?.split(', ');

							return filterTags.some((tag) => splitTags.includes(tag));
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
					className="footer-email hover:underline flex items-center"
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
