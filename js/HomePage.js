export class HomePage {

    constructor (componentsData, modulesData) {
        this.pageModel = new HomePageModel(componentsData, modulesData);
        this.pageView = new HomePageView(this);
    }

    getMainChartData() {
        return this.pageModel.getMainChartData();
    }

    getModulesChartData() {
        return this.pageModel.getModulesChartData();
    }

    getComponentsData() {
        return this.pageModel.getComponentsData();
    }

    setChartsData(componentsData, modulesData) {
        this.pageModel.setComponentsData(componentsData);
        this.pageModel.setModulesData(modulesData);
    }

    render() {
        this.pageView.render();
    }

    onLanguageChanged(language) {
        window.app.onLanguageChanged(language);
    }
}

class HomePageModel {

    constructor(componentsData, modulesData) {
        this.componentsData = componentsData;
        this.modulesData = modulesData;
        // console.log(componentsData);
        // this.componentsData = {
        //     '3D Slicer':75,
        //     'CTK' : 79,
        //     'SlicerIGT' : 62,
        //     'LanguagePacks' : 19,
        //     'SlicerVMTK' : 83,
        //     'TutorialMaker' : 100,
        //     'MONAILabel' : 0
        // }

        // this.modulesData = {
        //     'Welcome' : 64,
        //     'Volumes' : 75,
        //     'Segmentations' : 11,
        //     'Segment Editor' : 54,
        //     'Data' : 80,
        // }
    }

    getMainChartData() {
        return [
            this.componentsData['3D Slicer'], 100 - this.componentsData['3D Slicer']
        ];
    }

    getModulesChartData() {
        const chartData = {
            labels : Object.keys(this.modulesData),
            translated : [],
            nonTranslated : []
        };

        for (const value of Object.values(this.modulesData)) {
            chartData.translated.push(value)
            chartData.nonTranslated.push(100 - value)
        }

        return chartData;
    }

    getComponentsData() {
        return this.componentsData;
    }

    setComponentsData(componentsData) {
        this.componentsData = componentsData;
    }

    setModulesData(modulesData) {
        this.modulesData = modulesData;
    }
}

class HomePageView {

    constructor (homePage) {
        this.homePage = homePage;
        this.container = document.getElementById('homePage');
        this.canvas = document.querySelectorAll('#homePage canvas');
        this.tableContent = document.querySelector('#homePage table tbody');
        
        this.languageSettingsModal = document.querySelector('#languageSettingsModal');
        this.languageList = document.querySelector('#languageList');
        [this.cancelLanguageButton, this.saveLanguageButton] = this.languageSettingsModal.querySelectorAll('.modal-footer button');
        this.saveLanguageButton.onclick = () => this.onSaveLanguageButtonClicked();
     
        this.chartAlreadyExists = false;
    }

    render() {
        this.drawMainChart();
        this.drawModulesChart();
        this.drawComponentsTable();
        if (!this.chartAlreadyExists) {
            this.chartAlreadyExists = true;
        }
    }

    drawMainChart() {
        const dataset = this.homePage.getMainChartData();;
        if (this.chartAlreadyExists) {
            this.mainChart.data.datasets[0].data = dataset;
            this.mainChart.update();
        }
        else {
            const mainChartData = {
                labels: [
                    'Translated',
                    'Non translated'
                ],
                datasets: [{
                    label: 'Translation rate',
                    data: dataset,
                    backgroundColor: [
                        'rgb(38, 72, 123)',
                        'lightskyblue'
                    ],
                }]
            };

            const mainChartConfig = {
                type: 'doughnut',
                data: mainChartData,
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                        },
                        title: {
                            display: false,
                            // text: "French Translation Rate"
                        }
                    },
                    cutout: '60%',
                    // radius: '60%',
                    onClick: () => {
                        console.log("Main component clicked");
                    }
                },
            };

            window.mainChart = this.mainChart = new Chart(this.canvas[0], mainChartConfig);
        }
    }

    drawModulesChart() {
        const modulesChartData = this.homePage.getModulesChartData();

        if (this.chartAlreadyExists) {
            this.modulesChart.data.datasets[0].data = modulesChartData.translated;
            this.modulesChart.data.datasets[1].data = modulesChartData.nonTranslated;
            this.modulesChart.update();
        }
        else {
            const chartData = {
                labels: modulesChartData.labels,
                datasets: [
                    {
                        label: 'Translated',
                        data: modulesChartData.translated,
                        // indexAxis: 'y',
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(38, 72, 123)',
                    },
                    {
                        label: 'Non Translated',
                        data: modulesChartData.nonTranslated,
                        // indexAxis: 'y',
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'lightskyblue',
                    }
                ]
            };

            const chartConfig = {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: false,
                            // text: 'Chart.js Bar Chart'
                        }
                    },
                    onClick: (event, activeItems, chart) => {
                        if (activeItems.length != 0) {
                            console.log('Clicked item : ' + chart.data.labels[activeItems[0].index]);
                        } else {
                            console.log("Empty area");
                        }
                    },
                },
            };

            window.modulesChart = this.modulesChart = new Chart(this.canvas[1], chartConfig);
        }
        
    }

    drawComponentsTable() {
        let tableContent = ''
        let dataset = this.homePage.getComponentsData();

        for (const key of Object.keys(dataset)) {
            if (key == '3D Slicer') continue;

            tableContent += `
                <tr class="align-middle">
                    <td>${key}</td>
                    <td>
                        <div class="progress" role="progressbar" aria-valuenow="${dataset[key]}" aria-valuemin="0"
                            aria-valuemax="100" style="height: 20px">
                            <div class="progress-bar" style="width: ${dataset[key]}%">${dataset[key]}%</div>
                        </div>
                    </td>
                </tr>
            `;
        }

        this.tableContent.innerHTML = tableContent;
    }

    onSaveLanguageButtonClicked() {
        this.cancelLanguageButton.click();
        this.homePage.onLanguageChanged(this.languageList.value);
    }
}