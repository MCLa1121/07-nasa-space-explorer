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
	// Stop if NASA did not provide a URL.
	if (!url) {
		return null;
	}

	try {
		const parsedUrl = new URL(url);
		const hostname = parsedUrl.hostname.replace(/^www\./, '');

		// Regular YouTube link:
		// https://youtube.com/watch?v=VIDEO_ID
		if (
			hostname === 'youtube.com' ||
			hostname === 'm.youtube.com'
		) {
			const videoId = parsedUrl.searchParams.get('v');

			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}

			// YouTube embed, Shorts, or live URL
			const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

			if (
				pathParts[0] === 'embed' ||
				pathParts[0] === 'shorts' ||
				pathParts[0] === 'live'
			) {
				const pathVideoId = pathParts[1];

				return pathVideoId
					? `https://www.youtube.com/embed/${pathVideoId}`
					: null;
			}
		}

		// Short YouTube link:
		// https://youtu.be/VIDEO_ID
		if (hostname === 'youtu.be') {
			const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];

			return videoId
				? `https://www.youtube.com/embed/${videoId}`
				: null;
		}

		// YouTube privacy-enhanced embed link
		if (hostname.endsWith('youtube-nocookie.com')) {
			return url;
		}

		// Vimeo links
		if (hostname.endsWith('vimeo.com')) {
			const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

			// Already an embeddable Vimeo URL
			if (hostname === 'player.vimeo.com') {
				return url;
			}

			const videoId = pathParts.find((part) => /^\d+$/.test(part));

			return videoId
				? `https://player.vimeo.com/video/${videoId}`
				: null;
		}

		// The source is not a supported embeddable service.
		return null;
	} catch (error) {
		console.error('Invalid video URL:', url);
		return null;
	}
}

function resetModalMedia() {
	modalLoading.hidden = true;
	modalLoading.textContent = 'Loading image...';

	// Remove old image events and content
	modalImage.onload = null;
	modalImage.onerror = null;
	modalImage.hidden = true;
	modalImage.removeAttribute('src');
	modalImage.alt = '';

	// Remove old video events and content
	modalVideo.onload = null;
	modalVideo.onerror = null;
	modalVideo.hidden = true;
	modalVideo.removeAttribute('src');

	// Hide and reset the fallback video link
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

	// ---------------------------------------------------------
	// VIDEO ENTRY
	// ---------------------------------------------------------
	if (item.media_type === 'video') {
		const originalVideoUrl = item.url;
		const embedUrl = getVideoEmbedUrl(originalVideoUrl);
		modalVideoLink.href = item.url;
		modalVideoLink.textContent = 'Watch original video ↗';
		modalVideoLink.hidden = false;

		if (embedUrl) {
			modalLoading.textContent = 'Loading video...';
			modalLoading.hidden = false;

			// Show the iframe before assigning the source.
			modalVideo.hidden = false;
			modalVideo.title = item.title || 'NASA APOD video';

			modalVideo.onload = () => {
				modalLoading.hidden = true;
				modalVideo.hidden = false;
			};

			modalVideo.onerror = () => {
				modalLoading.hidden = true;
				modalVideo.hidden = true;
			};

			modalVideo.src = embedUrl;
			return;
		}

		modalLoading.hidden = true;
		modalVideo.hidden = true;
		return;
	}

	// ---------------------------------------------------------
	// IMAGE ENTRY
	// ---------------------------------------------------------
	const imageUrl = item.hdurl || item.url;

	if (!imageUrl) {
		modalLoading.textContent = 'No image preview is available.';
		modalLoading.hidden = false;
		return;
	}

	modalLoading.textContent = 'Loading image...';
	modalLoading.hidden = false;
	modalImage.alt = item.title;

	modalImage.onload = () => {
		modalImage.hidden = false;
		modalLoading.hidden = true;
	};

	modalImage.onerror = () => {
		modalImage.hidden = true;
		modalLoading.textContent = 'Unable to load image preview.';
	};

	// Set src after setting onload and onerror.
	modalImage.src = imageUrl;
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
	const originalButtonText = button.textContent;

	button.disabled = true;
	button.textContent = 'Loading...';

	gallery.innerHTML = `
		<div class="placeholder">
			<div class="placeholder-icon">⏳</div>
			<p>Loading NASA images...</p>
		</div>
	`;

	try {
		// Build the API URL safely.
		// thumbs=true asks NASA to include thumbnails for video entries.
		const parameters = new URLSearchParams({
			api_key: apiKey,
			start_date: startDate,
			end_date: endDate,
			thumbs: 'true'
		});

		const response = await fetch(
			`https://api.nasa.gov/planetary/apod?${parameters}`
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
					// NASA provides thumbnail_url when thumbs=true is included
					// in the API request.
					if (item.thumbnail_url) {
						card.innerHTML = `
						  <div class="gallery-image-frame gallery-video-frame">
						    <img
						      src="${escapeHtml(item.thumbnail_url)}"
						      alt="Video preview for ${escapeHtml(item.title)}"
						    />
						    <div class="video-play-badge" aria-hidden="true">▶</div>
						  </div>

						  <p>
						    <strong>${escapeHtml(item.title)}</strong>
						  </p>

						  <p>
						    <small>${escapeHtml(item.date)} · Video</small>
						  </p>
						`;
					} else {
						// Fallback when the API does not provide a thumbnail.
						card.innerHTML = `
						  <div class="gallery-item-video-preview">
						    <div class="play-badge">▶</div>
						    <p>Video</p>
						  </div>

						  <p>
						    <strong>${escapeHtml(item.title)}</strong>
						  </p>

						  <p>
						    <small>${escapeHtml(item.date)} · Video</small>
						  </p>
						`;
					}
				} else {
					card.innerHTML = `
						<div class="gallery-image-frame">
							<img
							  src="${escapeHtml(item.url)}"
							  alt="${escapeHtml(item.title)}"
							/>
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
		console.error(error);

		resultsLabel.textContent = 'Unable to load NASA images right now.';
		gallery.innerHTML = `
			<div class="placeholder">
				<div class="placeholder-icon">⚠️</div>
				<p>Unable to load NASA images right now. Please try again.</p>
			</div>
		`;
	} finally {
		// This runs after either success or failure.
		button.disabled = false;
		button.textContent = originalButtonText;
	}
}
