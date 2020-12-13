//TODO: use cookies to sync BadTextManager.list across pages (username should be identical on every page)

class BadTextManager {

	/**
	 * 
	 * @param {number} rateMin Together with `rateMax`, determines how many characters are corrupted in `corruptString()`.
	 * @param {number} rateMax Together with `rateMin`, determines how many characters are corrupted in `corruptString()`.
	 */
	constructor(rateMin, rateMax) {
		this.list = this.getBadElements();
		this.rateMin = rateMin;
		this.rateMax = rateMax;
	}

	/**
	 * Returns a dictionary of `<bad>` elements on the page, grouped by `className`. Elements with no `className` receive generated names.
	 */
	getBadElements() {
		let list = {};
		let hash = 0;
		document.querySelectorAll('bad').forEach(element => {
			if (element.className == '') {
				element.className = `bad${hash++}`;
			}
			if (!list.hasOwnProperty(element.className)) {
				list[element.className] = [];
			}
			list[element.className].push(element);
		});
		return list;
	}

	/**
	 * Returns a string to replace `s`. Characters are swapped from matching sets. For example, a capital letter will become any random capital letter.
	 * @param {string} s The string to replace.
	 */
	replaceString(s) {
		let alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
		let numeral = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		let other = ['-', '_', '@'];
		return s
			.replace(/[A-Z]/g, randomItem(alpha).toUpperCase())
			.replace(/[a-z]/g, randomItem(alpha))
			.replace(/[0-9]/g, randomItem(numeral))
			.replace(/-|_|@/g, randomItem(other));
	}

	/**
	 * "Corrupts" a string by replacing random characters with others from matching sets. For example, a capital letter will become any random capital letter.
	 * @param {string} s The string to corrupt.
	 * @param {number} rateMin Together with `rateMax`, determines the percentage of characters to change. The rate is multiplied by the string length to determine the number of changes.
	 * @param {number} rateMax Together with `rateMin`, determines the percentage of characters to change. The rate is multiplied by the string length to determine the number of changes.
	 */
	corruptString(s, rateMin, rateMax) {
		let rate = (Math.random() * (rateMax - rateMin)) + rateMin;
		let iterations = Math.ceil(rate * s.length);
		for(let i = 0; i < iterations; i++) {
			let index = randomIndex(s);
			let char = this.replaceString(s[index]);
			s = s.substr(0, index) + char + s.substr(index + 1);	
		}
		return s;
	}

	/**
	 * Corrupts every `<bad>` element on the page.
	 */
	corruptPage() {
		for (let key in this.list) {
			let s = this.corruptString(this.list[key][0].innerText, this.rateMin, this.rateMax);
			this.list[key].forEach(element => {
				element.innerText = s;
			});
		};
		setTimeout(this.corruptPage.bind(this), Math.floor(Math.random() * 400));
	}

	/**
	 * Overwrites every character to obfuscate text, then starts corrupting on a loop.
	 */
	start() {
		for (let key in this.list) {
			let s = this.replaceString(this.list[key][0].innerText);
			this.list[key].forEach(element => {
				element.innerText = s;
			});
		};
		this.corruptPage();
	}
}

//TODO: move these utility functions out of here
function randomIndex(array) {
	return Math.floor(Math.random() * array.length);
}
function randomItem(array) {
	return array[randomIndex(array)];
}

//TODO: move onload to a main script or something like that
window.onload = () => {

	badTextManager = new BadTextManager(.1, .3);
	badTextManager.start();

	document.querySelector('#cover').remove();
}
