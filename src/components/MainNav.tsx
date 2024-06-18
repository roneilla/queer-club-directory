import { Link, useLocation } from 'react-router-dom';

const MainNav = () => {
	const location = useLocation().pathname;

	return (
		<div className="w-full px-8 py-4 flex gap-8">
			<Link to="/">
				<h2
					className={`text-2xl cursor-pointer ${
						location === '/' ? 'border-zinc-950 border-b-2' : 'text-zinc-500'
					}`}>
					Clubs
				</h2>
			</Link>
			<Link to="/events">
				<h2
					className={`text-2xl cursor-pointer ${
						location === '/events'
							? 'border-zinc-950 border-b-2'
							: 'text-zinc-500'
					}`}>
					Events
				</h2>
			</Link>
		</div>
	);
};

export default MainNav;
