import { useState } from 'react';
import InfoModal from './InfoModal';

const Navigation = () => {
	const [showInfo, setShowInfo] = useState(false);
	return (
		<>
			<div className="py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
				<h1 className="font-medium text-xl text-black">
					Queer Club Directory Toronto
				</h1>
				<div className="flex gap-4 items-center">
					<button
						className="textButton font-medium transition-all"
						onClick={() => setShowInfo(true)}>
						Info
					</button>
					<a
						href="mailto:roneillabumanlag@gmail.com"
						target="_blank"
						className="textButton font-medium transition-all">
						Email
					</a>
					<a
						href="https://docs.google.com/forms/d/e/1FAIpQLSdGiIS0ytB8ifjNc8MRdkiFbvEEqFfnCMjvtvqNo-FEIqGWGw/viewform?usp=sf_link"
						target="_blank"
						className="bg-gray-900 text-white rounded-lg py-1 px-2 font-medium hover:bg-gray-700 flex items-center transition-all">
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
