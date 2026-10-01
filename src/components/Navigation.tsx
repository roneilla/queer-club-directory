import { useEffect, useState } from 'react';
import ContactModal from './ContactModal';
import InfoModal from './InfoModal';
import Logo from '../assets/logo.png';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
	const [showContact, setShowContact] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [openMenu, setOpenMenu] = useState(false);
	const location = useLocation().pathname;

	useEffect(() => {
		setOpenMenu(false);
	}, [location]);

	return (
		<>
			<div className="w-full py-2 px-4 flex justify-between items-start gap-2 sm:gap-4">
				<Link to="/">
					<img src={Logo} className="h-12 mx-6 my-4" />
				</Link>
				<div className="hidden lg:flex gap-4 items-center">
					<Link to="/" className="navItem">
						Directory
					</Link>
					{/* <Link to="/events" className="navItem">Events</Link> */}
					<button
						className="navItem"
						onClick={() => setShowInfo(true)}
						id="infoModal">
						Info
					</button>
					<button className="navItem" onClick={() => { setOpenMenu(false); setShowContact(true); }}>Contact us</button>
					<Link to="/add" className="navItem">Add a club</Link>
				</div>
				<button className="iconBtn lg:hidden" onClick={() => setOpenMenu(true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						className="size-6">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					</svg>
				</button>
			</div>
			{openMenu && (
				<div className="fixed top-0 left-0 bg-white w-full z-50 pt-2 px-4 pb-8 drop-shadow-xl">
					<div className="flex justify-between items-start">
						<img src={Logo} className="h-12 mx-6 my-4" />
						<div>
							<button className="iconBtn" onClick={() => setOpenMenu(false)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-6">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18 18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
					<div className="flex flex-col gap-4 items-start">
						<Link to="/" className="navItem">
							Directory
						</Link>
						<Link to="/events" className="navItem">Events</Link>
						<button
							className="navItem"
							onClick={() => setShowInfo(true)}
							id="infoModal">
							Info
						</button>
						<button className="navItem" onClick={() => { setOpenMenu(false); setShowContact(true); }}>Contact us</button>
						<Link to="/add" className="navItem">Submit a club</Link>
					</div>
				</div>
			)}
			{showContact && <ContactModal close={() => setShowContact(false)} />}
			{showInfo && <InfoModal toggleModal={setShowInfo} />}
		</>
	);
};

export default Navigation;
