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
}

class SearchPageView {

	constructor(searchPage) {
		this.searchPage = searchPage;
		this.componentField = document.getElementById('componentField');
		this.moduleField = document.getElementById('moduleField');
		this.searchField = document.getElementById('searchField');
		this.stringTable = document.getElementById('stringTable');
		this.searchButton = document.getElementById('searchButton');
		this.foundStringBox = document.getElementById('foundStringBox');
		this.searchForm = document.querySelector('#searchPage form');
		this.hideTranslatedCheckbox = document.getElementById('hideTranslatedCheckbox');

		this.bindEvents();
	}

	bindEvents() {
		this.componentField.onchange = () => this.searchPage.pageModel.onComponentNameChanged(this.componentField.value);
		this.moduleField.onchange = () => this.searchPage.pageModel.onModuleNameChanged(this.moduleField.value);
		this.searchField.oninput = () => this.searchPage.pageModel.onSearchFieldInputted(this.searchField.value);
		this.searchButton.onclick = () => this.searchPage.pageModel.onSearchButtonClicked();
		this.hideTranslatedCheckbox.onchange = () => this.searchPage.pageModel.onHideTranslatedCheckboxChanged(this.hideTranslatedCheckbox.checked);


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
	}

	getFormData() {
		return {
			componentName: this.componentField.value,
			moduleName: this.moduleField.value,
			searchText: this.searchField.value,
			hideTranslatedText: this.hideTranslatedCheckbox.checked,

		}
	}

	showSearchResults(foundMessages) {
		const tableBody = this.stringTable.children[1];

		this.foundStringBox.hidden = false;
		this.stringTable.hidden = foundMessages.length ? false : true;
		this.foundStringBox.innerHTML = `Found strings : ${foundMessages.length}`;

		if (foundMessages.length != 0) {
			tableBody.innerHTML = this.messagesToHtml(foundMessages);;
			// this.addShowDetailEvents(tableBody);
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
}

class SearchPageModel {
	constructor(searchPage) {
		this.searchPage = searchPage;
		const formData = searchPage.getFormData();
		this.componentName = formData.componentName;
		this.moduleName = formData.moduleName;
		this.searchText = formData.searchText;
		this.hideTranslatedText = formData.hideTranslatedText;
		this.textFinder = new TextFinder(searchPage);
	}

	onComponentNameChanged(componentName) {
		this.componentName = componentName;
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
		const foundMessages = this.textFinder.searchTextInComponent(this.componentName, this.moduleName, this.searchText, this.hideTranslatedText);
		this.searchPage.showSearchResults(foundMessages);
	}
}