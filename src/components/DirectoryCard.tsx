interface DirectoryCardProps {
	name: string;
	description?: string;
	instagram?: string;
	category?: string;
	tags?: string;
	website?: string;
}

const DirectoryCard = ({ name, ...props }: DirectoryCardProps) => {
	const splitTags = props?.tags?.split(',');

	return (
		<div className="p-4 sm:basis-1/2 lg:basis-2/6 w-full">
			<div className="p-4 bg-white rounded h-full">
				<div className="pb-2 w-full border-b border-solid border-gray-300	">
					<h3 className="text-lg leading-6 font-medium">{name}</h3>
					<div className="flex gap-1 mt-0.5">
						{splitTags?.map((tag) => (
							<div
								key={tag}
								className="bg-gray-100 py-0.5 px-2 rounded-full text-xs">
								{tag}
							</div>
						))}
					</div>
				</div>

				{props?.description && <p className="pt-2 ">{props?.description}</p>}
				<div className="flex gap-2 flex-wrap">
					{props?.instagram && (
						<a
							id={`ig-${props?.instagram}`}
							className="mt-2 gap-1 items-center text-sm hover:bg-purple-100 hover:text-purple-800 text-purple-700 inline-flex px-1 py-0.5 rounded-full"
							href={`https://www.instagram.com/${props?.instagram}/`}
							target="_blank">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								viewBox="0 0 16 16">
								<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
							</svg>
							{props?.instagram}
						</a>
					)}

					{props?.website && (
						<a
							className="mt-2 gap-1 items-center text-sm hover:bg-purple-100 hover:text-purple-800 text-purple-700 inline-flex px-1 py-0.5 rounded-full"
							href={props?.website}
							id={`web-${props?.instagram}`}
							target="_blank">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-4 h-4">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
								/>
							</svg>
							Website
						</a>
					)}
				</div>
			</div>
		</div>
	);
};

export default DirectoryCard;
