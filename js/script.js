// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const resultsLabel = document.getElementById('resultsLabel');
const button = document.querySelector('button');

// NASA APOD API key provided for this project
const apiKey = '6IEjw8j1Ir3XC8zSr1eIwyJ7XQC0uMteTt3n9MeO';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Load the first gallery automatically so the page is useful right away.
loadImages();

button.addEventListener('click', loadImages);

async function loadImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		return;
	}

	resultsLabel.textContent = `Showing APOD images from ${startDate} to ${endDate}.`;

	gallery.innerHTML = `
		<div class="placeholder">
			<div class="placeholder-icon">⏳</div>
			<p>Loading NASA images...</p>
		</div>
	`;

	try {
		const response = await fetch(
			`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`
		);

		if (!response.ok) {
			throw new Error('NASA API request failed.');
		}

		const data = await response.json();
		const items = Array.isArray(data) ? data : [data];
		const imageItems = items
			.filter((item) => item.media_type === 'image')
			.slice(0, 9);

		gallery.innerHTML = '';

		imageItems.forEach((item) => {
				const card = document.createElement('article');
				card.className = 'gallery-item';

				card.innerHTML = `
					<img src="${item.url}" alt="${item.title}" />
					<p><strong>${item.title}</strong></p>
					<p><small>${item.date}</small></p>
				`;

				gallery.appendChild(card);
			});

		if (!gallery.children.length) {
			resultsLabel.textContent = `No APOD images were found from ${startDate} to ${endDate}.`;
			gallery.innerHTML = `
				<div class="placeholder">
					<div class="placeholder-icon">🛰️</div>
					<p>No image results were returned for this date range.</p>
				</div>
			`;
		} else {
			resultsLabel.textContent = `Showing ${gallery.children.length} APOD images from ${startDate} to ${endDate}.`;
		}
	} catch (error) {
		resultsLabel.textContent = 'Unable to load NASA images right now.';
		gallery.innerHTML = `
			<div class="placeholder">
				<div class="placeholder-icon">⚠️</div>
				<p>Unable to load NASA images right now. Please try again.</p>
			</div>
		`;
	}
}
