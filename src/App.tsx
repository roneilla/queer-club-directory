import './App.css';
import Navigation from './components/Navigation';
import AddAClub from './routes/AddAClub';
import AddAnEvent from './routes/AddAnEvent';
import Clubs from './routes/Clubs';
import Events from './routes/Events';

import {
	createBrowserRouter,
	createRoutesFromElements,
	Outlet,
	Route,
	RouterProvider,
} from 'react-router-dom';

const Layout = () => {
	return (
		<div className="body">
			<div className="bg-white w-full">
				<Navigation />
			</div>

			<Outlet />
		</div>
	);
};

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Layout />}>
			<Route index element={<Clubs />} />
			<Route path="add-club" element={<AddAClub />} />
			<Route path="events" element={<Events />} />
			<Route path="add-event" element={<AddAnEvent />} />
		</Route>
	)
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
