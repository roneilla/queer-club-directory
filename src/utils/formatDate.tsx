export const formatDate = (date: Date) => {
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();

	return monthNames[monthIndex] + ' ' + day + ', ' + year;
};
