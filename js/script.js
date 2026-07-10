// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const resultsLabel = document.getElementById('resultsLabel');
const button = document.querySelector('button');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalLoading = document.getElementById('modalLoading');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

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
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
	if (event.target.hasAttribute('data-close-modal')) {
		closeModal();
	}
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeModal();
	}
});

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function openModal(item) {
	modalTitle.textContent = item.title;
	modalDate.textContent = item.date;
	modalExplanation.textContent = item.explanation;
	modalLoading.hidden = false;
	modalLoading.textContent = 'Loading image...';
	modalImage.hidden = true;
	modalImage.alt = item.title;
	modalImage.removeAttribute('src');
	modalImage.onload = null;
	modalImage.onerror = null;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');
	closeModalButton.focus();

	const previewImage = new Image();
	previewImage.onload = () => {
		modalImage.src = previewImage.src;
		modalImage.hidden = false;
		modalLoading.hidden = true;
	};
	previewImage.onerror = () => {
		modalLoading.textContent = 'Unable to load image preview.';
		modalImage.hidden = true;
	}
	previewImage.src = item.url;
}

function closeModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-open');
	modalLoading.hidden = true;
	modalLoading.textContent = 'Loading image...';
	modalImage.hidden = true;
}

async function loadImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		return;
	}

	resultsLabel.textContent = 'Loading NASA images...';

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
				card.tabIndex = 0;
				card.setAttribute('role', 'button');
				card.setAttribute('aria-label', `Open details for ${item.title}`);

				card.innerHTML = `
					<img src="${item.url}" alt="${escapeHtml(item.title)}" />
					<p><strong>${escapeHtml(item.title)}</strong></p>
					<p><small>${escapeHtml(item.date)}</small></p>
				`;

				card.addEventListener('click', () => openModal(item));
				card.addEventListener('keydown', (event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						openModal(item);
					}
				});

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
			resultsLabel.textContent = '';
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
