import './App.css';
import { ADMIN_HOST, isAdminHost } from './adminRouting';
import Navigation from './components/Navigation';
import AddAClub from './routes/AddAClub';
import Clubs from './routes/Clubs';
import Events from './routes/Events';
import AddEvent from './routes/AddEvent';
import AdminEvents from './routes/AdminEvents';
import AdminLayout from './routes/AdminLayout';
import AdminDirectory from './routes/AdminDirectory';
import AdminSubmissions from './routes/AdminSubmissions';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Navigate,
    Route,
    RouterProvider,
} from 'react-router-dom';
import Footer from './components/Footer';

const Layout = () => {
    return (
        <div className="body">
            <div className="w-full">
                <Navigation />
            </div>

            <Outlet />

            <Footer />
        </div>
    );
};

const adminHost = isAdminHost(window.location.hostname);
const publicProductionHost = ['queerclubdirectory.org', 'www.queerclubdirectory.org'].includes(window.location.hostname);
const adminChildren = <>
    <Route index element={<Navigate to="submissions" replace />} />
    <Route path="submissions" element={<AdminSubmissions />} />
    <Route path="directory" element={<AdminDirectory />} />
    <Route path="events" element={<AdminEvents />} />
</>;
function AdminRedirect() {
    const page = window.location.pathname.replace(/^\/admin\/?/, '');
    window.location.replace(`https://${ADMIN_HOST}/${page}`);
    return <p>Opening admin…</p>;
}
const router = createBrowserRouter(
    createRoutesFromElements(
        adminHost ? <Route path="/" element={<div className="body pt-8"><AdminLayout /></div>}>
            {adminChildren}
            <Route path="*" element={<Navigate to="/submissions" replace />} />
        </Route> : <Route path="/" element={<Layout />}>
            <Route index element={<Clubs />} />
            <Route path="events" element={<Events />} />
            <Route path="events/add" element={<AddEvent />} />
            {publicProductionHost ? <Route path="admin/*" element={<AdminRedirect />} /> :
                <Route path="admin" element={<AdminLayout />}>{adminChildren}</Route>}
            <Route path="add" element={<AddAClub key="public" />} />
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
