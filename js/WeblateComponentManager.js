import { WeblateComponent } from "./WeblateComponent.js";

export class WeblateComponentManager {

	constructor (language='fr') {
		// the default language
		this.language = language;

		// stores components name and slug
		this.components = {};

		// stores WeblateComponent objects for each component name
		this.weblateComponents = [];
		this.statisticsUrl = APP_CONFIG.componentsStatisticsUrl;

		this.downloadComponentList();
	}

	downloadComponentList() {
		const xhr = new XMLHttpRequest();

		xhr.onload = () => {
			const components = JSON.parse(xhr.responseText);

			for (const component of components.results) {
				this.components[component.slug] = component.name
			}

			// we do not take into account glossary component
			delete this.components.glossary;
			this.createWeblateComponents();
		};

		xhr.open('GET', this.statisticsUrl);
		xhr.send();
	}

	createWeblateComponents() {
		let component = null;

		for (const slug of Object.keys(this.components)) {
			component = new WeblateComponent(slug, this.components[slug], this.language);
			component.downloadTsFile(this.language);
			this.weblateComponents.push(component);
		}
	}

	getWeblateComponent(name) {
		return this.weblateComponents.filter(component => [component.name, component.slug].includes(name))[0];
	}
	
	getComponentsData() {
		const componentsData = {};

		for (const component of this.weblateComponents) {
			if (component.languages[this.language]) {
				componentsData[component.name] = Math.floor(component.languages[this.language].translated_percent);
			}
		}

		return componentsData;
	}

	getModulesData(moduleNames) {
		// let modulesData = {
		// 	'Welcome': 64,
		// 	'Volumes': 75,
		// 	'Segmentations': 11,
		// 	'SegmentEditor': 54,
		// 	'Data': 80,
		// }

		for (const weblateComponent of this.weblateComponents) {
			if (weblateComponent.slug == '3d-slicer') {
				return weblateComponent.getModuleStats(moduleNames);
			}
		}

		return {};
	}

	addLanguage(language) {
		if (language != this.language) {
			this.language = language;

			for (const component of this.weblateComponents) {
				component.downloadTsFile(language);
			}
		}
	}

	getLanguages() {
		return this.getWeblateComponent('3d-slicer').languages;
	}

	getModuleNames() {
		return Object.keys(this.getWeblateComponent('3d-slicer').messagesByModule);
	}

	getAllModulesStats() {
		const slicerComponent = this.getWeblateComponent('3d-slicer');
		let moduleNames = Object.keys(slicerComponent.messagesByModule)
		const statistics = {};

		for (const moduleName of moduleNames) {
			statistics[moduleName] = slicerComponent.messagesByModule[moduleName].length
		}

		return statistics;
	}

	getMessageDetails(stringId) {
        let [component, index] = stringId.split('|');
        let weblateComponent = this.getWeblateComponent(component);
        let message = weblateComponent.messagesByLanguage[this.language][index];
        return {
            'modules': message.modules,
            'key': message.getContext(),
            'locations': message.getLocations(),
            'source': message.getSource(),
            'translation': message.getTranslation()
        };
    }
	
	isReady() {
		if (!this.weblateComponents[0] || !this.weblateComponents[0].tsFileIsDownloaded) {
			return false;
		}

		for (const component of this.weblateComponents) {
			if (!component.isReady()) {
				return false;
			}
		}

		return true;
	}
}

// window.manager = new WeblateComponentManager()
// manager.downloadComponentList()