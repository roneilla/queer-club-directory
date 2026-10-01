import { useState, useEffect } from 'react';
import RandomClubModal from '../components/RandomClubModal';
import Skeleton from '../components/Skeleton';
import DirectoryCard from '../components/DirectoryCard';
import Tabs from '../components/Tabs';
import Container from '../components/Container';
import { Link } from 'react-router-dom';


export interface Subcategories {
	name: string;
}

export interface DirectoryItem {
	_id?: string;
	location?: string;
	schedule?: string;
	name: string;
	instagram: string;
	category: string;
	website?: string;
	description?: string;
	subcategories: Subcategories[];
}

const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const Clubs = () => {
	const [search, setSearch] = useState('');
	const [showRandom, setShowRandom] = useState(false);
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
				const subItems = (item.subcategories || []).map((subc) => subc.name);

				tagArr.push(...subItems);
			});

		const uniqueArr = Array.from(new Set(tagArr)).sort();

		setTags(uniqueArr);
	}, [category, directoryData]);

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

	const keywords = normalizeSearch(search).trim().split(/\s+/).filter(Boolean);
	const visibleClubs = directoryData.filter(item => {
		if (category !== 'all' && item.category !== category) return false;
		const subcategories = item.subcategories || [];
		if (filterTags.length && !subcategories.some(tag => filterTags.includes(tag.name))) return false;
		const text = normalizeSearch([
			item.name, item.description, item.instagram, item.website, item.category,
			item.category === 'food' ? 'food drink' : '', item.location, item.schedule,
			...subcategories.map(tag => tag.name),
		].filter(Boolean).join(' '));
		return keywords.every(keyword => text.includes(keyword));
	}).sort((a, b) => a.name.localeCompare(b.name));

	return (
		<>
			{showRandom && directoryData.length > 0 && <RandomClubModal clubs={directoryData} close={() => setShowRandom(false)} />}
			<div className="px-4 md:px-8 py-8 mb-8 cardBg m-8 rounded flex flex-col">

				{/* <p className="text-4xl font-semibold">
					Find your community, Toronto.
				</p> */}
				<p className="mt-4 md:w-1/2 text-2xl font-semibold">
					Queer Club Directory Toronto aims to help LGBTQ+ folks in Toronto find, support, and join queer-centric clubs and communities of various interests.
				</p>

				<div className="mt-8 rounded flex flex-col md:flex-row gap-4 items-center">
					<p>Know a club that should be listed?</p>
					<Link to="/add" className="linkBtn">Submit a club</Link>
				</div>
			</div>

			<div className={`page`}>
				<div>
					<h1 className="text-3xl font-semibold px-8">
						Clubs
					</h1></div>
				<div className="sticky top-0 w-full bg-gray-100 z-10">
					<div role="search" className="px-4 md:px-8 pt-3 pb-2">
						<label htmlFor="club-search" className="block text-sm mb-2 invisible h-0">Search clubs</label>
						<div className="flex gap-3 items-center">
							<input id="club-search" type="search" className="field w-full" placeholder="Search names, interests, and more…" value={search} onChange={event => setSearch(event.target.value)} />
							{search && <button type="button" className="underline shrink-0" onClick={() => setSearch('')}>Clear search</button>}
						</div>
					</div>
					{/* <div className="px-4 md:px-8 pb-3">
						<button type="button" className="primaryBtn" disabled={loading || directoryData.length === 0} onClick={() => setShowRandom(true)}>I'm feeling lucky</button>
					</div> */}
					<Tabs currentCategory={category} changeCategory={setCategory} />
				</div>
				{tags.length > 0 && (
					<div className="w-full pb-2 px-4 md:px-8">
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
							<div className="mt-1">
								{tags?.map((tag) => (
									<button
										key={tag}
										className={`tagItem monospace ${filterTags.includes(tag)
											? 'bg-gray-300 hover:bg-gray-400'
											: 'bg-gray-200 hover:bg-gray-300'
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
							</div>
						)}
					</div>
				)}
				{!loading && keywords.length > 0 && <p role="status" className="px-4 md:px-8 py-2 bg-gray-100">{visibleClubs.length} {visibleClubs.length === 1 ? 'club' : 'clubs'} found</p>}
				{!loading && visibleClubs.length === 0 && <p className="mx-4 md:mx-8 my-4 p-4 rounded bg-white">No clubs match. Try different keywords or clear the category filters.</p>}
				<Container>
					{!loading ? (
						visibleClubs
							.map((item) => (
								<DirectoryCard
									key={item._id || item.name}
									searchQuery={search}
									category={item.category}
									location={item.location}
									schedule={item.schedule}
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
			</div>
		</>
	);
};

export default Clubs;
