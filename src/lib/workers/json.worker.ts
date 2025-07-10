self.onmessage = (e: MessageEvent) => {
	const { id, type = 'decode', data } = e.data;

	if (type === 'decode') {
		try {
			const parsed = JSON.parse(data);
			self.postMessage({ id, data: parsed });
		} catch (error) {
			self.postMessage({ id, data: null });
		}
	} else if (type === 'encode') {
		try {
			self.postMessage({ id, data: JSON.stringify(data) });
		} catch (error) {
			self.postMessage({ id, data: null });
		}
	}
};

export {};
