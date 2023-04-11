const output = [];
var last_select_device = null;
var chart = null;

fetch('report-2023.04.07.txt')
    .then(response => response.text())
    .then(data => {
        // Разделяем содержимое файла на строки
        const lines = data.trim().split('\n');

        // Создаем объект, в котором будем хранить данные
        const result = {};

        // Проходим по каждой строке и преобразуем ее в желаемый формат
        lines.forEach(line => {
            const match = line.match(/^Zigbee2MQTT:info  (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}): MQTT publish: topic 'zigbee2mqtt\/(.+):(.+)', payload '(.+)'/);

            if (match) {
                const [, date, time, model, serial, payloadStr] = match;

                try {
                    const payload = JSON.parse(payloadStr);

                    // Если такая модель еще не встречалась, создаем для нее новый объект
                    if (!result[model]) {
                        result[model] = {
                            model: model,
                            serial: {},
                            data: []
                        };
                    }

                    // Если такой серийный номер еще не встречался, создаем для него новый объект
                    if (!result[model].serial[serial]) {
                        result[model].serial[serial] = {
                            date: [],
                            time: [],
                            linkquality: [],
                            temperature_temp1: [],
                            temperature_temp2: [],
                            new_param: []
                        };
                    }

                    // Добавляем данные в объект
                    result[model].serial[serial].date.push(date);
                    result[model].serial[serial].time.push(time);

                    result[model].serial[serial].linkquality.push(payload.linkquality);

                    if (payload.temperature_temp1) {
                        result[model].serial[serial].temperature_temp1.push(payload.temperature_temp1);
                        // document.getElementById('chart-title').textContent = '1';
                    }

                    if (payload.temperature_temp2) {
                        result[model].serial[serial].temperature_temp2.push(payload.temperature_temp2);
                        // document.getElementById('chart-title').textContent = '2';
                    }

                    if (payload.new_param) {
                        result[model].serial[serial].new_param.push(payload.new_param);
                    }
                } catch (error) {
                    console.log(`Ошибка парсинга JSON в строке "${line}": ${error.message}`);
                }
            } else {
                console.log(`Строка "${line}" не соответствует формату`);
            }
        });

        for (const [modelName, modelData] of Object.entries(result)) {
            for (const [serialNumber, serialData] of Object.entries(modelData.serial)) {
                const data = serialData.date.map((date, index) => {
                    const datum = { date };

                    if (serialData.time && serialData.time[index]) {
                        datum.time = serialData.time[index];
                    }

                    if (serialData.linkquality && serialData.linkquality[index]) {
                        datum.linkquality = serialData.linkquality[index];
                    }

                    if (serialData.temperature_temp1 && serialData.temperature_temp1[index]) {
                        datum.temperature_temp1 = serialData.temperature_temp1[index];
                    }

                    if (serialData.temperature_temp2 && serialData.temperature_temp2[index]) {
                        datum.temperature_temp2 = serialData.temperature_temp2[index];
                    }

                    if (serialData.new_param && serialData.new_param[index]) {
                        datum.new_param = serialData.new_param[index];
                    }

                    return datum;
                });

                output.push({
                    model: modelData.model,
                    serial: serialNumber,
                    data,
                });
            }
        }

        // console.log(output);

        // Получаем количество устройств и их общий список:
        function getModelSerialCount(output) {
            const modelSerialSet = new Set();
            output.forEach(item => {
                const modelSerial = `${item.model}_${item.serial}`;
                modelSerialSet.add(modelSerial);
            });

            return {
                count: modelSerialSet.size,
                modelSerials: [...modelSerialSet]
            };
        }
        const { count, modelSerials } = getModelSerialCount(output);
        // console.log(count);
        // console.log(modelSerials);

        // Получение контекста для работы с графиками:
        let canvas = window.document.querySelector('canvas');
        let context = canvas.getContext('2d');

        // :
        const createLineChart = (model, serial, date, time, temperature_0, temperature_1, linkquality) => {
            let gradient1 = context.createLinearGradient(0, 0, 0, window.screen.width / 2);
            gradient1.addColorStop(0, 'red');
            gradient1.addColorStop(1, 'blue');

            let width, height, gradient;
            function getGradient(ctx, chartArea) {
                const chartWidth = chartArea.right - chartArea.left;
                const chartHeight = chartArea.bottom - chartArea.top;
                if (!gradient || width !== chartWidth || height !== chartHeight) {

                    width = chartWidth;
                    height = chartHeight;
                    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(54, 162, 235, 1)');
                    // gradient.addColorStop(0.5, 'yellow');
                    gradient.addColorStop(1, 'rgba(255, 99, 132, 1)');
                }

                return gradient;
            }

            // Костыль для инвертирования каналов температуры:
            let invert_temp = null;
            if (model === 'БИП-Т.В.11.2000') {
                invert_temp = true;
            } else {
                invert_temp = false;
            }

            const datasets1 = [
                {
                    label: 'Температура 1',
                    data: temperature_0,
                    hidden: invert_temp,
                    pointStyle: false,
                    fill: false,
                    backgroundColor: 'red', // gradient1,
                    borderWidth: 2,
                    borderColor: 'red',
                    // borderColor: function (context) {
                    //     const chart = context.chart;
                    //     const { ctx, chartArea } = chart;

                    //     if (!chartArea) {
                    //         // This case happens on initial chart load
                    //         return;
                    //     }
                    //     return getGradient(ctx, chartArea, temperature_0);
                    // },
                    tension: 0.4 // Степень натяжения для кривой-Безье.
                },
                {
                    label: 'Температура 2',
                    data: temperature_1,
                    hidden: !invert_temp,
                    pointStyle: false,
                    fill: false,
                    backgroundColor: 'orange',
                    borderWidth: 2,
                    borderColor: 'orange',
                    tension: 0.4

                },
                {
                    label: 'Качество связи',
                    data: linkquality,
                    hidden: true,
                    pointStyle: false,
                    fill: false,
                    backgroundColor: 'purple',
                    borderWidth: 2,
                    borderColor: 'purple',
                    tension: 0.4
                }
            ]

            // :
            let excludeDataset2 = false;

            if (!excludeDataset2) {
                document.getElementById('chart-title').textContent = '2';
            }

            const filteredDatasets = datasets1.filter(dataset => {
                return !excludeDataset2 || dataset.label !== 'Температура 1';
            });

            let datas321 = {
                labels: time,
                datasets: filteredDatasets
            }

            // Настройки горизонтальной оси-X (дата-время):
            let xScaleConfig = {
                // min: 0,
                // max: 50,
                ticks: {
                    autoSkip: true, // .
                    minRotation: 30, // Минимальный наклон.
                    maxRotation: 60, // Максимальный наклон.
                    // color: 'rgba(20, 160, 200, 0.7)' // Цвет текста.
                },
                border: {
                    // color: 'rgba(20, 160, 200, 1)' // Цвет нижней линии.
                },
                grid: {
                    // color: 'rgba(20, 160, 200, 0.3)' // Цвет вертикальных линий сетки.
                }
            }

            // Настройки всех линий данных оси-Y (может быть много):
            let yScaleConfig = {
                ticks: {
                    // color: 'rgba(20, 160, 200, 0.7)' // Цвет текста.
                },
                border: {
                    // color: 'rgba(20, 160, 200, 1)' // Цвет нижней линии.
                },
                grid: {
                    // color: 'rgba(20, 160, 200, 0.3)' // Цвет вертикальных линий сетки.
                }
            }



            // :
            let config = {
                type: 'line',
                data: datas321,
                options: {
                    scales: {
                        x: xScaleConfig,
                        y: yScaleConfig
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true, // Отображение легенды.
                            // position: 'right',
                        },
                        // title: {
                        //   display: true,
                        //   text: 'Chart Title',
                        //   align: 'start'
                        // },
                        pan: {
                            enabled: true,
                            mode: 'x',
                            speed: 10,
                            threshold: 10,
                        },
                        zoom: {
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'x',
                            },
                            resetZoom: {
                                enabled: true
                            },
                        },
                    }
                },
            }

            if (chart != null) {
                chart.destroy();
                chart = null;
            }

            chart = new Chart(context, config);
        }

        // получаем ссылку на элемент кнопки
        document.getElementById('reset-zoom-btn').addEventListener('click', () => {
            chart.resetZoom();
        });

        const updateChart = (index) => {
            let datas123 = output[index].data;
            let chart_date = [];
            let chart_time = [];
            let chart_temperature_0 = [];
            let chart_temperature_1 = [];
            let chart_linkquality = [];

            // Дописываем данные, количество i - количество отображаемых записей:
            for (let i = 0; i < datas123.length; i++) {
                chart_date.push(datas123[i].date);
                chart_time.push(datas123[i].time);

                // Только для БИП-Т.В показания каналов инвертированы, исправить когда изменится прошивка.
                chart_temperature_0.push(datas123[i].temperature_temp1);
                chart_temperature_1.push(datas123[i].temperature_temp2);

                chart_linkquality.push(datas123[i].linkquality);
            }

            // :
            createLineChart(
                output[index].model,
                output[index].serial,
                chart_date,
                chart_time,
                chart_temperature_0,
                chart_temperature_1,
                chart_linkquality
            );
        };



        // Построение списка всех преобразованных устройств из лог-файла:
        function createDeviceList(modelSerials) {
            const deviceList = document.createElement('ul');
            deviceList.className = 'list-group mt-3';

            modelSerials.forEach((modelSerial, index) => {
                const [model, serial] = modelSerial.split('_');
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';

                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = 'device';
                radioInput.value = index;
                radioInput.className = 'form-check-input me-3';

                radioInput.addEventListener('click', () => {
                    updateChart(index);
                    last_select_device = index;
                    // console.log(typeof last_select_device);
                });

                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.textContent = `${model} ${serial}`;
                label.prepend(radioInput);
                listItem.append(label);
                deviceList.append(listItem);
            });

            const container = document.getElementById('device_list');
            container.textContent = modelSerials.length;
            container.append(deviceList);
        }

        createDeviceList(modelSerials);
    })
    .catch(error => console.error(error));

