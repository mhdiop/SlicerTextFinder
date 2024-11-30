import { APP_CONFIG } from "./Config.js";
import { HomePage } from "./HomePage.js";
import { WeblateComponentManager } from "./WeblateComponentManager.js";

window.onload = () => {
	window.APP_CONFIG = APP_CONFIG;
	new AppManager(APP_CONFIG.language);
}

class AppManager {

	constructor(language) {
		this.language = language;
		this.appView = new AppManagerView(this);
		this.componentsManager = new WeblateComponentManager(language);
		this.appView.hideLoader(true, () => this.onAppLoaded());
		window.app = this;
	}

	onAppLoaded() {
		const componentsData = this.componentsManager.getComponentsData();
		const moduleNames = APP_CONFIG.chartModules;
		const modulesData = this.componentsManager.getModulesData(moduleNames);
		if (!this.homePage) {
			this.homePage = new HomePage(componentsData, modulesData)
		} else {
			this.homePage.setChartsData(componentsData, modulesData);
		}
		this.homePage.render();
	}

	onLanguageChanged(language) {
		if (this.language != language) {
			console.log(language);
			this.language = language;
			this.componentsManager.addLanguage(language);
			this.appView.hideLoader(true, () => this.onAppLoaded());
		}
	}

	isReady() {
		return this.componentsManager.isReady();
	}
}

class AppManagerView {

	constructor(appManager) {
		this.appManager = appManager;
		this.loaderBox = document.getElementById('loaderBox');
	}

	hideLoader(isFirstCall, callback) {
		if (this.appManager.isReady()) {
			this.loaderBox.hidden = true;
			
			if (callback) {
				callback();
			}
		}
		else {
			if (this.loaderBox.hidden) {
				this.loaderBox.hidden = false;
			}
			setTimeout(() => this.hideLoader(isFirstCall, callback), 500);
		}
	}

	showLoader() {
		this.loaderBox.hidden = false;
	}
}
