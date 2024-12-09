import { TextFinder } from "./TextFinder.js";

export class SearchPage {

	constructor(componentManager) {
		this.componentManager = componentManager;
		this.pageView = new SearchPageView(this);
		this.pageModel = new SearchPageModel(this);
		// window.search = this;
	}

	showSearchResults(messages) {
		this.pageView.showSearchResults(messages)
	}

	getFormData() {
		return this.pageView.getFormData();
	}

	getComponents() {
		return this.componentManager.components;
	}

	getModulesStats() {
		return this.componentManager.getAllModulesStats();
	}

	getMessageDetails(stringId) {
		return this.componentManager.getMessageDetails(stringId);
	}
}

class SearchPageView {

	constructor(searchPage) {
		this.searchPage = searchPage;
		this.moduleField = document.getElementById('moduleField');
		this.searchField = document.getElementById('searchField');
		this.stringTable = document.getElementById('stringTable');
		this.searchButton = document.getElementById('searchButton');
		this.foundStringBox = document.getElementById('foundStringBox');
		this.searchForm = document.querySelector('#searchPage form');
		this.hideTranslatedCheckbox = document.getElementById('hideTranslatedCheckbox');
		this.componentsList = document.getElementById('componentsList');
		this.componentsItems = this.componentsList.getElementsByClassName('form-check-input mt-0');

		this.detailBox = document.getElementById('detailBox');
		this.detailBoxItems = this.detailBox.getElementsByTagName('td');

		this.loadComponentList();
		this.loadModulesList();
		this.bindEvents();
	}

	bindEvents() {
		this.moduleField.onchange = () => this.searchPage.pageModel.onModuleNameChanged(this.moduleField.value);
		this.searchField.oninput = () => this.searchPage.pageModel.onSearchFieldInputted(this.searchField.value);
		this.searchButton.onclick = () => this.searchPage.pageModel.onSearchButtonClicked();
		this.hideTranslatedCheckbox.onchange = () => this.searchPage.pageModel.onHideTranslatedCheckboxChanged(this.hideTranslatedCheckbox.checked);

		for (const component of this.componentsItems) {
			component.onchange = () => {
				this.searchPage.pageModel.onComponentNameChanged(component.value, component.checked);
			}
		};


		// deny form submission
		this.searchForm.onsubmit = function () {
			return false;
		}
		// Allow form submission by ENTER key pressing
		this.searchField.onkeyup = (e) => {
			if (e.key == 'Enter') {
				this.searchButton.click();
			}
		}

		// Hide detail box at ESC key press
		this.detailBox.onkeyup = (e) => {
			if (e.key == 'Escape') {
				this.detailBox.hidden = true;
			}
		}
	}

	loadComponentList() {
		const components = this.searchPage.getComponents();
		let componentItems = '';

		for (const slug of Object.keys(components)) {
			componentItems += `
				<div class="input-group mb-2">
					<div class="input-group-text">
						<input class="form-check-input mt-0" type="checkbox" value="${slug}"
							id="${slug}-item" ${['3d-slicer', 'ctk'].includes(slug) ? 'checked' : ''}>
					</div>
					<label class="form-control" for="${slug}-item">${components[slug]}</label>
				</div>
			`;
		}

		this.componentsList.innerHTML = componentItems;
	}

	loadModulesList() {
		const statistics = this.searchPage.getModulesStats();
		let modulesOptions = '<option value="">All modules</option>';

		for (const moduleName of Object.keys(statistics).sort()) {
			modulesOptions += `
				<option value="${moduleName}">
					${moduleName} [${statistics[moduleName]} strings]
				</option>`;
		}
		this.moduleField.innerHTML = modulesOptions;
	}

	getFormData() {
		const componentStates = {};
		for (const component of this.componentsItems) {
			componentStates[component.value] = component.checked;
		}

		return {
			moduleName: this.moduleField.value,
			searchText: this.searchField.value,
			hideTranslatedText: this.hideTranslatedCheckbox.checked,
			componentStates: componentStates
		}
	}

	showSearchResults(foundMessages) {
		const tableBody = this.stringTable.children[1];

		this.foundStringBox.hidden = false;
		this.stringTable.hidden = foundMessages.length ? false : true;
		this.foundStringBox.innerHTML = `Found strings : ${foundMessages.length}`;

		if (foundMessages.length != 0) {
			tableBody.innerHTML = this.messagesToHtml(foundMessages);;
			this.addShowDetailEvents(tableBody);
		}
	}

