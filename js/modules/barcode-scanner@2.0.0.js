// To use Html5QrcodeScanner (more info below)
import { Html5QrcodeScanner } from "html5-qrcode";

// To use Html5Qrcode (more info below)
import { Html5Qrcode } from "html5-qrcode";

// Конфигурация сканера:
const barcode_scanner_config = {
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

// This method will trigger user permissions
Html5Qrcode.getCameras().then(devices => {
    /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
    if (devices && devices.length) {
        var cameraId = devices[0].id;
        console.log("Доступные камеры: ", devices);
        barcode_scanner_start(cameraId);
    }
}).catch(err => {
    // handle err
});

const html5QrCode = new Html5Qrcode("reader");

function barcode_scanner_stop() {
    html5QrCode.stop().then((ignore) => {
        // QR Code scanning is stopped.
    }).catch((err) => {
        // Stop failed, handle it.
    });
}

function barcode_scanner_start(camera_id) {
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

    html5QrCode.start(
        {
            deviceId: { exact: camera_id }
        },
        barcode_scanner_config,
        (decodedText, decodedResult) => {
            // Обратный вызов при успешном сканировании:
            barcode_scanner_stop();
            document.getElementById('text').innerText = `${decodedText}`; // .
            document.getElementById('result').innerText = `${decodedResult.result.format.formatName}`; // .
            document.querySelector('#reader').classList.add('d-none'); // .

            parseBarcodeOne(decodedText); // Передаём распознанный текст в функцию парсера.
            interfaceRender(true); // Отрисовываем интерфейс.
        },
        (errorMessage) => {
            // parse error, ignore it.
        })
        .catch((err) => {
            // Start failed, handle it.
        });
}