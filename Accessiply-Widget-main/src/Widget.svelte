<script>
	import { fade, fly } from 'svelte/transition';
	import { replaceNonSansSerifFonts } from './packages/readableFont';
	import { highlightHeadings } from './packages/highlightTitle';
	import { highlightLinkButtons } from './packages/highlightLinkButtons';
	import { adjustFontSize } from './packages/scaleFontSize';
	import { adjustTextAlignment } from './packages/textalignment';
	import { adjustLineHeight } from './packages/scaleLineHeight';
	import { adjustLetterSpacing } from './packages/scaleLetterSpacing';
	import { invertColors } from './packages/invertColors';
	import { darkContract } from './packages/darkContrast';
	import { lightContrast } from './packages/lightContrast';
	import { applyHighSaturation } from './packages/highSaturation';
	import { applyLowSaturation } from './packages/lowSaturation';
	import { applyBackgroundColor } from './packages/changeBackgroundColor';
	import { applyHeadingColor } from './packages/changeHeadingColor';
	import { applyTextColor } from './packages/changeTextColor';
	import { applyLinkColor } from './packages/changeLinkColor';
	import { applyHideImages } from './packages/hideImages';
	import { applyHideVideos } from './packages/hideVideos';
	import { applyHideAnimations } from './packages/hideAnimations';
	import { toggleAudio } from './packages/deaktivateAudio';
	import { setCursorSize, togShowCustomCursor, setCursorColor } from './packages/customCursor';
	import { loadReadingHelper } from './packages/readingGuide';
	import { applyTextTransform } from './packages/capitalize';
	import { applySaturation } from './packages/saturation';
	import { testScreenReader } from './packages/testScreenReader';

	testScreenReader(true);

	/* VARIABLEN */
	let isOpen = true;
	let showWidget = true; // immer auf true lassen
	let widgetWhiteLabel = false;

	// Profiles
	let profileBlind = false;

	// Features
	let readableFonts = false;
	let highlightTitles = false;
	let highlightLinks = false;
	let lineHeightSelectedText = '1x';
	let lineHeightSelectedButton = '1x';
	let fontScaleSelectedText = '1x';
	let fontScaleSelectedButton = '1x';
	let letterSpacingSelectedText = '1x';
	let letterSpacingSelectedButton = '1x';
	let textAlignmentSelectedText = '';
	let textAlignmentSelectedButton = '';
	let storedAlignment = '';
	let invertColor = false;
	let darkContrast = false;
	let lightContrastVar = false;
	let currentBackgroundColor = 'none';
	let currentHeadingColor = 'none';
	let currentTextColor = 'none';
	let currentLinkColor = 'none';
	let hideImagesVar = false;
	let hideVideosVar = false;
	let hideAnimationsVar = false;
	let deactivateAudioVar = false;
	let cursorSizeSelectedText = 'none';
	let cursorSizeSelectedButton = 'none';
	let showCustomCursor = false;
	let currentCursorColor = 'none';
	let activateReadingGuide = false;
	let currentTextTransform = 'none';
	let textTransformSelectedButton = 'none';
	let saturationSelectedButton = 'none';

	/* FUNCTIONS */
	function toggleWidget() {
		isOpen = !isOpen;
	}

	function toggleHideWidget() {
		showWidget = !showWidget;
	}

	function toggleProfileBlind() {
		profileBlind = !profileBlind;
		//sessionStorage.setItem('profileBlind', profileBlind);
	}

	function toggleReadableFonts() {
		readableFonts = !readableFonts;
		//sessionStorage.setItem('readableFonts', readableFonts);
		console.log('Readable Font changed');
		replaceNonSansSerifFonts(readableFonts);
	}

	function toggleHighlightTitles() {
		highlightTitles = !highlightTitles;
		//sessionStorage.setItem('readableFonts', readableFonts);
		console.log('Highlight Titles changed');
		highlightHeadings(highlightTitles);
	}

	function toggleHighlightLinks() {
		highlightLinks = !highlightLinks;
		//sessionStorage.setItem('readableFonts', readableFonts);
		console.log('Highlight Links & Buttons changed');
		highlightLinkButtons(highlightLinks);
	}

	function toggleCases(getType) {
		if (currentTextTransform == getType) {
			getType = 'none';
		}
		applyTextTransform(getType);
		textTransformSelectedButton = getType;
		currentTextTransform = getType;
	}

	function toggleLineHeight(text) {
		lineHeightSelectedText = text;
		lineHeightSelectedButton = text; // Aktualisiert den ausgewählten Button
		adjustLineHeight(lineHeightSelectedText);
	}

	function toggleLetterSpacing(text) {
		letterSpacingSelectedText = text;
		letterSpacingSelectedButton = text; // Aktualisiert den ausgewählten Button
		adjustLetterSpacing(letterSpacingSelectedText);
	}

	function toggleFontScale(text) {
		fontScaleSelectedText = text;
		fontScaleSelectedButton = text; // Aktualisiert den ausgewählten Button
		adjustFontSize(fontScaleSelectedText);
	}

	function toggleTextAlignment(text) {
		textAlignmentSelectedText = text;
		textAlignmentSelectedButton = text; // Aktualisiert den ausgewählten Button
		if (storedAlignment == textAlignmentSelectedButton) {
			console.log('Same');
			textAlignmentSelectedButton = 'none';
		}
		storedAlignment = text;
		adjustTextAlignment(textAlignmentSelectedText);
	}

	function toggleInvertColors() {
		invertColor = !invertColor;
		//sessionStorage.setItem('readableFonts', readableFonts);
		console.log('Highlight Titles changed');
		invertColors(invertColor);
	}

	function toggleDarkContrast() {
		darkContrast = !darkContrast;
		//sessionStorage.setItem('readableFonts', readableFonts);
		darkContract(darkContrast);
	}

	function toggleLightContrast() {
		lightContrastVar = !lightContrastVar;
		//sessionStorage.setItem('readableFonts', readableFonts);
		lightContrast(lightContrastVar);
	}

	function toggleSaturation(mode) {
		if (saturationSelectedButton == mode) {
			saturationSelectedButton = 'none';
		} else {
			saturationSelectedButton = mode;
		}
		console.log(saturationSelectedButton);
		applySaturation(saturationSelectedButton);
	}

	function toggleBackgroundColor(color) {
		currentBackgroundColor = color;
		applyBackgroundColor(color);
	}

	function toggleHeadingColor(color) {
		currentHeadingColor = color;
		applyHeadingColor(color);
	}

	function toggleTextColor(color) {
		currentTextColor = color;
		applyTextColor(color);
	}

	function toggleLinkColor(color) {
		currentLinkColor = color;
		applyLinkColor(color);
	}

	function toggleHideImages() {
		hideImagesVar = !hideImagesVar;
		console.log(hideImagesVar);
		applyHideImages(hideImagesVar);
	}

	function toggleHideVideos() {
		hideVideosVar = !hideVideosVar;
		console.log(hideVideosVar);
		applyHideVideos(hideVideosVar);
	}

	function toggleHideAnimations() {
		hideAnimationsVar = !hideAnimationsVar;
		console.log(hideAnimationsVar);
		applyHideAnimations(hideAnimationsVar);
	}

	function toggleDeaktivateAudio() {
		deactivateAudioVar = !deactivateAudioVar;
		console.log(deactivateAudioVar);
		toggleAudio(deactivateAudioVar);
	}

	function toggleCursorSize(text) {
		cursorSizeSelectedText = text;
		cursorSizeSelectedButton = text; // Aktualisiert den ausgewählten Button
		if (!showCustomCursor) {
			console.log('toggleCursorSize');
			toggleCustomCursor();
		}
		setCursorSize(cursorSizeSelectedText);
	}

	function toggleCustomCursor() {
		showCustomCursor = !showCustomCursor;
		if (!showCustomCursor) {
			cursorSizeSelectedButton = 'none';
		}
		togShowCustomCursor(showCustomCursor);
		console.log(showCustomCursor);
	}

	function toggleCursorColor(color) {
		currentCursorColor = color;
		if (!showCustomCursor) {
			console.log('toggleCursorSize');
			toggleCustomCursor();
		}
		setCursorColor(color);
	}

	function toggleReadingGuide() {
		activateReadingGuide = !activateReadingGuide;
		console.log(activateReadingGuide);
		loadReadingHelper(activateReadingGuide);
	}
