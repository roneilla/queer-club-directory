import { useState } from 'react';
import InfoModal from './InfoModal';
import RainbowImg from '../assets/rainbow-img.png';

const Navigation = () => {
	const [showInfo, setShowInfo] = useState(false);
	return (
		<>
			<div className="w-full bg-white py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
				<div className="flex items-center">
					<img src={RainbowImg} className="w-6 mr-2" />
					<h1 className="font-medium text-xl text-black">
						Queer Club Directory Toronto
					</h1>
				</div>
				<div className="flex gap-4 items-center">
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
						Email
					</a>
					<a
						href="https://docs.google.com/forms/d/e/1FAIpQLSdGiIS0ytB8ifjNc8MRdkiFbvEEqFfnCMjvtvqNo-FEIqGWGw/viewform?usp=sf_link"
						target="_blank"
						className="primaryBtn">
						Add a club
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="w-3 h-3 inline-block ml-1">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
							/>
						</svg>
					</a>
				</div>
			</div>
			{showInfo && <InfoModal toggleModal={setShowInfo} />}
		</>
	);
};

export default Navigation;
