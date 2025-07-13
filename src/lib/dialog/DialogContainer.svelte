<script lang="ts">
	import Dialog from '$lib/dialog/Dialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
</script>

{#each $dialogStore.dialogs as modal, index (modal.id)}
	<Dialog
		id={modal.id}
		onClose={modal.onClose}
		preventBackdropClose={typeof modal.preventBackdropClose !== 'boolean'
			? false
			: modal.preventBackdropClose}
		showClose={typeof modal.showClose !== 'boolean' ? true : modal.showClose}
		noPadding={typeof modal.noPadding !== 'boolean' ? false : modal.noPadding}
		center={typeof modal.center !== 'boolean' ? true : modal.center}
		isLatest={index === $dialogStore.dialogs.length - 1}
		fullScreen={typeof modal.fullScreen !== 'boolean' ? false : modal.fullScreen}
		transitionType={modal.transitionType || 'scale'}
		preventDirtyClose={typeof modal.preventDirtyClose !== 'boolean'
			? true
			: modal.preventDirtyClose}
	>
		<svelte:component
			this={modal.component}
			id={modal.id}
			closeMe={() => dialogStore.close(modal.id)}
			{...modal.props}
		/>
	</Dialog>
{/each}
