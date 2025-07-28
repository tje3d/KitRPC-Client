// Interfaces
interface OnlyNumberProps {
	enable?: boolean;
	max?: number;
	maxDecimals?: number;
	allowLeadingZero?: boolean;
	leadingZeroLimit?: number;
	convertLeadingZeros?: boolean;
}

// Constants
const DEFAULT_CONFIG: Readonly<Required<OnlyNumberProps>> = {
	enable: true,
	allowLeadingZero: true,
	leadingZeroLimit: 1,
	convertLeadingZeros: false,
	max: Number.MAX_SAFE_INTEGER,
	maxDecimals: Number.MAX_SAFE_INTEGER
};

// prettier-ignore
const PERSIAN_DIGITS: Readonly<Record<string, string>> = {
  '۰': '0', '٠': '0', '۱': '1', '١': '1', '۲': '2', '٢': '2',
  '۳': '3', '٣': '3', '۴': '4', '٤': '4', '۵': '5', '٥': '5',
  '۶': '6', '٦': '6', '۷': '7', '٧': '7', '۸': '8', '٨': '8',
  '۹': '9', '٩': '9'
} as const;

function replacePersianDigits(str: string): string {
	if (!str) return '';
	return str.replace(/[۰-۹٠-٩]/g, (char) => PERSIAN_DIGITS[char] || char);
}

export default function OnlyNumber(
	node: HTMLInputElement | HTMLTextAreaElement,
	props: OnlyNumberProps = {}
) {
	let config: Required<OnlyNumberProps> = { ...DEFAULT_CONFIG, ...props };

	// Helper functions
	const handleDecimalLimits = (value: string): string => {
		if (config.maxDecimals === 0) {
			return value.split('.')[0];
		}
		const [intPart, decPart] = value.split('.');
		if (!decPart || config.maxDecimals === Number.MAX_SAFE_INTEGER) {
			return value;
		}
		if (decPart.length > config.maxDecimals) {
			return `${intPart}.${decPart.slice(0, config.maxDecimals)}`;
		}
		return value;
	};

	const handleLeadingZeros = (integerPart: string): string => {
		if (config.allowLeadingZero) {
			if (config.convertLeadingZeros) {
				const num = parseInt(integerPart, 10);
				return isNaN(num) ? '' : String(num);
			}

			const maxLeadingZeros = config.leadingZeroLimit;
			if (integerPart.length > 1) {
				const leadingZeros = integerPart.match(/^0+/)?.[0].length || 0;
				if (leadingZeros > maxLeadingZeros) {
					return '0'.repeat(maxLeadingZeros) + integerPart.slice(leadingZeros);
				}
			}
			return integerPart;
		}

		// Remove leading zeros when not allowed
		const result = integerPart.replace(/^0+/, '');
		return result === '' ? '0' : result;
	};

	const processNumber = (value: string, endsWithDecimal: boolean): string => {
		let [integerPart, decimalPart] = value.split('.');

		// Process integer part
		integerPart = replacePersianDigits(integerPart).replace(/[^0-9]/g, '');
		if (!integerPart && !decimalPart) return '';

		integerPart = handleLeadingZeros(integerPart);

		// Process decimal part
		if (decimalPart) {
			decimalPart = replacePersianDigits(decimalPart).replace(/[^0-9]/g, '');
			if (config.maxDecimals !== Number.MAX_SAFE_INTEGER) {
				decimalPart = decimalPart.slice(0, config.maxDecimals);
			}
		}

		// Construct new value
		let newValue = integerPart;
		if (decimalPart) {
			newValue += '.' + decimalPart;
		} else if (endsWithDecimal && parseFloat(integerPart) !== config.max) {
			newValue += '.';
		}

		// Check max value
		const numValue = parseFloat(newValue);
		if (!isNaN(numValue) && numValue > config.max) {
			newValue = config.max.toString();
		}

		return newValue;
	};

	function onInput(event: Event) {
		if (!config.enable) return;
		const originalValue = node.value;
		if (!originalValue) return;

		let processedValue = handleDecimalLimits(originalValue);
		const endsWithDecimal = processedValue.endsWith('.');
		const newValue = processNumber(processedValue, endsWithDecimal);

		node.value = newValue;
	}

	// Initialize
	node.addEventListener('input', onInput);
	node.setAttribute('inputmode', 'decimal');
	onInput(new Event('input'));

	return {
		update(newProps: OnlyNumberProps) {
			config = { ...DEFAULT_CONFIG, ...newProps };
			onInput(new Event('input'));
		},
		destroy() {
			node.removeEventListener('input', onInput);
			node.removeAttribute('inputmode');
		}
	};
}
