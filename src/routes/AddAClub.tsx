import { useState } from 'react';
import TadaEmoji from '../assets/tada-emoji.png';

const AddAClub = () => {
	const [sent, setSent] = useState(false);
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [instagram, setInstagram] = useState<string>('');
	const [website, setWebsite] = useState<string>('');
	const [category, setCategory] = useState<string>('');
	const [location, setLocation] = useState<string>('');
	const [schedule, setSchedule] = useState<string>('');

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
		const submitDate = new Date().toISOString().slice(0, 10);
		const response = await fetch('/.netlify/functions/addAClub', {
			method: 'POST',
			body: JSON.stringify({
				name: name,
				description: description,
				instagram: instagram,
				website: website,
				category: category,
				location: location,
				schedule: schedule,
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
		setInstagram('');
		setWebsite('');
		setCategory('');
		setLocation('');
		setSchedule('');

		setSent(false);
	};

	return (
		<div className="pb-8 bg-white px-8">
			<h1 className="text-4xl pb-8">Add a club</h1>

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
								<input
									className="field"
									id="description"
									name="description"
									type="text"
									onChange={(e) => setDescription(e.target.value)}
									value={description}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="instagram">Instagram handle</label>
								<input
									className="field"
									type="text"
									id="instagram"
									name="instagram"
									onChange={(e) => setInstagram(e.target.value)}
									value={instagram}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="website">Website</label>
								<input
									className="field"
									type="text"
									id="website"
									name="website"
									onChange={(e) => setWebsite(e.target.value)}
									value={website}
								/>
							</div>
							<div className="fieldGroup">
								<label htmlFor="category">Category</label>
								<select
									className="field"
									name="category"
									id="category"
									onChange={(e) => setCategory(e.target.value)}
									value={category}>
									{categoryOpts.sort().map((cat) => (
										<option value={cat}>{cat}</option>
									))}
								</select>
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
								<label htmlFor="schedule">When</label>
								<input
									className="field"
									name="schedule"
									id="schedule"
									type="text"
									onChange={(e) => setSchedule(e.target.value)}
									value={schedule}
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

export default AddAClub;
