import { useEffect, useRef, useState } from 'react';
import InfoModal from './InfoModal';
import Logo from '../assets/logo.png';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
	const [showInfo, setShowInfo] = useState(false);
	const [openMenu, setOpenMenu] = useState(false);
	const location = useLocation().pathname;
	const [openAdd, setOpenAdd] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setOpenMenu(false);
		setOpenAdd(false);
	}, [location]);

	const handleClickOutside = (e: any) => {
		if (ref.current && !ref.current.contains(e.target)) {
			setOpenAdd(false);
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	}, []);

	return (
		<>
			<div className="w-full bg-white py-2 px-4 flex justify-between items-start gap-2 sm:gap-4">
				<Link to="/">
					<img src={Logo} className="h-12 mx-6 my-4" />
				</Link>
				<div className="hidden sm:flex gap-4 items-center">
					<Link to="/" className="navItem">
						Directory
					</Link>
					<button
						className="navItem"
						onClick={() => setShowInfo(true)}
						id="infoModal">
						Info
					</button>
					<a
						href="mailto:queerclubdirectory@gmail.com"
						target="_blank"
						className="navItem">
						Contact us
					</a>
					<div className="relative" ref={ref}>
						<button className="" onClick={() => setOpenAdd(true)}>
							Add{' '}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-4 inline-block">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m19.5 8.25-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>
						{openAdd && (
							<div className="absolute top-8 custom-shadow right-0 flex flex-col w-32 border border-solid border-zinc-200 rounded-lg">
								<Link to="add-club" className="navItem">
									Add a club
								</Link>
								<Link to="add-event" className="navItem">
									Add an event
								</Link>
							</div>
						)}
					</div>
				</div>
				<button className="iconBtn sm:hidden" onClick={() => setOpenMenu(true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						className="size-6">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
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
						<button
							className="navItem"
							onClick={() => setShowInfo(true)}
							id="infoModal">
							Info
						</button>
						<a
							href="mailto:queerclubdirectory@gmail.com"
							target="_blank"
							className="navItem">
							Contact us
						</a>
						<Link to="add-club" className="navItem">
							Add a club
						</Link>
					</div>
				</div>
			)}
			{showInfo && <InfoModal toggleModal={setShowInfo} />}
		</>
	);
};

export default Navigation;
