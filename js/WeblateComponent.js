export class WeblateComponent {

	constructor(slug, name, language) {
		// the component's name (CTK, 3D Slicer, SlicerIGT, ...)
		this.name = name;
		// the component's slug name used in URL (ctk, 3d-slicer, slicerigt, ...)
		this.slug = slug;

		// the user's current chosen language
		this.language = language;

		// list of detected contexts in the current component
		this.contexts = [];

		// stores a list of Message objects for any chosen language
		this.messagesByLanguage = {};

		// stores a list of Message objects grouped by module names
		this.messagesByModule = {};

		// stores english strings (are the same for all languages)
		this.sourceStrings = [];

		// stores translated strings grouped by already chosen languages
		this.translatedStringsByLanguage = {};

		// stores translation statistics of this component for any chosen language
		// stores the string count (total and translated), translation rate
		this.translationStatsByLanguage = {};

		// URL where ts files of the current component get downloaded
		this.tsFileDownloadUrl = `${APP_CONFIG.tsFileDownloadUrl}?comp=${slug}&lang=${language}`;

		// Weblate search URL for the current component
		this.searchUrl = `https://hosted.weblate.org/translate/3d-slicer/${slug}/${language}/?q=`;

		// Weblate statistics URL for the current component
		this.statisticsUrl = `${APP_CONFIG.slicerStatisticsUrl}?component=${slug}`;

		// whether or not the current TS file is completely downloaded
		// Used by the GUI loader to know when to show/hide the loader
		this.tsFileIsDownloaded = false;

		// whether or not the component is downloading
		// Used by the GUI loader to know when to show/hide the loader
		this.isDownloading = false;

		// whether or not original strings list is already initialized
		this.sourceStringsAreAlreadyScanned = false;

		// store the supported languages list of the component
		this.languages = {};

		// whether or not the supported languages list is fully downloaded
		// Used by the GUI loader to know when to show/hide the loader
		this.languagesAreDownloaded = false;

		// starts language list download
		this.downloadLanguageList();
	}

	setLanguage(language) {
		if (this.language != language) {
			this.tsFileDownloadUrl = this.tsFileDownloadUrl.replace(`lang=${this.language}`, `lang=${language}`);
			this.searchUrl = this.searchUrl.replace(`/${this.language}/`, `/${language}/`);
			this.language = language; 
		}
	}

	getText(index) {
		return this.sourceStrings[index];
	}

	getContext(index) {
		return this.contexts[index];
	}

	getSourceText(index) {
		return this.sourceStrings[index];
	}

	getTranslatedText(index) {
		return this.translatedStringsByLanguage[this.language][index];
	}

	getModuleName(filename) {
		if (this.slug != '3d-slicer') {
			return this.name;
		}

		let modulePatterns = ['Modules/Loadable/', 'Modules/CLI/', 'Modules/Scripted/']
		let index, moduleName = 'OTHERS';

		for (const modulePattern of modulePatterns) {
			if (filename.indexOf(modulePattern) != -1) {
				moduleName = filename.replace(modulePattern, '');

				if ((index = moduleName.indexOf('/')) != -1) {
					moduleName = moduleName.substring(0, index);
				}

				return moduleName;
			}
		}

		return moduleName;
	}

	getModuleStats(moduleNames) {
		let statistics = {}, messages, translated_messages, translated_percent;

		for (const moduleName of moduleNames) {
			messages = this.messagesByModule[moduleName];
			translated_messages = messages.filter((m) => m.translated[this.language]);
			translated_percent = translated_messages.length * 100 / messages.length;
			statistics[moduleName] = Math.floor(translated_percent);
		}

		return statistics;
	}

	getMessageFromModuleList(searchedMessage) {
		const moduleNames = Array.from(new Set(searchedMessage.modules));
		for (const moduleName of moduleNames) {
			if (!this.messagesByModule[moduleName]) continue;

			for (const message of this.messagesByModule[moduleName]) {
				if (message.context == searchedMessage.context && message.text == searchedMessage.text
					&& message.index == searchedMessage.index && message.locations.toString() == searchedMessage.locations.toString()) {
					return message;
				}
			}
		}
		

		return null;
	}

	// returns the input with HTML entities replaced by their equivalent characters
	// static htmlDecode(html) {
	htmlDecode(html) {
		var doc = new DOMParser().parseFromString(html, "text/html");
		return doc.documentElement.textContent;
	}

	downloadTsFile(language = 'fr') {
		this.setLanguage(language);
		this.tsFileIsDownloaded = false;
		this.isDownloading = true;

		// if the language's TS file is already downloaded, we reuse the cached one
		if (this.messagesByLanguage.hasOwnProperty(this.language)) {
			this.tsFileIsDownloaded = true;
			this.isDownloading = false;
			return;
		}
		// if the language doesn't exist for this component
		// the following code is not already tested
		else if (this.languagesAreDownloaded && !this.languages[language]) {
			this.messagesByLanguage[this.language] = undefined;
			this.translatedStringsByLanguage[this.language] = undefined;
			this.tsFileIsDownloaded = true;
			this.isDownloading = false;
			return;
		}

		const xhr = new XMLHttpRequest();

		xhr.onload = () => {
			// ToDo: handle errors differently (specify a download error message ?)
			if (xhr.status != 200) {
				this.messagesByLanguage[this.language] = undefined;
				this.translatedStringsByLanguage[this.language] = undefined;
				this.tsFileIsDownloaded = true;
				this.isDownloading = false;
				return;
			}

			this.messagesByLanguage[this.language] = [];
			this.translatedStringsByLanguage[this.language] = [];

			let filenames, locations, contextName, contextIndex, isTranslated;
			let textIndex = 0, translation, messageText, newMessage;

			let messages = xhr.responseXML.getElementsByTagName('message');

			for (const message of messages) {
				translation = message.getElementsByTagName('translation')[0];

				// ignore vanished and obsolete strings
				if (['vanished', 'obsolete'].includes(translation.getAttribute('type'))) continue;
				
				locations = message.getElementsByTagName('location');
				filenames = []

				for (const location of locations) {
					filenames.push(
						`${location.getAttribute('filename')}:${location.getAttribute('line')}`
					);
				}

				if (!message.hasAttribute('numerus')) {
					// has a single translation
					this.translatedStringsByLanguage[this.language].push(translation.innerHTML);
				}
				else {
					// has many translations (singular & plural).
					const translations = []

					for (const item of translation.getElementsByTagName('numerusform')) {
						translations.push(item.innerHTML);
					}

					// many translations are joined into a single one, separated by |
					this.translatedStringsByLanguage[this.language].push(translations.join('|'));
				}

				isTranslated = (!translation.innerHTML || translation.hasAttribute('type')) ? false : true;
				contextName = message.parentElement.firstElementChild.innerHTML;
				messageText = message.getElementsByTagName('source')[0].innerHTML;

				if (!this.englishStringsAreAlreadyScanned) {
					this.sourceStrings.push(messageText);
				}

				contextIndex = this.contexts.indexOf(contextName);

				if (contextIndex == -1) {
					this.contexts.push(contextName);
					contextIndex = this.contexts.length - 1;
				}

				newMessage = new Message();
				newMessage.index = this.messagesByLanguage[this.language].length,
				newMessage.locations = filenames,
				newMessage.text = textIndex++,
				newMessage.modules = filenames.map(filename => this.getModuleName(filename)),
				newMessage.context = contextIndex,
				newMessage.translated = {}
				newMessage.translated[this.language] = isTranslated;
				newMessage.component = this;

				this.messagesByLanguage[this.language].push(newMessage);

				// a module may appear many times when a text appears many times in the same file
				const moduleNames = Array.from(new Set(newMessage.modules));
				for (const moduleName of moduleNames) {
					if (this.messagesByModule.hasOwnProperty(moduleName)) {
						let storedMessage = this.getMessageFromModuleList(newMessage);
						if (storedMessage) {
							storedMessage.translated[this.language] = isTranslated;
						}
						else {
							this.messagesByModule[moduleName].push(newMessage);
						}
					}
					else {
						this.messagesByModule[moduleName] = [newMessage];
					}
				}
			}

			this.tsFileIsDownloaded = true;
			this.isDownloading = false;
			if (!this.englishStringsAreAlreadyScanned) {
				this.englishStringsAreAlreadyScanned = true;
			}
		}

		xhr.open('GET', `${this.tsFileDownloadUrl}`);
		xhr.send();

	}

	downloadLanguageList() {
		const xhr = new XMLHttpRequest();
		xhr.onload = () => {
			const statistics = JSON.parse(xhr.responseText);

			for (const result of statistics.results) {
				this.languages[result.code] = {
					'name': result.name,
					// 'total': result.total,
					'translated': result.translated,
					'translated_percent': result.translated_percent
				};
			}
			this.languagesAreDownloaded = true;
		}

		xhr.open('GET', this.statisticsUrl);
		xhr.send();
	}

	isReady() {
		return this.languagesAreDownloaded && !this.isDownloading;
	}
}

class Message {

	constructor() {
		// index of the message in the associated StringFinder messages list
		this.index = undefined;

		// source files that contain the string
		this.locations = [];

		// index of the source string in the strings list
		this.text = undefined;

		// list of modules that contain the string
		this.modules = undefined;

		// index of the string context in the contexts list
		this.context = undefined;

		// whether or not the string is translated, for each language
		this.translated = undefined;

		// reference of the associated WeblateComponent instance
		this.component = undefined;
	}

	getSource() {
		return this.component.getSourceText(this.text)
	}

	getTranslation() {
		return this.component.getTranslatedText(this.text)
	}

	getContext() {
		return this.component.getContext(this.context);
	}

	getModules() {
		return Array.from(new Set(this.modules));
	}

	getModulesAsString() {
		return Array.from(new Set(this.modules)).toString();
	}

	// whether or not the string has many locations
	hasManyLocations() {
		return this.locations.length > 1;
	}

	// whether or not the string has many translations
	hasManyTranslations() {
		return this.locations.length > 1;
	}
	
	hasLocation(filename) {
		for (const location of this.locations) {
			if (location == filename) {
				return true;
			}
		}

		return false;
	}
}