	messagesToHtml(foundMessages) {
		let codeHtml = '', messageText, searchText, searchByKeyText, contextString;

		for (const message of foundMessages) {
			messageText = message.getSource();
			contextString = message.getContext();
			searchText = encodeURIComponent(this.getSearchText(message));
			searchByKeyText = encodeURIComponent(`key:=${contextString}`);

			codeHtml += `
                <tr${message.translated[message.component.language] ? ' class="translated"' : ''}>
                    <td>${message.getModulesAsString()}</td>
                    <td>${messageText}</td>
                    <td><i class="fa fa-${message.translated[message.component.language] ? 'check' : 'xmark'}"></i></td>
                    <td>
                        <a href="${message.component.searchUrl + searchByKeyText}" target="_blank"  title="Search this key in Weblate">
                            ${contextString}
                        </a>
                    </td>
                    <td>
                        <a href="#" stringId="${message.component.slug}|${message.index}">
                            <i class="fa fa-info-circle" title="Show details of this string."></i>
                        </a>
                    </td>
                    <td>
                        <a href="${message.component.searchUrl + searchText}" target="_blank">
                            <i class="fa fa-edit" title="Translate this string on Weblate."></i>
                        </a>
                    </td>
                </tr>
            `;
		}

		return codeHtml;
	}

	// Returns the weblate search text of the given message
	getSearchText(message) {
		const messageText = message.getSource();
		const messageContext = message.getContext();

		// replace potential HTML entities by their equivalent characters
		let searchText = messageText.includes('&') ? message.component.htmlDecode(messageText) : messageText;
		const trimedSearchText = searchText.trim();

		if (!searchText.includes(' ') || !searchText.includes(':')) {
			if (trimedSearchText == searchText) {
				// exact match search
				searchText = `key:=${messageContext} AND source:="${searchText}"`;
			}
			else {
				// partial match search
				searchText = `key:=${messageContext} AND source:"${trimedSearchText}"`;
			}
		}
		else {
			// more generic search
			searchText = `${messageContext} "${trimedSearchText}"`;
		}

		return searchText;
	}

	showStringDetails(stringId) {
		let details = this.searchPage.getMessageDetails(stringId);
		this.detailBoxItems[0].innerHTML = details.modules.join("<br>");
		this.detailBoxItems[1].innerHTML = details.key;
		this.detailBoxItems[2].innerHTML = details.source;
		this.detailBoxItems[3].innerHTML = details.translation;
		this.detailBoxItems[4].innerHTML = details.locations.join("<br>");

		this.detailBox.hidden = false;
		this.detailBox.focus(); // so that it closes when the ESC key is typed
	}

	addShowDetailEvents(resultBoxElement) {
		const links = resultBoxElement.querySelectorAll('a[stringId]');

		for (const link of links) {
			link.onclick = () => {
				this.showStringDetails(link.getAttribute('stringId'));
				return false;
			}
		}
	}
}

class SearchPageModel {
	constructor(searchPage) {
		this.searchPage = searchPage;
		const formData = searchPage.getFormData();
		this.moduleName = formData.moduleName;
		this.searchText = formData.searchText;
		this.hideTranslatedText = formData.hideTranslatedText;
		this.componentStates = formData.componentStates;
		this.textFinder = new TextFinder(searchPage);
	}

	onComponentNameChanged(component, checked) {
		this.componentStates[component] = checked;
	}

	onModuleNameChanged(moduleName) {
		this.moduleName = moduleName;
	}

	onHideTranslatedCheckboxChanged(checked) {
		this.hideTranslatedText = checked;
		this.onSearchButtonClicked();
	}

	onSearchFieldInputted(searchText) {
		this.searchText = searchText;
	}

	onSearchButtonClicked() {
		const componentNames = Object.keys(this.componentStates).filter(key => this.componentStates[key]);
		const foundMessages = this.textFinder.searchTextInComponents(componentNames, this.moduleName, this.searchText, this.hideTranslatedText);
		this.searchPage.showSearchResults(foundMessages);
	}
}