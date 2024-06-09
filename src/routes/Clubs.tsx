import { useState, useEffect } from 'react';
import Skeleton from '../components/Skeleton';
import DirectoryCard from '../components/DirectoryCard';
import Tabs from '../components/Tabs';
import Container from '../components/Container';

export interface Subcategories {
	name: string;
}

interface DirectoryItem {
	name: string;
	instagram: string;
	category: string;
	website?: string;
	description?: string;
	subcategories: Subcategories[];
}

const Clubs = () => {
	const [category, setCategory] = useState<string>('all');
	const [tags, setTags] = useState<string[]>([]);
	const [filterTags, setFilterTags] = useState<string[]>([]);
	const [showFilter, setShowFilter] = useState(false);
	const [directoryData, setDirectoryData] = useState<DirectoryItem[]>([]);
	const [loading, setLoading] = useState(true);

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
				const subItems = item.subcategories.map((subc) => subc.name);

				tagArr.push(...subItems);
			});

		const uniqueArr = Array.from(new Set(tagArr)).sort();

		setTags(uniqueArr);
	}, [category]);

	const clearFilterTags = () => {
		setFilterTags([]);
	};

	useEffect(() => {
		const getClubs = async () => {
			setLoading(true);

			const response = await fetch(`/.netlify/functions/getClubs`);
			const res = await response.json();

			setDirectoryData(res);
			setLoading(false);
		};

		getClubs();
	}, []);

	return (
		<>
			<div className="bg-white">
				<h1 className="text-3xl px-8 pb-4">Find a queer club in Toronto.</h1>
			</div>
			<div className={`page ${category}`}>
				<div className="sticky top-0 w-full">
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
										className={`tagItem monospace ${
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
								<button className="tagClear" onClick={clearFilterTags}>
									Clear
								</button>
							</>
						)}
					</div>
				)}
				<Container>
					{!loading ? (
						directoryData
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

								const subItems = item.subcategories.map((subc) => subc.name);

								return filterTags.some((tag) => subItems.includes(tag));
							})
							.map((item) => (
								<DirectoryCard
									key={item.instagram}
									name={item.name}
									description={item.description}
									instagram={item.instagram}
									subcategories={item.subcategories}
									website={item.website}
								/>
							))
					) : (
						<>
							<Skeleton />
							<Skeleton />
							<Skeleton />
							<Skeleton />
							<Skeleton />
							<Skeleton />
						</>
					)}
				</Container>

				<div
					className={`w-full px-4 py-2 flex flex-col gap-2 sm:flex-row sm:justify-between text-sm ${
						category === 'all' ? 'text-white' : 'text-black'
					}`}>
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
			</div>
		</>
	);
};

export default Clubs;
