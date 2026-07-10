// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const resultsLabel = document.getElementById('resultsLabel');
const button = document.querySelector('button');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalLoading = document.getElementById('modalLoading');
const modalImage = document.getElementById('modalImage');
const modalVideo = document.getElementById('modalVideo');
const modalVideoLink = document.getElementById('modalVideoLink');
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

showRandomSpaceFact();

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

function showRandomSpaceFact() {
	const facts = [
		'You could fit about 1.3 million Earths inside the Sun.',
		'One day on Venus is longer than one year on Venus.',
		'Neutron stars can spin around 600 times per second.',
		'Jupiter has the shortest day of all the planets in our solar system.',
		'The first image ever taken of a black hole was released in 2019.'
	];

	const randomFact = facts[Math.floor(Math.random() * facts.length)];
	spaceFact.textContent = `Did You Know? ${randomFact}`;
}

function getVideoEmbedUrl(url) {
	if (url.includes('youtube.com/watch')) {
		const videoId = new URL(url).searchParams.get('v');
		return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
	}

	if (url.includes('youtu.be/')) {
		const videoId = new URL(url).pathname.replace('/', '');
		return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
	}

	if (url.includes('youtube.com/embed/')) {
		return url;
	}

	if (url.includes('vimeo.com/')) {
		const videoId = new URL(url).pathname.split('/').filter(Boolean).pop();
		return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
	}

	return null;
}

function resetModalMedia() {
	modalLoading.hidden = true;
	modalLoading.textContent = 'Loading image...';
	modalImage.hidden = true;
	modalImage.removeAttribute('src');
	modalVideo.hidden = true;
	modalVideo.removeAttribute('src');
	modalVideoLink.hidden = true;
	modalVideoLink.removeAttribute('href');
}

function openModal(item) {
	modalTitle.textContent = item.title;
	modalDate.textContent = item.date;
	modalExplanation.textContent = item.explanation;
	resetModalMedia();
	modalLoading.hidden = false;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');
	closeModalButton.focus();

	if (item.media_type === 'video') {
		const embedUrl = getVideoEmbedUrl(item.url);

		if (embedUrl) {
			modalVideo.onload = () => {
				modalLoading.hidden = true;
				modalVideo.hidden = false;
			};
			modalVideo.onerror = () => {
				modalLoading.hidden = true;
				modalVideoLink.href = item.url;
				modalVideoLink.hidden = false;
			};
			modalVideo.src = embedUrl;
			modalVideo.title = item.title;
			modalLoading.textContent = 'Loading video...';
			return;
		}

		modalLoading.hidden = true;
		modalVideoLink.href = item.url;
		modalVideoLink.hidden = false;
		modalVideoLink.textContent = 'Open video in a new tab';
		return;
	}

	const previewImage = new Image();
	modalLoading.textContent = 'Loading image...';
	modalImage.alt = item.title;
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
	resetModalMedia();
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
		const galleryItems = items.slice(0, 9);

		gallery.innerHTML = '';

		galleryItems.forEach((item) => {
				const card = document.createElement('article');
				card.className = 'gallery-item';
				card.tabIndex = 0;
				card.setAttribute('role', 'button');
				card.setAttribute('aria-label', `Open details for ${item.title}`);

				if (item.media_type === 'video') {
					card.innerHTML = `
						<div class="gallery-item-video-preview">
							<div class="play-badge">▶</div>
							<p>Video</p>
						</div>
						<p><strong>${escapeHtml(item.title)}</strong></p>
						<p><small>${escapeHtml(item.date)}</small></p>
					`;
				} else {
					card.innerHTML = `
						<div class="gallery-image-frame">
							<img src="${item.url}" alt="${escapeHtml(item.title)}" />
						</div>
						<p><strong>${escapeHtml(item.title)}</strong></p>
						<p><small>${escapeHtml(item.date)}</small></p>
					`;
				}

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
			resultsLabel.textContent = `No APOD entries were found from ${startDate} to ${endDate}.`;
			gallery.innerHTML = `
				<div class="placeholder">
					<div class="placeholder-icon">🛰️</div>
					<p>No APOD results were returned for this date range.</p>
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
