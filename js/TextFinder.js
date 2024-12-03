export class TextFinder {

	constructor(searchPage) {
		this.searchPage = searchPage;
		this.componentManager = searchPage.componentManager;
		// console.log(this.componentManager);
		// this.currentComponentIndex = 0;
	}

	searchTextInComponent(componentName, moduleName, searchText, hideTranslated) {
		const component = this.componentManager.getWeblateComponent(componentName)
		// console.log(`${componentName}, ${moduleName}, ${searchText}, ${hideTranslated} `);
		// console.log(component);

		const language = component.language;
		let messageList = component.messagesByLanguage[language];

        if (messageList === undefined) {
            return [];
        }

        if (moduleName) {
            messageList = component.messagesByModule[moduleName];
        }
		// console.log(messageList);
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

	searchTextInComponents(searchText, components) {

	}
}