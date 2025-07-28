<script lang="ts">
	import { base } from '$app/paths';
	import { createEventDispatcher } from 'svelte';

	export let mediaKey: string | undefined = undefined;
	export let accept: string = 'image/*';
	export let maxSize: number = 10 * 1024 * 1024; // 10MB
	export let disabled: boolean = false;
	export let label: string = 'انتخاب فایل';
	export let placeholder: string = 'فایلی انتخاب نشده است';
	export let maxWidth: number = 1024;
	export let maxHeight: number = 768;

	const dispatch = createEventDispatcher<{
		upload: { mediaKey: string; filename: string; path: string };
		error: { message: string };
		clear: void;
		uploadingChange: { uploading: boolean };
	}>();

	let fileInput: HTMLInputElement;
	let uploading = false;

	// Dispatch uploading state changes
	$: dispatch('uploadingChange', { uploading });
	let currentFile: File | null = null;
	let previewUrl: string | null = null;

	// Load existing media if mediaKey is provided
	$: if (mediaKey && !previewUrl) {
		loadExistingMedia();
	}

	async function loadExistingMedia() {
		if (!mediaKey) return;

		try {
			previewUrl = base + `/file/media/${mediaKey}`;
		} catch (error) {
			console.error('Error loading existing media:', error);
		}
	}

	async function resizeImageToPng(file: File): Promise<File> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				reject(new Error('Canvas context not available'));
				return;
			}

			img.onload = () => {
				// Calculate new dimensions while maintaining aspect ratio
				let { width, height } = img;

				if (width > maxWidth || height > maxHeight) {
					const aspectRatio = width / height;

					if (width > height) {
						width = Math.min(width, maxWidth);
						height = width / aspectRatio;
					} else {
						height = Math.min(height, maxHeight);
						width = height * aspectRatio;
					}

					// Ensure we don't exceed the other dimension
					if (width > maxWidth) {
						width = maxWidth;
						height = width / aspectRatio;
					}
					if (height > maxHeight) {
						height = maxHeight;
						width = height * aspectRatio;
					}
				}

				// Set canvas dimensions
				canvas.width = width;
				canvas.height = height;

				// Draw and resize image
				ctx.drawImage(img, 0, 0, width, height);

				// Convert to PNG blob
				canvas.toBlob(
					(blob) => {
						if (blob) {
							// Create new file with PNG extension
							const originalName = file.name.replace(/\.[^/.]+$/, '');
							const pngFile = new File([blob], `${originalName}.png`, {
								type: 'image/png',
								lastModified: Date.now()
							});
							resolve(pngFile);
						} else {
							reject(new Error('Failed to convert image to PNG'));
						}
					},
					'image/png',
					0.9
				);
			};

			img.onerror = () => {
				reject(new Error('Failed to load image'));
			};

			// Load the image
			const reader = new FileReader();
			reader.onload = (e) => {
				img.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		});
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Validate file size
		if (file.size > maxSize) {
			dispatch('error', {
				message: `حجم فایل نباید بیشتر از ${Math.round(maxSize / 1024 / 1024)} مگابایت باشد`
			});
			return;
		}

		let processedFile = file;

		// Process images: resize and convert to PNG
		if (file.type.startsWith('image/')) {
			try {
				uploading = true; // Show loading during processing
				processedFile = await resizeImageToPng(file);
				uploading = false;
			} catch (error) {
				uploading = false;
				dispatch('error', {
					message: 'خطا در پردازش تصویر'
				});
				return;
			}
		}

		currentFile = processedFile;

		// Create preview for images
		if (processedFile.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(processedFile);
		}

		await uploadFile(processedFile);
	}

	async function uploadFile(file: File) {
		uploading = true;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch(base + '/file/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'خطا در آپلود فایل');
			}

			if (result.success && result.media) {
				mediaKey = result.media.key;
				dispatch('upload', {
					mediaKey: result.media.key,
					filename: result.media.filename,
					path: result.media.path
				});
			}
		} catch (error) {
			console.error('Upload error:', error);
			dispatch('error', {
				message: error instanceof Error ? error.message : 'خطا در آپلود فایل'
			});
			clearFile();
		} finally {
			uploading = false;
		}
	}

	function clearFile() {
		currentFile = null;
		previewUrl = null;
		mediaKey = undefined;
		if (fileInput) {
			fileInput.value = '';
		}
		dispatch('clear');
	}

	function triggerFileSelect() {
		if (!disabled && !uploading) {
			fileInput?.click();
		}
	}
</script>

<div class="w-full">
	<label class="mb-2 block text-sm font-medium text-gray-700">
		{label}
	</label>

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleFileSelect}
		class="hidden"
		{disabled}
	/>

	<div class="rounded-lg border-2 border-dashed border-gray-300 p-4">
		{#if previewUrl}
			<div class="relative">
				<img
					src={previewUrl}
					alt="Preview"
					class="mx-auto max-h-48 max-w-full rounded-lg object-cover"
				/>
				{#if !disabled}
					<button
						type="button"
						on:click={clearFile}
						class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
					>
						×
					</button>
				{/if}
			</div>
		{:else}
			<div class="text-center">
				{#if uploading}
					<div class="flex items-center justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
						<span class="ml-2 text-gray-600">در حال آپلود...</span>
					</div>
				{:else}
					<button
						type="button"
						on:click={triggerFileSelect}
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						{disabled}
					>
						<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
						{currentFile ? currentFile.name : placeholder}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	{#if currentFile && !uploading}
		<div class="mt-2 text-sm text-gray-500">
			{currentFile.name} ({Math.round(currentFile.size / 1024)} KB)
		</div>
	{/if}
</div>