</script>

{#if showWidget}
	<button
		data-accessi-none
		class="accessi_widget-open"
		alt="Accessibility Settings"
		on:click|preventDefault={toggleWidget}
	>
		{#if isOpen != true}
			<div class="accessi_open-icon" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 800 800"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M400 733.333C584.093 733.333 733.333 584.093 733.333 400C733.333 215.905 584.093 66.6667 400 66.6667C215.905 66.6667 66.6667 215.905 66.6667 400C66.6667 584.093 215.905 733.333 400 733.333Z"
						stroke="currentColor"
						stroke-width="50"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M233.333 300L400 333.333M400 333.333L566.667 300M400 333.333V433.333M400 433.333L333.333 600M400 433.333L466.667 600"
						stroke="currentColor"
						stroke-width="50"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M400 233.333C390.797 233.333 383.333 225.871 383.333 216.667C383.333 207.462 390.797 200 400 200C409.203 200 416.667 207.462 416.667 216.667C416.667 225.871 409.203 233.333 400 233.333Z"
						fill="white"
						stroke="currentColor"
						stroke-width="50"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		{:else}
			<div class="accessi_close-icon" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g id="Menu / Close_MD">
						<path
							id="Vector"
							d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g>
				</svg>
			</div>
		{/if}
	</button>

	<!-- FULL WIDGET -->
	{#if isOpen}
		<div class="accessi_fixed" data-accessi-none data-accessi-widget>
			<div
				class="acessi_widget"
				in:fly={{ y: 100, duration: 300 }}
				out:fly={{ y: 100, duration: 200 }}
			>
				<div class="accessi_widget-gradient"></div>

				<div class="accessi_widget-menu-wrapper" data-accessi-none>
					<div class="accessi_widget-scroll">
						<div class="accessi_top-bar">
							<div class="accessi_language-wrapper">
								<a data-accessi-none href="/" class="accessi_language-link">
									<img
										src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg"
										alt="Germany Flag"
										class="accessi_langugae-icon"
									/>
									<span>Deutsch</span>
								</a>
								<a data-accessi-none href="/" class="accessi_action-button secondary">
									<div class="embed-svg small">
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="User / User_Circle">
												<path
													id="Vector"
													d="M17.2166 19.3323C15.9349 17.9008 14.0727 17 12 17C9.92734 17 8.06492 17.9008 6.7832 19.3323M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</g>
										</svg>
									</div>
								</a>
								<a data-accessi-none href="/" class="accessi_action-button secondary">
									<div class="embed-svg small">
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="Warning / Info">
												<path
													id="Vector"
													d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</g>
										</svg>
									</div>
								</a>
							</div>
							<button
								data-accessi-none
								class="accessi_close"
								on:click|preventDefault={toggleWidget}
							>
								<svg
									width="100%"
									height="100%"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 18L12 12M12 12L18 6M12 12L6 6M12 12L18 18"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						</div>

						<div class="spacer-small"></div>

						<div class="accessi_hero-header">
							<div class="max-width-medium">
								<span class="accessi_hero-title">Accessibilitysettings</span>
							</div>
							<div class="accessi_action-button-wraper">
								<button data-accessi-none class="accessi_action-button">
									<div class="embed-svg small">
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 23 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="Arrow / Arrow_Undo_Up_Left">
												<path
													id="Vector"
													d="M6.70833 13L2.875 9M2.875 9L6.70833 5M2.875 9H15.3333C17.9797 9 20.125 11.2386 20.125 14C20.125 16.7614 17.9797 19 15.3333 19H10.5417"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</g>
										</svg>
									</div>
									<span>Einstellungen zurücksetzen</span>
								</button>
								<button
									data-accessi-none
									class="accessi_action-button"
									on:click|preventDefault={toggleHideWidget}
								>
									<div class="embed-svg small">
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g id="Edit / Hide">
												<path
													id="Vector"
													d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</g>
										</svg>
									</div>
									<span>Oberfläche ausblenden</span>
								</button>
							</div>
						</div>

						<div class="spacer-large"></div>

						<div class="accessi_widget-content-wrapper">
							<!-- FUNCTIONS -->
							<form>
								<div class="accessi_form-wrapper">
									<div class="accessi_widget-content-item">
										<span class="accessi_heading" data-accessi-none
											>Wählen Sie das richtige Zugänglichkeitsprofil</span
										>

										<div class="spacer-small"></div>

										<!-- THIS PROFILE IS ADJUSTED -->
										<div class="accessi_widget-vertical-wrapper">
											<button
												data-accessi-none
												class="accessi_widget-vertical-item"
												class:pressed={profileBlind}
												on:click|preventDefault={toggleProfileBlind}
											>
												<div class="embed-svg profiles" class:pressed={profileBlind}>
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Edit / Show">
															<g id="Vector">
																<path
																	d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
																<path
																	d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</g>
													</svg>
												</div>
												<span>Blind</span>
												{#if profileBlind}
													<div class="embed-svg check">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Interface / Check">
																<path
																	id="Vector"
																	d="M6 12L10.2426 16.2426L18.727 7.75732"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												{/if}
											</button>

											<button data-accessi-none class="accessi_widget-vertical-item">
												<div class="embed-svg profiles">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Edit / Show">
															<g id="Vector">
																<path
																	d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
																<path
																	d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</g>
													</svg>
												</div>
												<span>Color Blind</span>
												<div class="embed-svg check">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Interface / Check">
															<path
																id="Vector"
																d="M6 12L10.2426 16.2426L18.727 7.75732"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</g>
													</svg>
												</div>
											</button>

											<button data-accessi-none class="accessi_widget-vertical-item">
												<div class="embed-svg profiles">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Edit / Show">
															<g id="Vector">
																<path
																	d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
																<path
																	d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</g>
													</svg>
												</div>
												<span>ADHD Friendly</span>
												<div class="embed-svg check">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Interface / Check">
															<path
																id="Vector"
																d="M6 12L10.2426 16.2426L18.727 7.75732"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</g>
													</svg>
												</div>
											</button>

											<button data-accessi-none class="accessi_widget-vertical-item">
												<div class="embed-svg profiles">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Edit / Show">
															<g id="Vector">
																<path
																	d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
																<path
																	d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</g>
													</svg>
												</div>
												<span>ADHD Friendly</span>
												<div class="embed-svg check">
													<svg
														width="100%"
														height="100%"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<g id="Interface / Check">
															<path
																id="Vector"
																d="M6 12L10.2426 16.2426L18.727 7.75732"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</g>
													</svg>
												</div>
											</button>
										</div>
									</div>

									<div class="accessi_widget-content-item">
										<span class="accessi_heading" data-accessi-none
											>Wählen Sie das richtige Zugänglichkeitsprofil</span
										>

										<div class="spacer-small"></div>

										<div class="accessi_widget-vertical-wrapper _3grid">
											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={readableFonts}
												on:click|preventDefault={toggleReadableFonts}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M20 5.33331H29.3333V7.99998H20V5.33331ZM21.3333 10.6666H29.3333V13.3333H21.3333V10.6666ZM24 16H29.3333V18.6666H24V16ZM12.4093 5.33331L4.40933 26.6666H7.25867L9.75867 20H18.2427L20.7427 26.6666H23.592L15.592 5.33331H12.4093ZM10.7573 17.3333L14 8.68665L17.2427 17.3333H10.7573Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Lesbare Schrift</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={highlightTitles}
												on:click|preventDefault={toggleHighlightTitles}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn underline" class:pressed={highlightTitles}>
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Text">
																<path
																	id="Vector"
																	d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Titel hervorheben</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={highlightLinks}
												on:click|preventDefault={toggleHighlightLinks}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn underline" class:pressed={highlightLinks}>
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Interface / Link_Horizontal">
																<path
																	id="Vector"
																	d="M8 12H16M15 8H17C19.2091 8 21 9.79086 21 12C21 14.2091 19.2091 16 17 16H15M9 8H7C4.79086 8 3 9.79086 3 12C3 14.2091 4.79086 16 7 16H9"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Links hervorheben</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleCases('capitalize')}
												class:pressed={textTransformSelectedButton === 'capitalize'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M4 25.3334V11.3334C4 10.0957 4.49167 8.90869 5.36684 8.03352C6.24201 7.15835 7.42899 6.66669 8.66667 6.66669C9.90434 6.66669 11.0913 7.15835 11.9665 8.03352C12.8417 8.90869 13.3333 10.0957 13.3333 11.3334V25.3334M4 17.3334H13.3333M28 16V25.3334M18.6667 20.6667C18.6667 21.9044 19.1583 23.0914 20.0335 23.9665C20.9087 24.8417 22.0957 25.3334 23.3333 25.3334C24.571 25.3334 25.758 24.8417 26.6332 23.9665C27.5083 23.0914 28 21.9044 28 20.6667C28 19.429 27.5083 18.242 26.6332 17.3669C25.758 16.4917 24.571 16 23.3333 16C22.0957 16 20.9087 16.4917 20.0335 17.3669C19.1583 18.242 18.6667 19.429 18.6667 20.6667Z"
																stroke="currentColor"
																stroke-width="2.66667"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													</div>
												</div>
												<span>Titlecase</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Arrow / Expand">
																	<path
																		id="Vector"
																		d="M10 19H5V14M14 5H19V10"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Schriftgröße</span>
												</div>
												<div class="accessi_num-wrapper">
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleFontScale('1x')}
														class:pressed={fontScaleSelectedButton === '1x'}
													>
														<span>1x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleFontScale('1.5x')}
														class:pressed={fontScaleSelectedButton === '1.5x'}
													>
														<span>1.5x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleFontScale('2x')}
														class:pressed={fontScaleSelectedButton === '2x'}
													>
														<span>2x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleFontScale('2.5x')}
														class:pressed={fontScaleSelectedButton === '2.5x'}
													>
														<span>2.5x</span>
													</button>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleCases('uppercase')}
												class:pressed={textTransformSelectedButton === 'uppercase'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M4 25.3334V11.3334C4 10.0957 4.49167 8.90869 5.36684 8.03352C6.24201 7.15835 7.42899 6.66669 8.66667 6.66669C9.90434 6.66669 11.0913 7.15835 11.9665 8.03352C12.8417 8.90869 13.3333 10.0957 13.3333 11.3334V25.3334M4 17.3334H13.3333M18.6667 25.3334V11.3334C18.6667 10.0957 19.1583 8.90869 20.0335 8.03352C20.9087 7.15835 22.0957 6.66669 23.3333 6.66669C24.571 6.66669 25.758 7.15835 26.6332 8.03352C27.5083 8.90869 28 10.0957 28 11.3334V25.3334M18.6667 17.3334H28"
																stroke="currentColor"
																stroke-width="2.66667"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													</div>
												</div>
												<span>Großbuchstaben</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Edit / Move_Vertical">
																	<path
																		id="Vector"
																		d="M12 21V3M12 21L15 18M12 21L9 18M12 3L9 6M12 3L15 6"
																		stroke="currentColor"
																		stroke-width="1.8"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Zeilenhöhe</span>
												</div>
												<div class="accessi_num-wrapper">
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLineHeight('1x')}
														class:pressed={lineHeightSelectedButton === '1x'}
													>
														<span>1x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLineHeight('1.5x')}
														class:pressed={lineHeightSelectedButton === '1.5x'}
													>
														<span>1.5x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLineHeight('2x')}
														class:pressed={lineHeightSelectedButton === '2x'}
													>
														<span>2x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLineHeight('2.5x')}
														class:pressed={lineHeightSelectedButton === '2.5x'}
													>
														<span>2.5x</span>
													</button>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleCases('lowercase')}
												class:pressed={textTransformSelectedButton === 'lowercase'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M13.3333 16V25.3333M28 16V25.3333M4 20.6667C4 21.2795 4.12071 21.8863 4.35523 22.4525C4.58975 23.0187 4.9335 23.5332 5.36684 23.9665C5.80018 24.3998 6.31462 24.7436 6.88081 24.9781C7.447 25.2126 8.05383 25.3333 8.66667 25.3333C9.2795 25.3333 9.88634 25.2126 10.4525 24.9781C11.0187 24.7436 11.5332 24.3998 11.9665 23.9665C12.3998 23.5332 12.7436 23.0187 12.9781 22.4525C13.2126 21.8863 13.3333 21.2795 13.3333 20.6667C13.3333 20.0538 13.2126 19.447 12.9781 18.8808C12.7436 18.3146 12.3998 17.8002 11.9665 17.3668C11.5332 16.9335 11.0187 16.5898 10.4525 16.3552C9.88634 16.1207 9.2795 16 8.66667 16C8.05383 16 7.447 16.1207 6.88081 16.3552C6.31462 16.5898 5.80018 16.9335 5.36684 17.3668C4.9335 17.8002 4.58975 18.3146 4.35523 18.8808C4.12071 19.447 4 20.0538 4 20.6667ZM18.6667 20.6667C18.6667 21.9043 19.1583 23.0913 20.0335 23.9665C20.9087 24.8417 22.0957 25.3333 23.3333 25.3333C24.571 25.3333 25.758 24.8417 26.6332 23.9665C27.5083 23.0913 28 21.9043 28 20.6667C28 19.429 27.5083 18.242 26.6332 17.3668C25.758 16.4917 24.571 16 23.3333 16C22.0957 16 20.9087 16.4917 20.0335 17.3668C19.1583 18.242 18.6667 19.429 18.6667 20.6667Z"
																stroke="currentColor"
																stroke-width="2.66667"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													</div>
												</div>
												<span>Kleinbuchstaben</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Edit / Move_Horizontal">
																	<path
																		id="Vector"
																		d="M3 12H21M3 12L6 15M3 12L6 9M21 12L18 9M21 12L18 15"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Buchstabenabstand</span>
												</div>
												<div class="accessi_num-wrapper">
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLetterSpacing('1x')}
														class:pressed={letterSpacingSelectedButton === '1x'}
													>
														<span>1x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLetterSpacing('1.5x')}
														class:pressed={letterSpacingSelectedButton === '1.5x'}
													>
														<span>1.5x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLetterSpacing('2x')}
														class:pressed={letterSpacingSelectedButton === '2x'}
													>
														<span>2x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleLetterSpacing('2.5x')}
														class:pressed={letterSpacingSelectedButton === '2.5x'}
													>
														<span>2.5x</span>
													</button>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleTextAlignment('left')}
												class:pressed={textAlignmentSelectedButton === 'left'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Text_Align_Left">
																<path
																	id="Vector"
																	d="M4 18H14M4 14H20M4 10H14M4 6H20"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Text Links</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleTextAlignment('center')}
												class:pressed={textAlignmentSelectedButton === 'center'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Text_Align_Justify">
																<path
																	id="Vector"
																	d="M20 18H4M20 14H4M20 10H4M20 6H4"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Text Zentriert</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleTextAlignment('right')}
												class:pressed={textAlignmentSelectedButton === 'right'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Text_Align_Right">
																<path
																	id="Vector"
																	d="M20 18H10M20 14H4M20 10H10M20 6H4"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Text Rechts</span>
											</button>
										</div>
									</div>

									<div class="accessi_widget-content-item">
										<span class="accessi_heading" data-accessi-none
											>Wählen Sie das richtige Zugänglichkeitsprofil</span
										>

										<div class="spacer-small"></div>

										<div class="accessi_widget-vertical-wrapper _3grid">
											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={invertColor}
												on:click|preventDefault={() => toggleInvertColors()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Arrow / Arrow_Left_Right">
																<path
																	id="Vector"
																	d="M16 13L19 16M19 16L16 19M19 16H5M8 11L5 8M5 8L8 5M5 8H19"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Farbe umkehren</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={darkContrast}
												on:click|preventDefault={() => toggleDarkContrast()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Environment / Moon">
																<path
																	id="Vector"
																	d="M9 6C9 10.9706 13.0294 15 18 15C18.9093 15 19.787 14.8655 20.6144 14.6147C19.4943 18.3103 16.0613 20.9999 12 20.9999C7.02944 20.9999 3 16.9707 3 12.0001C3 7.93883 5.69007 4.50583 9.38561 3.38574C9.13484 4.21311 9 5.09074 9 6Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Dunkler Kontrast</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={lightContrastVar}
												on:click|preventDefault={() => toggleLightContrast()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Environment / Sun">
																<path
																	id="Vector"
																	d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Heller Kontrast</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleSaturation('high')}
												class:pressed={saturationSelectedButton === 'high'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M16 6.41335V25.3334C11.5867 25.3334 8.00001 21.8267 8.00001 17.5067C8.00001 15.4267 8.82668 13.4667 10.3333 11.9867L16 6.41335ZM16 2.66669L8.46668 10.08C6.53334 11.9867 5.33334 14.6134 5.33334 17.5067C5.33334 23.3067 10.1067 28 16 28C21.8933 28 26.6667 23.3067 26.6667 17.5067C26.6667 14.6134 25.4667 11.9867 23.5333 10.08L16 2.66669Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Hohe Sättigung</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Edit / Show">
																	<g id="Vector">
																		<path
																			d="M3.5868 13.7788C5.36623 15.5478 8.46953 17.9999 12.0002 17.9999C15.5308 17.9999 18.6335 15.5478 20.413 13.7788C20.8823 13.3123 21.1177 13.0782 21.2671 12.6201C21.3738 12.2933 21.3738 11.7067 21.2671 11.3799C21.1177 10.9218 20.8823 10.6877 20.413 10.2211C18.6335 8.45208 15.5308 6 12.0002 6C8.46953 6 5.36623 8.45208 3.5868 10.2211C3.11714 10.688 2.88229 10.9216 2.7328 11.3799C2.62618 11.7067 2.62618 12.2933 2.7328 12.6201C2.88229 13.0784 3.11714 13.3119 3.5868 13.7788Z"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		/>
																		<path
																			d="M10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12Z"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		/>
																	</g>
																</g>
															</svg>
														</div>
													</div>
													<span>Hintergrundfarbe</span>
												</div>
												<div class="accessi_color-wrapper">
													<button
														class="accessi_color-dot blue"
														on:click|preventDefault={() => toggleBackgroundColor('#282ADD')}
														class:pressed={currentBackgroundColor === '#282ADD'}
													></button>
													<button
														class="accessi_color-dot orange"
														on:click|preventDefault={() => toggleBackgroundColor('#DD8428')}
														class:pressed={currentBackgroundColor === '#DD8428'}
													></button>
													<button
														class="accessi_color-dot yellow"
														on:click|preventDefault={() => toggleBackgroundColor('#DDB728')}
														class:pressed={currentBackgroundColor === '#DDB728'}
													></button>
													<button
														class="accessi_color-dot turquoise"
														on:click|preventDefault={() => toggleBackgroundColor('#28D8DD')}
														class:pressed={currentBackgroundColor === '#28D8DD'}
													></button>
													<button
														class="accessi_color-dot white"
														on:click|preventDefault={() => toggleBackgroundColor('#FFFFFF')}
														class:pressed={currentBackgroundColor === '#FFFFFF'}
													></button>
													<button
														class="accessi_color-dot black"
														on:click|preventDefault={() => toggleBackgroundColor('#000000')}
														class:pressed={currentBackgroundColor === '#000000'}
													></button>
												</div>
												<div style="margin-top: -0.2rem;">
													<button
														style="text-decoration: underline;"
														on:click|preventDefault={() => toggleBackgroundColor('none')}
														>Reset</button
													>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												on:click|preventDefault={() => toggleSaturation('low')}
												class:pressed={saturationSelectedButton === 'low'}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																opacity="0.3"
																d="M10.3333 11.9867C9.59489 12.7039 9.00788 13.562 8.60708 14.5101C8.20628 15.4583 7.99985 16.4773 8 17.5067C8 21.8267 11.5867 25.3333 16 25.3333V6.41333L10.3333 11.9867Z"
																fill="currentColor"
															/>
															<path
																d="M23.5333 10.08L16 2.66663L8.46668 10.08C6.53334 11.9866 5.33334 14.6133 5.33334 17.5066C5.33334 23.3066 10.1067 28 16 28C21.8933 28 26.6667 23.3066 26.6667 17.5066C26.6667 14.6133 25.4667 11.9866 23.5333 10.08ZM8.00001 17.5066C8.00001 15.4266 8.82668 13.4666 10.3333 11.9866L16 6.41329V25.3333C11.5867 25.3333 8.00001 21.8266 8.00001 17.5066Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Niedrige Sättigung</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Arrow / Expand">
																	<path
																		id="Vector"
																		d="M10 19H5V14M14 5H19V10"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Titelfarbe</span>
												</div>
												<div class="accessi_color-wrapper">
													<button
														class="accessi_color-dot blue"
														on:click|preventDefault={() => toggleHeadingColor('#282ADD')}
														class:pressed={currentHeadingColor === '#282ADD'}
													></button>
													<button
														class="accessi_color-dot orange"
														on:click|preventDefault={() => toggleHeadingColor('#DD8428')}
														class:pressed={currentHeadingColor === '#DD8428'}
													></button>
													<button
														class="accessi_color-dot yellow"
														on:click|preventDefault={() => toggleHeadingColor('#DDB728')}
														class:pressed={currentHeadingColor === '#DDB728'}
													></button>
													<button
														class="accessi_color-dot turquoise"
														on:click|preventDefault={() => toggleHeadingColor('#28D8DD')}
														class:pressed={currentHeadingColor === '#28D8DD'}
													></button>
													<button
														class="accessi_color-dot white"
														on:click|preventDefault={() => toggleHeadingColor('#FFFFFF')}
														class:pressed={currentHeadingColor === '#FFFFFF'}
													></button>
													<button
														class="accessi_color-dot black"
														on:click|preventDefault={() => toggleHeadingColor('#000000')}
														class:pressed={currentHeadingColor === '#000000'}
													></button>
												</div>
												<div style="margin-top: -0.2rem;">
													<button
														style="text-decoration: underline;"
														on:click|preventDefault={() => toggleHeadingColor('none')}>Reset</button
													>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M23.5333 10.08L16 2.66669L8.46665 10.08C6.53331 11.9867 5.33331 14.6134 5.33331 17.5067C5.33331 23.3067 10.1066 28 16 28C21.8933 28 26.6666 23.3067 26.6666 17.5067C26.6666 14.6134 25.4666 11.9867 23.5333 10.08Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Entsättigt</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Arrow / Expand">
																	<path
																		id="Vector"
																		d="M10 19H5V14M14 5H19V10"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Textfarbe</span>
												</div>
												<div class="accessi_color-wrapper">
													<button
														class="accessi_color-dot blue"
														on:click|preventDefault={() => toggleTextColor('#282ADD')}
														class:pressed={currentTextColor === '#282ADD'}
													></button>
													<button
														class="accessi_color-dot orange"
														on:click|preventDefault={() => toggleTextColor('#DD8428')}
														class:pressed={currentTextColor === '#DD8428'}
													></button>
													<button
														class="accessi_color-dot yellow"
														on:click|preventDefault={() => toggleTextColor('#DDB728')}
														class:pressed={currentTextColor === '#DDB728'}
													></button>
													<button
														class="accessi_color-dot turquoise"
														on:click|preventDefault={() => toggleTextColor('#28D8DD')}
														class:pressed={currentTextColor === '#28D8DD'}
													></button>
													<button
														class="accessi_color-dot white"
														on:click|preventDefault={() => toggleTextColor('#FFFFFF')}
														class:pressed={currentTextColor === '#FFFFFF'}
													></button>
													<button
														class="accessi_color-dot black"
														on:click|preventDefault={() => toggleTextColor('#000000')}
														class:pressed={currentTextColor === '#000000'}
													></button>
												</div>
												<div style="margin-top: -0.2rem;">
													<button
														style="text-decoration: underline;"
														on:click|preventDefault={() => toggleTextColor('none')}>Reset</button
													>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Font">
																<path
																	id="Vector"
																	d="M13 18L8 6L3 18M11 14H5M21 18V15M21 15V12M21 15C21 16.6569 19.6569 18 18 18C16.3431 18 15 16.6569 15 15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Lesbare Schrift</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<g id="Arrow / Expand">
																	<path
																		id="Vector"
																		d="M10 19H5V14M14 5H19V10"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</svg>
														</div>
													</div>
													<span>Linkfarbe</span>
												</div>
												<div class="accessi_color-wrapper">
													<button
														class="accessi_color-dot blue"
														on:click|preventDefault={() => toggleLinkColor('#282ADD')}
														class:pressed={currentLinkColor === '#282ADD'}
													></button>
													<button
														class="accessi_color-dot orange"
														on:click|preventDefault={() => toggleLinkColor('#DD8428')}
														class:pressed={currentLinkColor === '#DD8428'}
													></button>
													<button
														class="accessi_color-dot yellow"
														on:click|preventDefault={() => toggleLinkColor('#DDB728')}
														class:pressed={currentLinkColor === '#DDB728'}
													></button>
													<button
														class="accessi_color-dot turquoise"
														on:click|preventDefault={() => toggleLinkColor('#28D8DD')}
														class:pressed={currentLinkColor === '#28D8DD'}
													></button>
													<button
														class="accessi_color-dot white"
														on:click|preventDefault={() => toggleLinkColor('#FFFFFF')}
														class:pressed={currentLinkColor === '#FFFFFF'}
													></button>
													<button
														class="accessi_color-dot black"
														on:click|preventDefault={() => toggleLinkColor('#000000')}
														class:pressed={currentLinkColor === '#000000'}
													></button>
												</div>
												<div style="margin-top: -0.2rem;">
													<button
														style="text-decoration: underline;"
														on:click|preventDefault={() => toggleLinkColor('none')}>Reset</button
													>
												</div>
											</div>
										</div>
									</div>

									<div class="accessi_widget-content-item">
										<span class="accessi_heading" data-accessi-none
											>Wählen Sie das richtige Zugänglichkeitsprofil</span
										>

										<div class="spacer-small"></div>

										<div class="accessi_widget-vertical-wrapper _3grid">
											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={hideImagesVar}
												on:click|preventDefault={() => toggleHideImages()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 27 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M9.33412 4.289C9.54468 4.10389 9.82886 4.00005 10.125 4H16.875C17.1734 4 17.4595 4.10536 17.6705 4.29289C17.8815 4.48043 18 4.73478 18 5C18 5.53043 18.2371 6.03914 18.659 6.41421C19.081 6.78929 19.6533 7 20.25 7H21.375C21.9717 7 22.544 7.21071 22.966 7.58579C23.3879 7.96086 23.625 8.46957 23.625 9V17M22.2896 19.828C22.0095 19.938 21.7001 20 21.375 20H5.625C5.02826 20 4.45597 19.7893 4.03401 19.4142C3.61205 19.0391 3.375 18.5304 3.375 18V9C3.375 8.46957 3.61205 7.96086 4.03401 7.58579C4.45597 7.21071 5.02826 7 5.625 7H6.75C7.08525 7 7.4025 6.935 7.68825 6.819"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M11.7247 10.448C11.2907 10.6871 10.9234 11.0106 10.6504 11.3941C10.3773 11.7777 10.2058 12.2113 10.1486 12.6623C10.0915 13.1133 10.1502 13.57 10.3204 13.9979C10.4905 14.4258 10.7677 14.8139 11.131 15.1328C11.4944 15.4517 11.9344 15.6931 12.4179 15.839C12.9014 15.9848 13.4159 16.0313 13.9225 15.9748C14.4291 15.9183 14.9147 15.7604 15.3428 15.5129C15.7708 15.2654 16.13 14.9348 16.3935 14.546M3.375 3L23.625 21"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													</div>
												</div>
												<span>Bilder ausblenden</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={hideVideosVar}
												on:click|preventDefault={() => toggleHideVideos()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 36 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M27 9.33333C27 7.86267 25.6545 6.66667 24 6.66667H9.621L5.5605 3.05733L3.4395 4.94267L30.4395 28.9427L32.5605 27.0573L27 22.1147V18.2227L33 22.6667V9.33333L27 13.7773V9.33333ZM24 19.448L12.621 9.33333H24V19.448ZM6 25.3333H22.3185L19.3185 22.6667H6V10.828L3.2175 8.35333C3.0762 8.66491 3.00241 8.9974 3 9.33333V22.6667C3 24.1373 4.3455 25.3333 6 25.3333Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Videos ausblenden</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={hideAnimationsVar}
												on:click|preventDefault={() => toggleHideAnimations()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 32 32"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g clip-path="url(#clip0_1_6)">
																<path
																	d="M29.0533 24L31.72 26.6667H32V24H29.0533ZM1.48 3.97333L3.54667 6.05333C3 6.54667 2.66667 7.24 2.66667 8.02667V21.3333C2.66667 22.8 3.86667 24 5.34667 24H0V26.6667H24.1733L27.7867 30.28L29.6667 28.4L3.36 2.09333L1.48 3.97333ZM5.33333 8.02667H5.50667L12.1067 14.6C10.5867 16.0933 9.74667 18.0267 9.33333 20C10.6133 18.28 12.1733 17.2267 14.2267 16.72L18.84 21.36H5.33333V8.02667ZM26.6667 8.02667V21.6133L28.4 23.3467C28.96 22.8533 29.3333 22.16 29.3333 21.36V8.02667C29.3333 7.31942 29.0524 6.64115 28.5523 6.14105C28.0522 5.64095 27.3739 5.36 26.6667 5.36H10.4L13.0667 8.02667H26.6667ZM17.24 12.2L20.96 15.9067L22.6667 14.3067L17.3333 9.33333V12.1733L17.24 12.2Z"
																	fill="currentColor"
																/>
															</g>
															<defs>
																<clipPath id="clip0_1_6">
																	<rect width="100%" height="100%" fill="currentColor" />
																</clipPath>
															</defs>
														</svg>
													</div>
												</div>
												<span>Animationen deaktivieren</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={showCustomCursor}
												on:click|preventDefault={() => toggleCustomCursor()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 256 256"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M220.49 207.8L207.8 220.49C206.685 221.609 205.36 222.496 203.902 223.102C202.443 223.708 200.879 224.019 199.3 224.019C197.721 224.019 196.157 223.708 194.698 223.102C193.24 222.496 191.915 221.609 190.8 220.49L134.23 163.92L115 214.08L114.87 214.41C113.644 217.265 111.605 219.697 109.007 221.402C106.409 223.107 103.367 224.011 100.26 224H99.48C96.2403 223.864 93.1205 222.736 90.5431 220.769C87.9657 218.801 86.0551 216.089 85.07 213L32.8 52.92C31.8832 50.1189 31.7605 47.1185 32.4455 44.2519C33.1305 41.3853 34.5964 38.7645 36.6804 36.6804C38.7645 34.5964 41.3853 33.1305 44.2519 32.4455C47.1185 31.7605 50.1189 31.8832 52.92 32.8L213 85.07C216.059 86.0935 218.738 88.0179 220.684 90.5908C222.631 93.1637 223.754 96.2648 223.906 99.4873C224.059 102.71 223.234 105.903 221.539 108.648C219.844 111.393 217.359 113.562 214.41 114.87L214.08 115L163.92 134.27L220.49 190.83C222.74 193.08 224.004 196.133 224.004 199.315C224.004 202.497 222.74 205.55 220.49 207.8Z"
																fill="currentColor"
															/>
														</svg>
													</div>
												</div>
												<span>Zeiger einblenden</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 32 32"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M10.5387 23.4173C10.6096 23.7359 10.7762 24.0251 11.0162 24.2463C11.2562 24.4675 11.5581 24.6099 11.8813 24.6546C12.2046 24.6993 12.5338 24.6441 12.8248 24.4963C13.1158 24.3486 13.3547 24.1154 13.5093 23.828L16.296 19.704L22.8387 26.2467C22.9708 26.3788 23.1276 26.4836 23.3002 26.5551C23.4728 26.6266 23.6578 26.6634 23.8447 26.6634C24.0315 26.6634 24.2165 26.6266 24.3891 26.5551C24.5617 26.4836 24.7186 26.3788 24.8507 26.2467L26.2467 24.8507C26.3788 24.7186 26.4836 24.5617 26.5551 24.3891C26.6266 24.2165 26.6634 24.0315 26.6634 23.8447C26.6634 23.6578 26.6266 23.4728 26.5551 23.3002C26.4836 23.1276 26.3788 22.9708 26.2467 22.8387L19.704 16.296L23.8547 13.5093C24.142 13.3546 24.3752 13.1156 24.5229 12.8245C24.6705 12.5334 24.7256 12.2042 24.6808 11.8809C24.636 11.5576 24.4933 11.2557 24.272 11.0158C24.0507 10.7759 23.7613 10.6094 23.4427 10.5387L5.33334 5.33333L10.5387 23.4173Z"
																	stroke="currentColor"
																	stroke-width="2.66667"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</svg>
														</div>
													</div>
													<span>Zeigergröße</span>
												</div>
												<div class="accessi_num-wrapper">
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleCursorSize('1x')}
														class:pressed={cursorSizeSelectedButton === '1x'}
													>
														<span>1x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleCursorSize('1.5x')}
														class:pressed={cursorSizeSelectedButton === '1.5x'}
													>
														<span>1.5x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleCursorSize('2x')}
														class:pressed={cursorSizeSelectedButton === '2x'}
													>
														<span>2x</span>
													</button>
													<button
														data-accessi-none
														class="accessi_num-button"
														on:click|preventDefault={() => toggleCursorSize('2.5x')}
														class:pressed={cursorSizeSelectedButton === '2.5x'}
													>
														<span>2.5x</span>
													</button>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={deactivateAudioVar}
												on:click|preventDefault={() => toggleDeaktivateAudio()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Media / Volume_Off">
																<path
																	id="Vector"
																	d="M16.1716 9.17117L21.8284 14.828M16.1716 14.828L21.8284 9.17117M7.4803 15.4065L9.15553 17.4796C10.0288 18.5603 10.4655 19.1006 10.848 19.1594C11.1792 19.2104 11.5138 19.092 11.7394 18.8443C12 18.5581 12 17.8634 12 16.4739V7.52526C12 6.13581 12 5.44109 11.7394 5.1549C11.5138 4.90715 11.1792 4.78884 10.848 4.83975C10.4655 4.89858 10.0288 5.43893 9.15553 6.51963L7.4803 8.59273C7.30388 8.81105 7.21567 8.92021 7.10652 8.99876C7.00982 9.06835 6.90147 9.1201 6.78656 9.15158C6.65687 9.1871 6.51652 9.1871 6.23583 9.1871H4.8125C4.0563 9.1871 3.6782 9.1871 3.37264 9.28804C2.77131 9.4867 2.2996 9.95841 2.10094 10.5597C2 10.8653 2 11.2434 2 11.9996C2 12.7558 2 13.1339 2.10094 13.4395C2.2996 14.0408 2.77131 14.5125 3.37264 14.7112C3.6782 14.8121 4.0563 14.8121 4.8125 14.8121H6.23583C6.51652 14.8121 6.65687 14.8121 6.78656 14.8476C6.90147 14.8791 7.00982 14.9308 7.10652 15.0004C7.21567 15.079 7.30388 15.1881 7.4803 15.4065Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Audio deaktivieren</span>
											</button>

											<div class="accessi_button-wrapper accessi_widget-vertical-item full-width">
												<div class="accessi_horizontal">
													<div class="accessi_widget-vertical-left center">
														<div class="embed-svg btn">
															<svg
																width="100%"
																height="100%"
																viewBox="0 0 32 32"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M26.004 13.2933C27.6093 13.9453 27.4867 16.2587 25.8213 16.7373L17.4147 19.1547L13.5747 27.0147C12.8133 28.572 10.5133 28.2907 10.1493 26.596L6.236 8.34267C6.16607 8.01822 6.18592 7.68085 6.29342 7.36684C6.40092 7.05284 6.592 6.77409 6.8461 6.56057C7.10021 6.34706 7.40771 6.20687 7.73555 6.15509C8.06338 6.1033 8.39913 6.14188 8.70667 6.26667L26.004 13.2933Z"
																	fill="#D9D9D9"
																	stroke="currentColor"
																	stroke-width="2"
																/>
															</svg>
														</div>
													</div>
													<span>Zeigerfarbe</span>
												</div>
												<div class="accessi_color-wrapper">
													<button
														class="accessi_color-dot blue"
														on:click|preventDefault={() => toggleCursorColor('#282ADD')}
														class:pressed={currentCursorColor === '#282ADD'}
													></button>
													<button
														class="accessi_color-dot orange"
														on:click|preventDefault={() => toggleCursorColor('#DD8428')}
														class:pressed={currentCursorColor === '#DD8428'}
													></button>
													<button
														class="accessi_color-dot yellow"
														on:click|preventDefault={() => toggleCursorColor('#DDB728')}
														class:pressed={currentCursorColor === '#DDB728'}
													></button>
													<button
														class="accessi_color-dot turquoise"
														on:click|preventDefault={() => toggleCursorColor('#28D8DD')}
														class:pressed={currentCursorColor === '#28D8DD'}
													></button>
													<button
														class="accessi_color-dot white"
														on:click|preventDefault={() => toggleCursorColor('#FFFFFF')}
														class:pressed={currentCursorColor === '#FFFFFF'}
													></button>
													<button
														class="accessi_color-dot black"
														on:click|preventDefault={() => toggleCursorColor('#000000')}
														class:pressed={currentCursorColor === '#000000'}
													></button>
												</div>
											</div>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
												class:pressed={activateReadingGuide}
												on:click|preventDefault={() => toggleReadingGuide()}
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Rows">
																<g id="Vector">
																	<path
																		d="M6.5 19H17.5C17.9647 19 18.197 18.9999 18.3902 18.9614C19.1836 18.8036 19.8036 18.1836 19.9614 17.3902C19.9999 17.197 19.9999 16.9647 19.9999 16.5C19.9999 16.0353 19.9999 15.8031 19.9614 15.6099C19.8036 14.8165 19.1836 14.1962 18.3902 14.0384C18.197 14 17.9647 14 17.5 14H6.5C6.03534 14 5.80306 14 5.60986 14.0384C4.81648 14.1962 4.19624 14.8165 4.03843 15.6099C4 15.8031 4 16.0354 4 16.5C4 16.9647 4 17.1969 4.03843 17.3901C4.19624 18.1835 4.81648 18.8036 5.60986 18.9614C5.80306 18.9999 6.03535 19 6.5 19Z"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</g>
															</g>
														</svg>
													</div>
												</div>
												<span>Lesehilfe</span>
											</button>

											<button
												data-accessi-none
												class="accessi_button-wrapper accessi_widget-vertical-item"
											>
												<div class="accessi_widget-vertical-left center">
													<div class="embed-svg btn">
														<svg
															width="100%"
															height="100%"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g id="Edit / Font">
																<path
																	id="Vector"
																	d="M13 18L8 6L3 18M11 14H5M21 18V15M21 15V12M21 15C21 16.6569 19.6569 18 18 18C16.3431 18 15 16.6569 15 15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15Z"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																/>
															</g>
														</svg>
													</div>
												</div>
												<span>Lesemodus</span>
											</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				{#if !widgetWhiteLabel}
					<a class="accessi_footer" href="https://betterweb.co/" target="_blank">
						<span>Accessibility Widget by <span class="accessi_underline">BetterWeb</span></span>
					</a>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style>
	:root {
		--brand-blue: #5a26e3;
		--white: white;
		--border-radius: 14px;
		--base-color-brand--white: var(--white);

		--accessi-widget-size: 3.5rem;

		--font-body: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		--font-mono: 'Fira Mono', monospace;
		--color-text: rgba(0, 0, 0, 0.7);
		--column-width: 42rem;
		--column-margin-top: 4rem;
		font-family: var(--font-body);
		color: var(--color-text);
	}

	.accessi_fixed {
		font-family: Arial, Helvetica, sans-serif;
		line-height: 1.5;
		letter-spacing: normal;
		width: 100%;
		height: 100%;
		z-index: 214748364;
		/*
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  */
	}

	.accessi_widget-open {
		position: fixed;
		left: auto;
		top: auto;
		right: 1rem;
		bottom: 1rem;
		z-index: 9007199254740991;
		display: flex;
		width: var(--accessi-widget-size);
		height: var(--accessi-widget-size);
		justify-content: center;
		align-items: center;
		border-radius: 1000px;
		background-color: var(--brand-blue);
		transition-property: all;
		transition-duration: 235ms;
		transition-timing-function: ease;
		color: var(--white);
	}

	.accessi_widget-open:tiny {
		z-index: 241000009;
	}

	.accessi_widget-open:hover {
		opacity: 0.75;
	}
	.accessi_open-icon {
		position: relative;
		width: 3rem;
		height: 3rem;
	}

	.accessi_close-icon {
		position: absolute;
		width: 3rem;
		height: 3rem;
	}

	/* Entfernt standardmäßige User Agent Styles für Buttons */
	button {
		all: unset; /* Entfernt alle Standard-Stile */
		/* Optional: Füge deine eigenen Stile hier hinzu */
		display: inline-block; /* Stellt sicher, dass der Button wie ein Inline-Block-Element angezeigt wird */
		cursor: pointer; /* Zeigt den Zeiger-Cursor an, um die Interaktivität anzuzeigen */
		/* Weitere Stile hinzufügen, z.B. Padding, Border, Hintergrund, Schriftarten, etc. */
	}

	.acessi_widget {
		position: fixed;
		z-index: 2147483647;
		left: auto;
		top: auto;
		right: 1rem;
		bottom: 5.5rem;
		overflow: hidden;
		width: 100%;
		height: 85%;
		max-width: 33rem;
		border-style: solid;
		border-width: 1px;
		border-color: hsla(0, 0%, 0%, 0.08);
		border-radius: var(--border-radius);
		background-color: white;
		box-shadow: 0 2px 40px 8px rgba(0, 0, 0, 0.1);
		max-height: calc(100vh - 5rem);
		text-transform: none;
	}

	.acessi_widget:tiny {
		left: 0.3rem;
		top: 0.3rem;
		right: 0.3rem;
		bottom: 0.3rem;
		z-index: 9007199254740991;
		max-height: none;
		max-width: calc(100vw - 0.6rem);
		height: calc(100vh - 0.6rem);
	}

	.accessi_heading {
		font-size: 1.05rem;
		font-weight: 500;
		text-align: left !important;
		width: 100%;
		text-transform: none !important;
	}

	.accessi_widget-gradient {
		position: absolute;
		left: 0%;
		top: 0%;
		right: 0%;
		bottom: auto;
		height: 40%;
		background-image: linear-gradient(180deg, var(--brand-blue) 62%, hsla(0, 0%, 100%, 0));
		pointer-events: none;
	}

	.accessi_widget-menu-wrapper {
		position: relative;
		overflow: auto;
		height: 100%;
	}

	.accessi_top-bar {
		position: sticky;
		top: 0px;
		z-index: 100;
		display: flex;
		width: 100%;
		padding: 1rem;
		justify-content: space-between;
		align-items: center;
		background-image: linear-gradient(180deg, var(--brand-blue) 22%, transparent);
	}
	.accessi_language-wrapper {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
	}

	.accessi_language-link {
		display: flex;
		padding-top: 0.3rem;
		padding-right: 0.75rem;
		padding-bottom: 0.3rem;
		padding-left: 0.3rem;
		justify-content: flex-start;
		align-items: center;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		background-color: hsla(0, 0%, 100%, 0.22);
		color: var(--white);
		font-size: 0.8rem;
		text-decoration: none;
	}

	.accessi_action-button {
		display: flex;
		padding-top: 0.3rem;
		padding-right: 0.8rem;
		padding-bottom: 0.3rem;
		padding-left: 0.7rem;
		justify-content: flex-start;
		align-items: center;
		grid-column-gap: 0.35rem;
		grid-row-gap: 0.35rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		background-color: white;
		transition-property: all;
		transition-duration: 250ms;
		transition-timing-function: ease;
		color: var(--brand-blue);
		font-size: 0.8rem;
		text-decoration: none;
	}

	.accessi_action-button:hover {
		opacity: 0.88;
		transform: scale(1.04);
	}

	.accessi_action-button.secondary {
		padding-right: 0.3rem;
		padding-left: 0.3rem;
		background-color: rgba(255, 255, 255, 0.22);
		color: var(--white);
		font-size: 0.7rem;
	}

	.accessi_close {
		width: 1.6rem;
		height: 1.6rem;
		color: var(--white);
	}

	.accessi_widget-scroll {
		width: 100%;
	}

	.spacer-small {
		width: 100%;
		padding-top: 1rem;
	}

	.spacer-small:small {
		padding-top: 1.25rem;
	}

	.accessi_hero-header {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		grid-column-gap: 1rem;
		grid-row-gap: 1rem;
	}

	.max-width-medium {
		display: flex;
		width: 100%;
		max-width: 25rem;
		justify-content: center;
		align-items: center;
	}

	.accessi_hero-title {
		color: var(--base-color-brand--white);
		font-size: 1.8rem;
		font-weight: 600;
		text-align: center;
		width: 100%;
		line-height: 1.6;
	}

	.embed-svg.btn {
		width: 1.75rem;
		height: 1.75rem;
	}

	.embed-svg.btn.underline {
		border-bottom-style: solid;
		border-bottom-width: 1.5px;
		border-bottom-color: black;
	}

	.accessi_action-button-wraper {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		grid-auto-columns: 1fr;
		grid-column-gap: 0.6rem;
		grid-row-gap: 0.6rem;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto;
	}

	.accessi_action-button-wraper:tiny {
		flex-direction: column;
		flex-wrap: nowrap;
	}

	.accessi_action-button {
		display: flex;
		padding-top: 0.3rem;
		padding-right: 0.8rem;
		padding-bottom: 0.3rem;
		padding-left: 0.7rem;
		justify-content: flex-start;
		align-items: center;
		grid-column-gap: 0.35rem;
		grid-row-gap: 0.35rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		background-color: white;
		transition-property: all;
		transition-duration: 250ms;
		transition-timing-function: ease;
		color: var(--brand-blue);
		font-size: 0.8rem;
		text-decoration: none;
	}

	.accessi_action-button:hover {
		opacity: 0.88;
		transform: scale(1.04);
	}

	.spacer-large {
		width: 100%;
		padding-top: 2rem;
	}

	.spacer-large:medium {
		padding-top: 2.5rem;
	}

	.spacer-large:small {
		padding-top: 2rem;
	}

	.accessi_widget-content-wrapper {
		display: flex;
		padding-right: 1rem;
		padding-left: 1rem;
		flex-direction: column;
		flex-wrap: nowrap;
		grid-column-gap: 0.75rem;
		grid-row-gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.accessi_widget-content-wrapper:tiny {
		padding-right: 0.4rem;
		padding-left: 0.4rem;
	}

	.accessi_form-wrapper {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		grid-column-gap: 1.25rem;
		grid-row-gap: 1.25rem;
	}

	.accessi_form-wrapper:tiny {
		grid-column-gap: 1rem;
		grid-row-gap: 1rem;
	}

	.accessi_widget-content-item {
		padding-top: 1rem;
		color: #1a1a1a;
		padding-right: 1.2rem;
		padding-bottom: 1rem;
		padding-left: 1.2rem;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: hsla(256.42105263157896, 0%, 100%, 1);
		box-shadow: 0 0 30px 3px rgba(0, 0, 0, 0.13);
		text-align: left !important;
	}

	.accessi_widget-content-item:tiny {
		padding-right: 0.75rem;
		padding-left: 0.75rem;
	}

	.spacer-small {
		width: 100%;
		padding-top: 1rem;
	}

	.spacer-small:small {
		padding-top: 1.25rem;
	}

	.accessi_widget-vertical-wrapper {
		display: grid;
		flex-direction: column;
		flex-wrap: nowrap;
		grid-auto-columns: 1fr;
		grid-column-gap: 0.75rem;
		grid-row-gap: 0.75rem;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
	}

	.accessi_widget-vertical-wrapper:tiny {
		grid-auto-flow: row;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
		grid-template-columns: 1fr;
	}

	.embed-svg {
		width: 1.2rem;
		height: 1.2rem;
	}

	.embed-svg.profiles {
		width: 2.1rem;
		height: 2.1rem;
		padding-top: 0.37rem;
		padding-right: 0.37rem;
		padding-bottom: 0.37rem;
		padding-left: 0.37rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		background-color: hsla(0, 0%, 90.67%, 1);
	}

	.embed-svg.profiles.pressed {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: hsla(0, 0%, 90.67%, 0.35);
	}

	.embed-svg.check {
		position: absolute;
		left: auto;
		top: 0%;
		right: 0.7rem;
		bottom: 0%;
		display: flex;
		width: 1.5rem;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

	.accessi_widget-vertical-item {
		position: relative;
		display: flex;
		min-height: 3rem;
		margin-bottom: 0px;
		padding-top: 0.3rem;
		padding-right: 0.35rem;
		padding-bottom: 0.3rem;
		padding-left: 0.85rem;
		justify-content: flex-start;
		align-items: center;
		color: #1a1a1a;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
		border-top-style: solid;
		border-top-width: 1.75px;
		border-top-color: hsla(0, 0%, 100%, 1);
		border-right-style: solid;
		border-right-width: 1.75px;
		border-right-color: hsla(0, 0%, 100%, 1);
		border-bottom-style: solid;
		border-bottom-width: 1.75px;
		border-bottom-color: hsla(0, 0%, 100%, 1);
		border-left-style: solid;
		border-left-width: 1.75px;
		border-left-color: hsla(0, 0%, 100%, 1);
		border-top-left-radius: 9px;
		border-top-right-radius: 9px;
		border-bottom-left-radius: 9px;
		border-bottom-right-radius: 9px;
		background-color: hsla(0, 0%, 100%, 1);
		box-shadow: 0 0 20px 1px hsla(0, 0%, 0%, 0.13);
		transition-property: all;
		transition-duration: 300ms;
		transition-timing-function: ease;
		font-size: 0.92rem;
	}

	.accessi_widget-vertical-item:hover {
		border-top-color: var(--brand-blue);
		border-right-color: var(--brand-blue);
		border-bottom-color: var(--brand-blue);
		border-left-color: var(--brand-blue);
	}

	.accessi_widget-vertical-item:tiny {
		min-height: 3.5rem;
	}

	.accessi_widget-vertical-item.pressed {
		border-top-color: var(--brand-blue);
		border-right-color: var(--brand-blue);
		border-bottom-color: var(--brand-blue);
		border-left-color: var(--brand-blue);
		background-color: var(--brand-blue);
		color: var(--base-color-brand--white);
	}

	.accessi_widget-vertical-wrapper {
		display: grid;
		flex-direction: column;
		flex-wrap: nowrap;
		grid-auto-columns: 1fr;
		grid-column-gap: 0.75rem;
		grid-row-gap: 0.75rem;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
	}

	.accessi_widget-vertical-wrapper:tiny {
		grid-auto-flow: row;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
		grid-template-columns: 1fr;
	}

	.accessi_widget-vertical-wrapper._3grid {
		grid-template-columns: 1fr 1fr 1fr;
		grid-auto-flow: dense;
	}

	.accessi_widget-vertical-wrapper._3grid:tiny {
		grid-template-columns: 1fr 1fr;
	}

	.accessi_button-wrapper {
		display: flex;
		padding-top: 0.35rem;
		padding-right: 0.35rem;
		padding-bottom: 0.35rem;
		padding-left: 0.35rem;
		flex-direction: column;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		aspect-ratio: 3/2.5;
		text-align: center;
	}

	.accessi_button-wrapper.accessi_widget-vertical-item {
		font-size: 0.92rem;
	}

	.accessi_widget-vertical-left.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.embed-svg.btn {
		width: 1.75rem;
		height: 1.75rem;
	}

	.accessi_button-wrapper {
		display: flex;
		padding-top: 0.35rem;
		padding-right: 0.35rem;
		padding-bottom: 0.35rem;
		padding-left: 0.35rem;
		flex-direction: column;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		aspect-ratio: 3/2.5;
		text-align: center;
	}

	.accessi_button-wrapper.accessi_widget-vertical-item {
		font-size: 0.92rem;
	}

	.accessi_button-wrapper.accessi_widget-vertical-item.full-width {
		aspect-ratio: 3/1.2;
	}

	.accessi_horizontal {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		grid-column-gap: 0.55rem;
		grid-row-gap: 0.55rem;
	}

	.accessi_widget-vertical-left.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.accessi_button-wrapper {
		display: flex;
		padding-top: 0.35rem;
		padding-right: 0.35rem;
		padding-bottom: 0.35rem;
		padding-left: 0.35rem;
		flex-direction: column;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		aspect-ratio: 3/2.5;
		text-align: center;
	}

	.accessi_button-wrapper.accessi_widget-vertical-item {
		font-size: 0.92rem;
	}

	.accessi_button-wrapper.accessi_widget-vertical-item.full-width {
		aspect-ratio: 3/1.2;
		grid-column: span 2;
	}

	.embed-svg.btn.underline.pressed {
		border-bottom-color: white;
	}

	.accessi_color-wrapper {
		display: flex;
		width: 85%;
		flex-direction: row;
		justify-content: center;
		flex-wrap: wrap;
		align-items: center;
		grid-column-gap: 0.3rem;
		grid-row-gap: 0.3rem;
	}

	.accessi_color-wrapper:tiny {
		background-color: transparent;
	}

	.accessi_color-dot {
		width: 1.8rem;
		height: 1.8rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		transition-property: all;
		transition-duration: 200ms;
		transition-timing-function: ease;
	}

	.accessi_color-dot:hover {
		transform: scale(1.1);
	}

	.accessi_color-dot.blue {
		background-color: #389cfb;
	}

	.accessi_color-dot.orange {
		background-color: #fa6b05;
	}

	.accessi_color-dot.yellow {
		background-color: #facf36;
	}

	.accessi_color-dot.turquoise {
		background-color: #5cd6c8;
	}

	.accessi_color-dot.white {
		border-top-style: solid;
		border-top-width: 1px;
		border-top-color: hsla(0, 0%, 63.33%, 1);
		border-right-style: solid;
		border-right-width: 1px;
		border-right-color: hsla(0, 0%, 63.33%, 1);
		border-bottom-style: solid;
		border-bottom-width: 1px;
		border-bottom-color: hsla(0, 0%, 63.33%, 1);
		border-left-style: solid;
		border-left-width: 1px;
		border-left-color: hsla(0, 0%, 63.33%, 1);
	}

	.accessi_color-dot.black {
		background-color: #521442;
	}

	.accessi_langugae-icon {
		width: 1.5rem;
		height: 1.5rem;
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		object-fit: cover;
	}

	.accessi_num-wrapper {
		position: relative;
		display: flex;
		width: 90%;
		height: 2.5rem;
		flex-direction: row;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		grid-column-gap: 0.45rem;
		grid-row-gap: 0.45rem;
		font-weight: 500;
	}

	.accessi_num-wrapper:tiny {
		background-color: transparent;
	}
	.accessi_num-button {
		display: flex;
		padding-top: 0.4rem;
		padding-right: 1rem;
		padding-bottom: 0.4rem;
		padding-left: 1rem;
		justify-content: center;
		align-items: center;
		grid-column-gap: 0.5rem;
		grid-row-gap: 0.5rem;
		border-top-style: solid;
		border-top-width: 1.5px;
		border-top-color: hsla(0, 0%, 100%, 1);
		border-right-style: solid;
		border-right-width: 1.5px;
		border-right-color: hsla(0, 0%, 100%, 1);
		border-bottom-style: solid;
		border-bottom-width: 1.5px;
		border-bottom-color: hsla(0, 0%, 100%, 1);
		border-left-style: solid;
		border-left-width: 1.5px;
		border-left-color: hsla(0, 0%, 100%, 1);
		border-top-left-radius: 100px;
		border-top-right-radius: 100px;
		border-bottom-left-radius: 100px;
		border-bottom-right-radius: 100px;
		box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
		transition-property: all;
		transition-duration: 290ms;
		transition-timing-function: ease;
		color: var(--base-color-brand--black);
		text-decoration: none;
	}

	.accessi_num-button:hover {
		border-top-color: var(--brand-blue);
		border-right-color: var(--brand-blue);
		border-bottom-color: var(--brand-blue);
		border-left-color: var(--brand-blue);
	}

	.accessi_num-button.pressed {
		border-top-color: var(--brand-blue);
		border-right-color: var(--brand-blue);
		border-bottom-color: var(--brand-blue);
		border-left-color: var(--brand-blue);
		background-color: var(--brand-blue);
		color: var(--base-color-brand--white);
	}

	.accessi_footer {
		position: absolute;
		left: 0%;
		top: auto;
		right: 0%;
		bottom: 0%;
		display: flex;
		padding-top: 0.2rem;
		padding-right: 0.15rem;
		padding-bottom: 0.15rem;
		padding-left: 0.15rem;
		justify-content: center;
		align-items: center;
		background-color: var(--brand-blue);
		color: white;
		font-size: 0.85rem;
		text-decoration: none;
	}

	.accessi_underline {
		text-decoration: underline;
	}
</style>
