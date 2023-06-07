// <!-- html5-qrcode 2.3.7 (stable) -->
// Подключаем файл с именем functions.js из папки js
// document.write('<script src="/js/html5-qrcode.min@2.3.7.js"></script>');


window.addEventListener('load', () => {
    // Весь ваш код, который должен быть выполнен после загрузки всех ресурсов на странице, должен быть помещен внутрь этой функции обратного вызова. 
});

// Получаем состояние слайдера FPS:
const value = document.querySelector('#rangeTextFps')
const input = document.querySelector('#rangeValueFps')
const storedValue = JSON.parse(localStorage.getItem('num_rangeValueFps'));
// const saveFps = decryptValue(storedValue, secretKey);
// console.log(storedValue)
if (storedValue) {
    input.value = value.textContent = storedValue;
}
input.addEventListener('input', (event) => {
    value.textContent = event.target.value
    // localStorage.setItem('rangeValueFps', JSON.stringify(value.textContent));
})



// Этот метод активирует разрешения пользователя:
Html5Qrcode.getCameras().then(devices => {
    // Устройства (камеры) будут массивом объектов типа: { id: "id", label: "label" }.
    if (devices && devices.length) {
        // Здесь начинается процесс сканирования!

        // console.log('Cameras: ', devices);

        // Получаем идентификатор родительского контейнера сканера баркодов: 
        const html5QrCode = new Html5Qrcode('reader');

        // Обратный вызов при успешном сканировании:
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            barcode_scanner_stop();
            document.getElementById('text').innerText = `${decodedText}`; // .
            document.getElementById('result').innerText = `${decodedResult.result.format.formatName}`; // .
            document.querySelector('#reader').classList.add('d-none'); // .

            parseBarcodeOne(decodedText); // Передаём распознанный текст в функцию парсера.
            interfaceRender(true); // Отрисовываем интерфейс.
        };

        // Обратный вызов при ошибке сканирования:
        function onScanError(errorMessage) { }

        // Конфигурация сканера:
        const config = {
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            // rememberLastUsedCamera: true,
            focusMode: "continuous",
            fps: storedValue,
            qrbox: {
                width: 250,
                height: 250
            },
            // qrbox: qrboxFunction,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 1,
            // supportedScanTypes: [
            //     Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            //     Html5QrcodeScanType.SCAN_TYPE_FILE
            // ],
            // formatsToSupport: [
            //     Html5QrcodeSupportedFormats.QR_CODE,
            //     Html5QrcodeSupportedFormats.DATA_MATRIX
            // ],
        };

        // // Сохраняем массив видеокамер в localStorage при первой загрузке страницы:
        // if (!localStorage.getItem('barcode_scanner_all_devices_list')) {
        //     localStorage.setItem('barcode_scanner_all_devices_list', JSON.stringify(devices));
        // }

        // // Получаем сохраненный массив из localStorage
        // const devicesFromStorage = JSON.parse(localStorage.getItem('barcode_scanner_all_devices_list'));

        // Получаем ссылку на элемент ul, в котором будут располагаться элементы списка
        const cameraList = document.querySelector('#camera-list');

        // Проходимся по массиву устройств и создаем для каждого чекбокс
        devices.forEach((device, index) => {
            // Создаем элемент li, который будет содержать чекбокс и метку
            const li = document.createElement("li");
            li.classList.add("form-check", "m-3");

            // Создаем чекбокс и задаем его атрибуты
            const input = document.createElement("input");
            input.classList.add("form-check-input", "rounded-5");
            input.type = "radio";
            input.name = "radio_camera_list";
            input.id = device.id;
            input.style.transform = "scale(1.5)";

            // Создаем метку для чекбокса и задаем ей текст
            const label = document.createElement("label");
            label.classList.add("form-check-label", "ms-2");
            label.setAttribute("for", device.id);
            label.textContent = device.label;

            // Добавляем чекбокс и метку в элемент li
            li.appendChild(input);
            li.appendChild(label);

            // Добавляем элемент li в список
            cameraList.appendChild(li);
        });























        









        // :
        function interfaceRender(state) {
            document.querySelectorAll('#scan-info').forEach((slider) => {
                if (state) {
                    slider.classList.remove('d-none');
                    slider.classList.add('d-block');
                } else {
                    slider.classList.remove('d-block');
                    slider.classList.add('d-none');
                }
            });
        }

        // Отслеживаем состояние чекбоксов:
        // function trackCheckboxes() {
        //     const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        //     function saveCheckboxState() {
        //         const checkboxStates = {};
        //         checkboxes.forEach((checkbox) => { checkboxStates[checkbox.id] = checkbox.checked; });
        //         localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
        //     }

        //     function loadCheckboxState() {
        //         const savedCheckboxStates = JSON.parse(localStorage.getItem('checkboxStates'));
        //         if (savedCheckboxStates) {
        //             Object.entries(savedCheckboxStates).forEach(([id, checked]) => {
        //                 const checkbox = document.getElementById(id);
        //                 if (checkbox) { checkbox.checked = checked; }
        //             });
        //         }
        //     }

        //     checkboxes.forEach((checkbox) => {
        //         checkbox.addEventListener('change', (event) => {
        //             saveCheckboxState();
        //             // barcode_scanner_camera_id = event.target.id;
        //         });
        //     });

        //     loadCheckboxState();
        // }



        // // Отслеживаем состояние радиокнопок:
        // function track_check_radio() {
        //     const radio = document.querySelectorAll('input[type="radio"]');

        //     function saveCheckboxState() {
        //         const checkboxStates = {};
        //         radio.forEach((radio) => { checkboxStates[radio.id] = radio.checked; });
        //         localStorage.setItem('radioStates', JSON.stringify(checkboxStates));
        //     }

        //     function loadCheckboxState() {
        //         const savedCheckboxStates = JSON.parse(localStorage.getItem('radioStates'));
        //         if (savedCheckboxStates) {
        //             Object.entries(savedCheckboxStates).forEach(([id, checked]) => {
        //                 const radio = document.getElementById(id);
        //                 if (radio) { radio.checked = checked; }
        //             });
        //         }
        //     }

        //     radio.forEach((radio) => {
        //         radio.addEventListener('change', (event) => {
        //             saveCheckboxState();
        //             barcode_scanner_camera_id = event.target.id; // Сохраняем ID камеры в переменную и хранилище.
        //             localStorage.setItem('barcode_scanner_camera_id', JSON.stringify(barcode_scanner_camera_id));
        //         });
        //     });

        //     loadCheckboxState();
        // }

        // После загрузки всех элементов списка обновляем состояние чекбосов:
        // trackCheckboxes();
        // track_check_radio();

        // // Функция для выбора источника для распознавания:
        // var storageCameraID = null;

        // // Определяем переменную, в которую будем записывать выбранный элемент:
        // var barcode_scanner_camera_id = null;


        // function updateCameraSource() {
        //     const rememberLastCamera = JSON.parse(localStorage.getItem('checkboxStates'))['barcode_scanner_remember_devices'];
        //     const radioButtons = document.querySelectorAll('input[type="radio"][name="flexRadioDefault"]');

        //     if (rememberLastCamera === true) {
        //         const camID = JSON.parse(localStorage.getItem('barcode_scanner_camera_id'));

        //         // Если источник был сохранен, восстанавливаем его значение:
        //         if (camID) { storageCameraID = camID; }
        //         else {
        //             // console.log('Старого источника не обнаружено! Устанавливаем значение по умолчанию:');
        //             storageCameraID = 'localImageSource';
        //             radioButtons[0].checked = true; // Устанавливаем радиокнопку выбора локального изображения.
        //         }
        //     }
        //     else {
        //         localStorage.removeItem('barcode_scanner_camera_id'); // Удаляем предыдущий источник.
        //         // снимаем выбор со всех радиокнопок
        //         radioButtons.forEach((radioButton) => { radioButton.checked = false; });
        //     }
        // }

        // :
        // Ручной выбор источника видеозахвата:
        // html5QrCode.start({ deviceId: { exact: barcode_scanner_camera_id } }, config, qrCodeSuccessCallback);
        // Если вы хотите предпочесть фронтальную камеру:
        // html5QrCode.start({ facingMode: "user" }, config, qrCodeSuccessCallback);
        // Если вы хотите предпочесть заднюю камеру:
        // html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
        // Выберите переднюю камеру или завершите работу с ошибкой "OverconstrainedError":
        // html5QrCode.start({ facingMode: { exact: "user" } }, config, qrCodeSuccessCallback);
        // Выберите заднюю камеру или завершите работу с ошибкой "OverconstrainedError":
        // html5QrCode.start({ facingMode: { exact: "environment" } }, config, qrCodeSuccessCallback);
        function barcode_scanner_start(camera_id) {
            if (camera_id) {
                html5QrCode.start({ deviceId: { exact: camera_id } }, config, qrCodeSuccessCallback);
            }
        }

        // Останавливаем использование камеры:
        function barcode_scanner_stop() {
            // html5QrCode.stop().then((ignore) => {
            //     console.log('Сканирование QR-кода остановлено!');
            // }).catch((err) => {
            //     // Остановка не удалась, смирись.
            // });
            html5QrCode.stop();
        }

        // Работа с кнопкой старт/стоп сканирование:
        const barcode_scanner_start_button = document.querySelector('#barcode_scanner_start_button');
        const barcode_scanner_start_button_icon = document.querySelector('#barcode_scanner_start_button_icon');

        // Получаем последнее состояние кнопки из хранилища при загрузке страницы:
        // var barcode_scanner_start_button_state = JSON.parse(localStorage.getItem('checkboxStates'))['barcode_scanner_start_button'];
        var barcode_scanner_start_button_state = JSON.parse(localStorage.getItem('bool_barcode_scanner_start_button'));

        // Обновляем состояние: кнопки и работы сканера после загрузки страницы:
        updateButtonState(barcode_scanner_start_button_state);

        // Отслеживаем нажатие, меняем в хранилище и обновляем на странице состояние кнопки:
        barcode_scanner_start_button.addEventListener('click', () => {
            barcode_scanner_start_button_state = !barcode_scanner_start_button_state;
            updateButtonState(barcode_scanner_start_button_state);
        });

        function updateButtonState(state) {
            updateCameraSource();

            // получаем текущее состояние сканера
            const scannerState = html5QrCode.getState();

            // проверяем состояние сканера
            if (scannerState === Html5QrcodeScannerState.NOT_STARTED) {
                console.log("Сканирование не запущено");
                console.log("Сканирование не запущено", scannerState);
            } else if (scannerState === Html5QrcodeScannerState.SCANNING) {
                console.log("Сканирование выполняется");
                console.log("Сканирование выполняется", scannerState);
            } else if (scannerState === Html5QrcodeScannerState.PAUSED) {
                console.log("Сканирование приостановлено");
                console.log("Сканирование приостановлено", scannerState);
            }

            console.log('state---', state);
            // Управляем состониянием сканирования (старт, стоп, пауза):
            if (!state) { barcode_scanner_stop(); }
            else {
                if (scannerState) { barcode_scanner_start(storageCameraID); }
            }

            // Меняем визуальную часть кнопки управления сканированием:
            if (state) {
                barcode_scanner_start_button.classList.add('active');
                barcode_scanner_start_button_icon.classList.replace('fa-regular', 'fa-duotone');
                barcode_scanner_start_button_icon.classList.replace('fa-qrcode', 'fa-pause');
            } else {
                barcode_scanner_start_button.classList.remove('active');
                barcode_scanner_start_button_icon.classList.replace('fa-duotone', 'fa-regular');
                barcode_scanner_start_button_icon.classList.replace('fa-pause', 'fa-qrcode');
            }
        }

        // // Handle on success condition with the decoded text or result.
        // function onScanSuccess(decodedText, decodedResult) {
        //     // document.location.href = "https://api.telegram.org/bot2100711838:AAE2qHOz6R68rHJZB93Xf_CDOyrfCiqCI7Q/sendMessage?chat_id=-1001752025790&text=result:" + `${decodedText}`;
        // }
        // // Square QR Box, with size = 70% of the min edge.
        // let qrboxFunction = function (viewfinderWidth, viewfinderHeight) {
        //     let minEdgeSizeThreshold = 300;
        //     let edgeSizePercentage = 0.8;
        //     let minEdgeSize = (viewfinderWidth > viewfinderHeight) ? viewfinderHeight : viewfinderWidth;
        //     let qrboxEdgeSize = Math.floor(minEdgeSize * edgeSizePercentage);
        //     if (qrboxEdgeSize < minEdgeSizeThreshold) {
        //         if (minEdgeSize < minEdgeSizeThreshold) {
        //             return {
        //                 width: minEdgeSize,
        //                 height: minEdgeSize
        //             };
        //         } else {
        //             return {
        //                 width: minEdgeSizeThreshold,
        //                 height: minEdgeSizeThreshold
        //             };
        //         }
        //     }
        //     return { width: qrboxEdgeSize, height: qrboxEdgeSize };
        // }

        // Идентификатор кнопки разрешения камеры:
        // document.querySelector('#html5-qrcode-button-camera-permission');
        // Идентификатор кнопки запуска камеры:
        // document.querySelector('#html5-qrcode-button-camera-start').addEventListener('click', function () { html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback); });
        // Идентификатор кнопки остановки камеры:
        // document.querySelector('#html5-qrcode-button-camera-stop').addEventListener('click', function () { html5QrCode.stop(); });
        // Идентификатор кнопки факела:
        // document.querySelector('#html5-qrcode-button-torch');
        // Идентификатор элемента select, используемого для выбора камеры:
        // document.querySelector('#html5-qrcode-select-camera');
        // Идентификатор кнопки, используемой для выбора файла:
        // document.querySelector('#html5-qrcode-button-file-selection');
        // Идентификатор диапазона ввода для масштабирования:
        // document.querySelector('#html5-qrcode-input-range-zoom');
        // Идентификатор элемента привязки {@code <a>}, используемого для переключения между сканированием файлов и сканированием камеры:
        // document.querySelector('#html5-qrcode-anchor-scan-type-change');
        // Класс кнопки фонарика, когда фонарик включен:
        // document.querySelector('#html5-qrcode-button-torch-on');
        // Класс кнопки фонарика, когда фонарик выключен:
        // document.querySelector('#html5-qrcode-button-torch-off');
        // Идентификатор кнопки разрешения камеры:
        // document.querySelector('#html5-qrcode-button-camera-permission');
    }
}).catch(err => {
    // handle err
});
