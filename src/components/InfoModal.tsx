interface InfoModalProps {
	toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const InfoModal = ({ toggleModal }: InfoModalProps) => {
	return (
		<div className="modalContainer p-4" onClick={() => toggleModal(false)}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modalTitle flex justify-between items-start pb-4">
					<div>
						<h2 className="text-lg font-medium">
							Queer Club Directory Toronto
						</h2>
						<p className="pt-1">
							Created by{' '}
							<a
								className="text-purple-600 hover:text-purple-800"
								href="https://www.roneilla.com"
								target="_blank">
								Roneilla Bumanlag
							</a>
						</p>
					</div>
					<button
						className="rounded hover:bg-gray-200 p-1"
						onClick={() => toggleModal(false)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<p className="pb-4">
					Queer Club Directory Toronto is a resource to help queer folks in
					Toronto find, support, and join clubs and communities of various
					interests.
				</p>
				<p className="font-medium">Let's chat!</p>
				<p>
					Send me an email if you've got any feedback, questions, or feature
					requests. I'm also open to collaborating or helping out clubs that
					need design or development.
				</p>
				<p>
					Reach me at{' '}
					<a
						className="text-purple-600	hover:text-purple-800"
						href="mailto:roneillabumanlag@gmail.com"
						target="_blank">
						roneillabumanlag@gmail.com
					</a>
				</p>
			</div>
		</div>
	);
};

export default InfoModal;
