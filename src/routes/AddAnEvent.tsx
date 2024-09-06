import { useState } from 'react';
import TadaEmoji from '../assets/tada-emoji.png';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { commonTags } from '../directoryData';

const AddAnEvent = () => {
	const [sent, setSent] = useState(false);
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [eventDate, setEventDate] = useState<Date>();
	const [time, setTime] = useState('');
	const [location, setLocation] = useState('');
	const [moreInfo, setMoreInfo] = useState('');
	const [clubIg, setClubIg] = useState('');
	const [eventCategory, setEventCategory] = useState('');
	const [eventSub, setEventSub] = useState('');
	const [dropin, setDropin] = useState(false);
	const [tickets, setTickets] = useState('');
	const [rsvp, setRsvp] = useState('');
	const [customSub, setCustomSub] = useState('');

	const categoryOpts = [
		'entertainment',
		'sports',
		'arts',
		'social',
		'food',
		'games',
		'party',
	];

	const handleSubmit = async () => {
		const eDate = new Date(
			`${eventDate?.toISOString().substring(0, 10)} ${time}`
		);

		const submitDate = new Date().toISOString().slice(0, 10);
		const response = await fetch('/.netlify/functions/addAnEvent', {
			method: 'POST',
			body: JSON.stringify({
				name: name,
				description: description,
				date: eDate,
				location: location,
				moreInfo: moreInfo,
				clubIg: clubIg,
				eventCategory: eventCategory,
				eventSub: eventSub === 'other' ? customSub : eventSub,
				dropin: dropin,
				tickets: tickets,
				rsvp: rsvp,
				status: 'submitted',
				dateSubmitted: submitDate,
			}),
		});

		const data = await response.json();

		if (data) setSent(true);
	};

	const resetForm = () => {
		setName('');
		setDescription('');
		setEventDate(new Date());
		setTime('');
		setLocation('');
		setMoreInfo('');
		setClubIg('');
		setEventCategory('');
		setEventSub('');
		setDropin(false);
		setTickets('');
		setRsvp('');

		setSent(false);
	};

	return (
		<div className="pb-8 bg-white px-8">
			<h1 className="text-4xl pb-8">Add an event</h1>

			<div className="flex gap-8">
				{sent ? (
					<div className="bg-zinc-100 px-4 py-4 rounded flex items-center gap-4">
						<img src={TadaEmoji} className="w-24 m-4" />
						<div>
							<h3 className="text-xl">Thank you!</h3>
							<p className="mb-4">
								Submissions will be reviewed within 3 days.
							</p>
							<button className="primaryBtn" onClick={resetForm}>
								Submit another
							</button>
						</div>
					</div>
				) : (
					<>
						<div className="flex-1 max-w-96 flex flex-col gap-4">
							<div className="fieldGroup">
								<label htmlFor="clubName">Name</label>
								<input
									className="field"
									type="text"
									id="clubName"
									name="clubName"
									onChange={(e) => setName(e.target.value)}
									value={name}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="description">Description</label>
								<textarea
									className="field"
									id="description"
									name="description"
									rows={3}
									onChange={(e) => setDescription(e.target.value)}
									value={description}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="instagram">
									Event organizer's Instagram handle
								</label>
								<input
									className="field"
									type="text"
									id="clubIg"
									name="clubIg"
									onChange={(e) => setClubIg(e.target.value)}
									value={clubIg}
								/>
							</div>

							<div className="fieldGroup">
								<label htmlFor="category">Category</label>
								<select
									className="field"
									name="category"
									id="category"
									onChange={(e) => setEventCategory(e.target.value)}
									value={eventCategory}>
									{categoryOpts.sort().map((cat) => (
										<option value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div className="fieldGroup">
								<label htmlFor="eventSub">
									What is the main activity of this event?
								</label>
								<select
									className="field"
									name="eventSub"
									id="eventSub"
									onChange={(e) => setEventSub(e.target.value)}
									value={eventSub}>
									{commonTags.sort().map((cat) => (
										<option value={cat}>{cat}</option>
									))}
									<option value="other">Other</option>
								</select>

								{eventSub === 'other' && (
									<>
										<label className="mt-4" htmlFor="customSob">
											If other, please specify
										</label>
										<input
											className="field"
											type="text"
											id="customSob"
											name="customSob"
											onChange={(e) => setCustomSub(e.target.value)}
											value={customSub}
										/>
									</>
								)}
							</div>
							<div className="fieldGroup">
								<label htmlFor="location">Where</label>
								<input
									className="field"
									name="location"
									id="location"
									type="text"
									onChange={(e) => setLocation(e.target.value)}
									value={location}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="date">Date</label>
								<div className="border-zinc-100 border-solid border rounded-sm p-2">
									<DayPicker
										mode="single"
										selected={eventDate}
										onSelect={setEventDate}
									/>
								</div>
							</div>
							<div className="fieldGroup">
								<label htmlFor="time">Time</label>
								<input
									className="field"
									name="time"
									id="time"
									type="time"
									onChange={(e) => setTime(e.target.value)}
									value={time}
								/>
							</div>
							<div>
								<p>Is this a drop-in event?</p>
								<div className="flex gap-2">
									<div>
										<input
											className="mr-2"
											type="radio"
											name="topping"
											value="yes"
											id="yes"
											checked={dropin === true}
											onChange={() => setDropin(true)}
										/>
										<label htmlFor="yes">Yes</label>
									</div>
								</div>
								<div>
									<input
										className="mr-2"
										type="radio"
										name="topping"
										value="no"
										id="no"
										checked={dropin === false}
										onChange={() => setDropin(false)}
									/>
									<label htmlFor="no">No</label>
								</div>
							</div>
							<div className="fieldGroup">
								<label htmlFor="tickets">
									Ticket or RSVP link (if applicable)
								</label>
								<input
									className="field"
									name="tickets"
									id="tickets"
									type="text"
									onChange={(e) => setTickets(e.target.value)}
									value={tickets}
								/>
							</div>

							<div>
								<button className="primaryBtn" onClick={handleSubmit}>
									Submit
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AddAnEvent;