//  :
const startDate = document.getElementById("start-date");
const startTime = document.getElementById('start-time');
const endDate = document.getElementById("end-date");
const endTime = document.getElementById("end-time");

// :
function currentDateTime() {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 1); // отнимаем один час
    currentDate.setMinutes(currentDate.getMinutes() - 0); // отнимаем ноль минут
    startTime.value = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    startDate.value = currentDate.toISOString().slice(0, 10);
    // startTime.value = currentDate.toTimeString().slice(0, 5);
    endDate.value = currentDate.toISOString().slice(0, 10);
    endTime.value = currentDate.toTimeString().slice(0, 5);
}

// :
document.addEventListener("DOMContentLoaded", function () {
    currentDateTime();
});

//  :
const updateButton = document.getElementById('update-button');
updateButton.addEventListener('click', function () {
    const startDateTime = new Date(`${startDate.value} ${startTime.value}`);
    const endDateTime = new Date(`${endDate.value} ${endTime.value}`);

    // console.log(output[last_select_device].data);
    // console.log(output[last_select_device]);
    // console.log(last_select_device);

    const filteredData = output[last_select_device].data.filter((item) => {
        // console.log(`${item.date} ${item.time}`);
        const itemDateTime = new Date(`${item.date} ${item.time}`);
        // console.log(itemDateTime);
        return itemDateTime >= startDateTime && itemDateTime <= endDateTime;
    });

    // console.log(startDateTime);
    // console.log(endDateTime);
    console.log(filteredData);

    chart.data = output[last_select_device].data;
    chart.update();
});