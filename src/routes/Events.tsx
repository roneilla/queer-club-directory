import { useEffect, useState } from 'react';
import { formatDate } from '../utils/formatDate';
import MainNav from '../components/MainNav';
import Skeleton from '../components/Skeleton';

interface Events {
	name: string;
	location: string;
	description: string;
	date: string;
	time: string;
	eventCategory: string;
	eventSub: string;
	clubIg: string;
	dropin: boolean;
	tickets?: string;
	rsvp?: string;
	moreInfo?: string;
}

const Events = () => {
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<Events[]>([]);

	useEffect(() => {
		const getEvents = async () => {
			setLoading(true);

			const response = await fetch(`/.netlify/functions/getEvents`);
			const res = await response.json();

			setEvents(res);
			setLoading(false);
		};

		getEvents();
	}, []);

	return (
		<>
			<MainNav />
			<div className="px-8 pt-4 pb-8 bg-white">
				<div className="flex gap-4 flex-col">
					{!loading ? (
						events
							.sort(function (a, b) {
								return new Date(a.date).valueOf() - new Date(b.date).valueOf();
							})
							// .filter((evItem) => {
							// 	if (new Date(evItem.date).valueOf() > new Date().valueOf())
							// 		return true;
							// })
							.map((evItem, index) => {
								const date = new Date(evItem.date);
								const time = date.toLocaleTimeString('en', {
									timeStyle: 'short',
									hour12: true,
								});

								return (
									<>
										{index === 0 ||
										formatDate(date) !=
											formatDate(new Date(events[index - 1].date)) ? (
											<p className={`text-3xl ${index != 0 ? 'mt-4' : ''}`}>
												{formatDate(date)}
											</p>
										) : (
											<></>
										)}
										<div className="rounded flex flex-col md:flex-row items-start bg-zinc-50 p-4 gap-2 md:gap-8">
											<div className="flex gap-2 items-center md:items-start md:flex-col md:w-32">
												<p>{time}</p>
												<div className="bg-zinc-100 inline-flex gap-2 rounded-full py-1 px-2 items-center text-sm">
													<div
														className={`w-3 h-3 rounded-full ${evItem.eventCategory?.toLocaleLowerCase()}`}
													/>
													{evItem.eventSub || evItem.eventCategory}
												</div>
											</div>
											<div className="flex flex-col gap-1">
												<p className="text-xl">{evItem.name}</p>
												<a
													href={`https://www.instagram.com/${evItem.clubIg}/`}
													target="_blank"
													className="text-zinc-500">
													@{evItem.clubIg}
												</a>
												<p className="text-zinc-500">{evItem.location}</p>
												<div className="flex gap-2 mt-2">
													{evItem.dropin && (
														<div className="inline-block bg-violet-200	text-violet-900 rounded-full py-1 px-2">
															Drop-in
														</div>
													)}

													{evItem.tickets && (
														<a
															href={evItem.tickets}
															target="_blank"
															className="inline-block rounded-full py-1 px-2 border-solid border border-zinc-950">
															Tickets
														</a>
													)}
													{evItem.rsvp && (
														<a
															href={evItem.rsvp}
															target="_blank"
															className="inline-block rounded-full py-1 px-2 border-solid border border-zinc-950">
															RSVP
														</a>
													)}
													{evItem.moreInfo && (
														<a
															href={evItem.moreInfo}
															target="_blank"
															className="inline-block rounded-full py-1 px-2 border-solid border border-zinc-950">
															More info
														</a>
													)}
												</div>
											</div>
										</div>
									</>
								);
							})
					) : (
						<>
							<Skeleton color="bg-zinc-100" />
							<Skeleton color="bg-zinc-100" />
							<Skeleton color="bg-zinc-100" />
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Events;
