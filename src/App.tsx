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
		<div className={`page ${category}`}>
			<div className="header">
				<Navigation />
				<Tabs currentCategory={category} changeCategory={setCategory} />
			</div>
			<Container>
				{directoryData
					.sort()
					.filter((item) => {
						if (category === 'all') return true;
						return category === item.category;
					})
					.map((item) => (
						<DirectoryCard
							name={item.name}
							description={item.description}
							instagram={item.instagram}
							tags={item.tags}
						/>
					))}
			</Container>
		</div>
	);
}

export default App;
