import './App.css';
import Navigation from './components/Navigation';
import AddAClub from './routes/AddAClub';
import Clubs from './routes/Clubs';
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
			<div className="w-full">
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
			<Route path="add" element={<AddAClub />} />
		</Route>
	)
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
