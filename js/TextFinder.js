export class TextFinder {

	constructor(searchPage) {
		this.searchPage = searchPage;
		this.componentManager = searchPage.componentManager;
	}

	searchTextInComponent(componentName, moduleName, searchText, hideTranslated) {
		if (!searchText.trim() && (!hideTranslated || !moduleName)) {
			return [];
		}
		const component = this.componentManager.getWeblateComponent(componentName)

		const language = component.language;
		let messageList = component.messagesByLanguage[language];

        if (messageList === undefined) {
            return [];
        }

        if (moduleName) {
            messageList = component.messagesByModule[moduleName];
        }
        searchText = searchText.toLowerCase();
        const foundMessages = [];
        for (const message of messageList) {
            if (message.translated[language] && hideTranslated) continue;
			if (message.getSource().toLowerCase().includes(searchText)
				|| message.getTranslation().toLowerCase().includes(searchText)) {
                foundMessages.push(message);
            }
        }

        return foundMessages;
	}

	searchTextInComponents(componentSlugs, moduleName, searchText, hideTranslated) {
		const foundMessages = [];
		let usedModuleName;
		for (const slug of componentSlugs) {
			usedModuleName = (slug == '3d-slicer') ? moduleName : undefined;
			foundMessages.push(...this.searchTextInComponent(slug, usedModuleName, searchText, hideTranslated));
		}

		return foundMessages;
	}
}