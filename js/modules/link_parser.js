// Список валидных кодов изделий:
const VALID_PRODUCT_TYPE = ["D0", "D1", "CC", "CD"];

// Константы кодов ошибок:
const CODES = {
    SUCCESS_PARSE_DATA: 0,
    INVALID_DATA_MD5_HASH: 1,
    INVALID_PRODUCT_TYPE_FORMAT: 2,
    INVALID_PRODUCT_TYPE: 3,
    INVALID_DATA_FORMAT: 4,
    INVALID_DATA_LENGTH: 5,
    INVALID_PRODUCT_LEGACY: 6,

    ELEMENT_NOT_FOUND: 254,
    UNKNOWN_ERROR: 255
};

// Константы для текстов ошибок
const MESSAGES = {
    SUCCESS_PARSE_DATA: "Успех: Полученная строка успешно обработана!",
    DATA_MD5_HASH: "Ошибка: Неверная контрольная сумма запроса!",
    PRODUCT_TYPE_FORMAT: "Ошибка: Неверный формат типа устройства!",
    PRODUCT_TYPE: "Ошибка: Неверный тип устройства!",
    DATA_FORMAT: "Ошибка: Неверный формат данных!",
    DATA_LENGTH: "Ошибка: Неверная длина данных!",
    PRODUCT_LEGACY: "Ошибка: Обратитесь к производителю для получения полной информации об изделии.",

    ELEMENT_NOT_FOUND: "Ошибка: Не найден искомый элемент на странице!",
    UNKNOWN_ERROR: "Ошибка: нет данных об ошибке!"
};

/**
 * Отображает сообщения об ошибках на странице.
 * @param {any} error - Код ошибки.
 */
function display_error(error) {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
        switch (error) {
            case 0:
                errorContainer.textContent = MESSAGES.SUCCESS_PARSE_DATA;
                console.info(MESSAGES.SUCCESS_PARSE_DATA);
                break;
            case 1:
                errorContainer.textContent = MESSAGES.DATA_MD5_HASH;
                console.error(MESSAGES.DATA_MD5_HASH);
                break;
            case 2:
                errorContainer.textContent = MESSAGES.PRODUCT_TYPE_FORMAT;
                console.error(MESSAGES.PRODUCT_TYPE_FORMAT);
                break;
            case 3:
                errorContainer.textContent = MESSAGES.PRODUCT_TYPE;
                console.error(MESSAGES.PRODUCT_TYPE);
                break;
            case 4:
                errorContainer.textContent = MESSAGES.DATA_FORMAT;
                console.error(MESSAGES.DATA_FORMAT);
                break;
            case 5:
                errorContainer.textContent = MESSAGES.DATA_LENGTH;
                console.error(MESSAGES.DATA_LENGTH);
                break;
            case 6:
                errorContainer.textContent = MESSAGES.PRODUCT_LEGACY;
                console.error(MESSAGES.PRODUCT_LEGACY);
                break;
            default:
                errorContainer.textContent = MESSAGES.UNKNOWN_ERROR;
                console.error(MESSAGES.UNKNOWN_ERROR);
        }
    } else {
        console.error(MESSAGES.ELEMENT_NOT_FOUND);
    }
}

/**
 * Проверяет, является ли префикс допустимым кодом изделия.
 * @param {string} prefix - Код изделия.
 * @returns {boolean} - Возвращает true, если префикс является допустимым кодом изделия, иначе false.
 */
function is_valid_prefix(prefix) {
    return VALID_PRODUCT_TYPE.includes(prefix);
}

/**
 * Проверяет, состоит ли строка только из цифр.
 * @param {string} str - Входная строка.
 * @returns {boolean} - Возвращает true, если строка состоит только из цифр, иначе false.
 */
function is_numeric_string(str) {
    let is_numeric = true;
    str.split('').forEach(char => {
        if (isNaN(parseInt(char))) {
            is_numeric = false;
        }
    });
    return is_numeric;
}

/**
 * Разбирает исходную строку.
 * @param {string} str - Исходная строка для разбора.
 * @returns {number} - Возвращает 0 в случае успеха или числовой код ошибки в случае исключения.
 */
function parse_string(str) {
    let data = str.toUpperCase();  // Инициализируем строку в верхнем регистре со значением исходной строки по умолчанию.
    let start_index = data.indexOf("P?");  // Находим индекс начала подстроки "P?" в исходной строке.
    let report = CODES.SUCCESS_PARSE_DATA;  // Инициализируем код ошибки нулем (нет ошибок).

    if (start_index !== -1) {
        data = data.substring(start_index + 2);  // Если найдена подстрока "P?", обрезаем строку, начиная с двух символов после нее.
    }

    let product_code = data.substring(0, 2);  // Из обрезанной строки берем первые два символа - код изделия.
    let product_data = data.substring(2);  // Из обрезанной строки берем остальную часть - данные об изделии.

    if (product_data.length !== 19 && product_data.length !== 8) {
        report = CODES.INVALID_DATA_LENGTH;  // Проверяем длину данных об изделии.
    }
    else if (!/^[0-9A-F]+$/.test(product_code)) {
        report = CODES.INVALID_PRODUCT_TYPE_FORMAT;  // Проверяем формат кода изделия (символы 0-9 и A-F).
    }
    else if (!is_valid_prefix(product_code)) {
        report = CODES.INVALID_PRODUCT_TYPE;  // Проверяем допустимость кода изделия.
    }
    else if (!is_numeric_string(product_data)) {
        report = CODES.INVALID_DATA_FORMAT;  // Проверяем формат данных об изделии.
    }
    else if (product_data.length === 8) {
        report = CODES.INVALID_PRODUCT_LEGACY;  // Проверяем неполные данные (поддержка легаси устройств).
    }
    else if (get_hash_from_qr_code(data)) {
        report = CODES.INVALID_DATA_MD5_HASH;  // Проверяем сходится ли MD5 хеш-сумма полученной строки.
    }

    // Если код ошибки равен нулю (отсутствуют ошибки), передаем обрезанную строку в функцию parse_barcode_one для разбора:
    if (report === 0) {
        parse_barcode_one(data);
    }
    else {
        display_error(report);  // Иначе, выводим пользователю сообщение об ошибке.
    }

    return report;  // Возвращаем код ошибки из функции для дальнейшей обработки в вызывающем коде.
}




















window.onload = function () {
    var inputElement = document.getElementById('manual_device_input');

    inputElement.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            document.getElementById("error-container").textContent = '';
            var inputValue = inputElement.value;
            let report = parse_string(inputValue);
            if (!report) {
                console.info(MESSAGES.SUCCESS_PARSE_DATA);
            }
        }
    });
};

// Создание и добавление элементов списка с параметрами изделия:
function addElementsList(name, addr, hr = 1) {
    let spanName = document.createElement('span');
    spanName.className = "fw-bold";
    spanName.innerText = name;
    document.querySelector('#collapseFirst').append(spanName);

    let spanAddr = document.createElement('span');
    spanAddr.className = "card-text";
    spanAddr.innerText = addr;
    document.querySelector('#collapseFirst').append(spanAddr);

    if (hr) {
        let hr = document.createElement('hr');
        hr.className = "border opacity-50";
        document.querySelector('#collapseFirst').append(hr);
    }
}







// parse_barcode_one('IIOTSENSE.RU/P?CC0000026901112204046');
// parse_barcode_one('IIOTSENSE.RU/P?D00000019910110114629');
// parse_barcode_one('IIOTSENSE.RU/P?D10000034710111105871');

// Функция разбора исходной строки из запроса к серверу:
function parse_barcode_one(str) {
    document.querySelector('#collapseFirst').innerHTML = '';

    // На случай, если исходная строка начинается с 'P?':
    // if (str[0] + str[1] === "P?") {
    //     str = str.slice(str.split('?')[0].length + 1);
    // }

    // Получаем ссылку на базу данных обо всех устройствах:
    let jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-all.json';

    switch (str[0] + str[1]) {
        case 'CC':
            jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-tk.json';
            break;
        case 'D0':
            jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-u.json';
            break;
        case 'D1':
            jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-g.json';
            break;

        default:
            break;
    }

    console.log('Получен документ: ' + jsonLink);

    // :
    get_json_data(jsonLink).then(data => {
        // Получаем основную информацию об устройстве:
        document.getElementById('Наименование').innerText = `${data.Наименование}`;
        document.getElementById('device-line').innerText = `${data.Серия}`;
        document.getElementById('АМ').innerText = `${data.Модель.АМ}`;

        // Получаем настоящий серийный номер:
        // let SerialN = str[0] + str[1]; // Отображать серийный номер с префиксом изделия.
        let SerialN = 0; // Отображать только серийный номер.
        for (let i = 3; i < 10; i++) { SerialN += str[i]; }
        document.getElementById('SN').innerText = `${SerialN}`;

        //--------------------------------------------------------------------------------------------------------------------------------//
        // БИП-Т . К . XX . X   X   X   X   X . X
        //       (Мд).(АМ).(И1)(И2)(И3)(И4)(И5).(СИ) 
        // let bipTK = '{\"(Мд)\": \"Модель устройства: \",\"(АМ)\": \"Аппаратная модификация устройства: \",\"(И1)\": \"Исполнение по измерению: \",\"(И2)\": \"Исполнение по типу монтажной части (1): \",\"(И3)\": \"Исполнение по типу монтажной части (2): \",\"(И4)\": \"Исполнение по антенне: \",\"(И5)\": \"Исполнение по электропитанию: \",\"(СИ)\": \"Код специсполнения: \",}';
        const bipTK = `{
                "Мд": "Модель устройства: ",
                "АМ": "Аппаратная модификация устройства: ",
                "И1": "Исполнение по измерению: ",
                "И2": "Исполнение по типу монтажной части (1): ",
                "И3": "Исполнение по типу монтажной части (2): ",
                "И4": "Исполнение по антенне: ",
                "И5": "Исполнение по электропитанию: ",
                "СИ": "Код специсполнения: "
            }`;

        // http://IIOTSENSE.RU/P?CC0000026901112204046
        // CC - 0, 1
        // 00000269 - 2, 3, 4, 5, 6, 7, 8, 9
        // 01 - 10, 11
        // 11220 - 12, 13, 14, 15, 16
        // 4046 - 17, 18, 19, 20

        // console.log(JSON.parse(bipTK));
        //--------------------------------------------------------------------------------------------------------------------------------//

        //--------------------------------------------------------------------------------------------------------------------------------//
        // БИП-Т . В . XX . X   X   X   X  . X
        //       (Мд).(АМ).(И1)(И2)(И3)(И4).(СИ)
        const bipTV = `{
                "Мд": "Модель устройства: ",
                "АМ": "Аппаратная модификация устройства: ",
                "И1": "Исполнение по измерению температуры (1): ",
                "И2": "Исполнение по измерению температуры (2): ",
                "И3": "Исполнение по антенне: ",
                "И4": "Исполнение по электропитанию: ",
                "СИ": "Код специсполнения: "
            }`;

        // http://IIOTSENSE.RU/P?
        //  - 
        //  - 
        //  - 
        //  - 
        //  - 

        // console.log(JSON.parse(bipTV));
        //--------------------------------------------------------------------------------------------------------------------------------//

        //--------------------------------------------------------------------------------------------------------------------------------//
        // БИП-У . 1 . XX . X   X   X   X  . X
        //       (Мд).(АМ).(И1)(И2)(И3)(И4).(СИ)
        const bipU = `{
                "Мд": "Модель устройства: ",
                "АМ": "Аппаратная модификация устройства: ",
                "И1": "Исполнение по измерению унифицированных сигналов (1): ",
                "И2": "Исполнение по измерению унифицированных сигналов (2): ",
                "И3": "Исполнение по антенне: ",
                "И4": "Исполнение по электропитанию: ",
                "СИ": "Код специсполнения: "
            }`;

        // http://IIOTSENSE.RU/P?D00000019910110114629
        // D0 - 0, 1
        // 00000199 - 2, 3, 4, 5, 6, 7, 8, 9
        // 1 - 10
        // 01 - 11, 12
        // 1011 - 13, 14, 15, 16
        // 4629 - 17, 18, 19, 20

        // console.log(JSON.parse(bipU));
        //--------------------------------------------------------------------------------------------------------------------------------//

        //--------------------------------------------------------------------------------------------------------------------------------//
        // БИП-G . X . XX . X   X   X   X  . X
        //       (Мд).(АМ).(И1)(И2)(И3)(И4).(СИ)
        const bipG = `{
                "Мд": "Модель устройства: ",
                "АМ": "Аппаратная модификация устройства: ",
                "И1": "Исполнение по подключению ПИП вибрации: ",
                "И2": "Исполнение по подключению ПИП температуры: ",
                "И3": "Исполнение по антенне: ",
                "И4": "Исполнение по электропитанию: ",
                "СИ": "Код специсполнения: "
            }`;

        // http://IIOTSENSE.RU/P?D10000034710111105871
        // D1 - 0, 1
        // 00000347 - 2, 3, 4, 5, 6, 7, 8, 9
        // 1 - 10
        // 01 - 11, 12
        // 1110 - 13, 14, 15, 16
        // 5871 - 17, 18, 19, 20

        // console.log(JSON.parse(bipG));
        //--------------------------------------------------------------------------------------------------------------------------------//

        // 
        // function listInfo(arr, el) {
        //     const obj = JSON.parse(arr);
        //     console.log(obj[el]);
        // }
        // listInfo(bipG, 'И4');

        // Получаем дополнительную информацию в зависимости от типа устройства:
        switch (str[0] + str[1]) {
            case 'CC':
                document.getElementById('МД').innerText = `${data.Модель.МД['К'].Имя}`;
                // addElementsList('Модель устройства: ', data.Модель.МД['К'].Имя);

                // document.getElementById('И1').innerText = `${data.Модель.МД['К'].И1[str[12]]}`;
                addElementsList('Исполнение по измерению: ', data.Модель.МД['К'].И1[str[12]]);

                // document.getElementById('И2').innerText = `${data.Модель.МД['К'].И2[str[13]]}`;
                addElementsList('Монтажная часть тип 1: ', data.Модель.МД['К'].И2['1' + str[13]]);

                // document.getElementById('И2').innerText = `${data.Модель.МД['К'].И3[str[14]]}`;
                addElementsList('Монтажная часть тип 2: ', data.Модель.МД['К'].И3['2' + str[14]]);

                // document.getElementById('И4').innerText = `${data.Модель.И4[str[15]]}`;
                addElementsList('Исполнение по типу антенны: ', data.Модель.И4[str[15]]);

                // document.getElementById('И5').innerText = `${data.Модель.И5[str[16]]}`;                      
                addElementsList('Исполнение по электропитанию: ', data.Модель.И5[str[16]]);

                // document.getElementById('СИ').innerText = `${data.Модель.СИ['0']}`;
                addElementsList('Код специсполнения: ', data.Модель.СИ['0'], false);
                break;

            case 'D0':
                document.getElementById('МД').innerText = `${data.Модель.МД[str[10]]}`;
                document.getElementById('АМ').innerText = `${data.Модель.АМ['У' + str[10]][str[11] + str[12]]}`;
                addElementsList('Исполнение по измерению унифицированных сигналов: ', data.Модель.И1И2[str[13] + str[14]]);
                addElementsList('Исполнение по типу антенны: ', data.Модель.И3[str[15]]);
                addElementsList('Исполнение по электропитанию: ', data.Модель.И4[str[16]]);
                addElementsList('Код специсполнения: ', data.Модель.СИ['0'], false);
                break;

            case 'D1':
                document.getElementById('МД').innerText = `${data.Модель.МД['G' + str[10]].Имя}`;
                // addElementsList('Модель устройства: ', data.Модель.МД['G' + str[10]].Имя);

                // document.getElementById('И1').innerText = `${data.Модель.МД['G' + str[10]].И1[str[13]]}`;
                addElementsList('Исполнение по подключению ПИП вибрации: ', data.Модель.МД['G' + str[10]].И1[str[13]]);

                // document.getElementById('И2').innerText = `${data.Модель.МД['G' + str[10]].И2[str[14]]}`;
                addElementsList('Исполнение по подключению ПИП температуры: ', data.Модель.МД['G' + str[10]].И2[str[14]]);

                // document.getElementById('И3').innerText = `${data.Модель.И3[str[15]]}`;
                addElementsList('Исполнение по типу антенны: ', data.Модель.И3[str[15]]);

                // document.getElementById('И4').innerText = `${data.Модель.И4[str[16]]}`;
                addElementsList('Исполнение по электропитанию: ', data.Модель.И4[str[16]]);

                // document.getElementById('СИ').innerText = `${data.Модель.СИ['0']}`;
                addElementsList('Код специсполнения: ', data.Модель.СИ['0'], false);
                break;

            default:
                break;
        }
    });
}

function get_hash_from_qr_code(qrCodeString) {
    const debug = false; // if (debug) { console.log(); }.
    let result = 0; // Переменная для хранения результата выполнения функции.

    // 1. Забираем исходную строку полученную из QR-кода.
    // Например, "IIOTSENSE.RU/P?D10000021410111103607".
    if (debug) {
        console.log('qrCodeString: ', qrCodeString);
    }

    // ДОБАВИТЬ УСЛОВИЕ, ОТСЕКАТЬ ИЛИ НЕ ОТСЕКАТЬ ССЫЛКУ, ТАК КАК ЭТО УЖЕ ЕСТЬ В ФУНКЦИИ ПАРСЕРА
    // 2. Отсекаем ссылку на сайт "IIOTSENSE.RU/P?":
    // const originalString = qrCodeString.substring("IIOTSENSE.RU/P?".length);
    const originalString = qrCodeString; // Временная заглушка. Так как работает хорошо, скорее всего так и останется.
    if (debug) {
        console.log('originalString: ', originalString);
    }

    // 3. Отсекаем оригинальный хеш "3607" - последние 4 символа исходной строки:
    const originalHash = originalString.substring(originalString.length - 4);
    const originalStringWithoutHash = originalString.substring(0, originalString.length - 4);
    if (debug) {
        console.log('originalHash: ', originalHash);
        console.log('originalStringWithoutHash: ', originalStringWithoutHash);
    }

    // 4. Конкатенируем отсеченную строку с "солью":
    const salt = 'iaaiOdy78sfLkj1vhIe,,,,h2la49\r\n';
    const originalStringWithSalt = originalStringWithoutHash + salt;
    if (debug) {
        console.log('originalStringWithSalt: ', originalStringWithSalt);
    }

    // 5. Получаем MD5 хеш от полученной строки:
    const md5Hash = CryptoJS.MD5(originalStringWithSalt).toString();
    if (debug) {
        console.log('md5Hash: ', md5Hash);
    }

    // 6. Забираем 7 последних символов от MD5 хеша (7 - зависимость от числа int64, но без учёта знака):
    const truncatedMd5Hash = md5Hash.substring(md5Hash.length - 7);
    if (debug) {
        console.log('truncatedMd5Hash: ', truncatedMd5Hash);
    }

    // 7. Переводим их в десятичную систему счисления:
    const truncatedMd5HashDecimal = parseInt(truncatedMd5Hash, 16);
    if (debug) {
        console.log('truncatedMd5HashDecimal: ', truncatedMd5HashDecimal);
    }

    // 8. Забираем последние 4 символа - это и есть получившийся хеш:
    const finalHash = truncatedMd5HashDecimal.toString().substring(truncatedMd5HashDecimal.toString().length - 4);
    if (debug) {
        console.log('finalHash: ', finalHash);
    }

    // 9. Сравниваем с исходным числом из п.3:
    if (finalHash === originalHash) {
        if (debug) {
            console.log('finalHash: ', finalHash + ' === ', 'originalHash: ', originalHash);
            console.log('Проверка хеша пройдена успешно!\r\n\r\n');
        }
    } else {
        result = 1;
        if (debug) {
            console.log('finalHash: ', finalHash + ' !=== ', 'originalHash: ', originalHash);
            console.log('Ошибка! Хеш не соответствует исходному числу.\r\n\r\n');
        }
    }

    return result;
}

// Отсечение любых символов до исходной строки:
function removeLinkPrefix(str) {
    var originalString = str; // Исходная строка.
    var substring = "IIOTSENSE.RU/P?"; // До какой подстроки необходимо отсечь лишнее.
    var startIndex = originalString.indexOf(substring);

    // Если подстрока не найдена - метод "indexOf" вернет "-1":
    if (startIndex !== -1) {
        var result = originalString.substring(startIndex);
    }

    // Вызов функции проверки хеша из полученной строки:
    getHashFromQRCode(result);
}

// Может не работать, если файл находится на другом домене из-за политики безопасности Same Origin Policy.
// Преобразование TXT-файла в массив:
function convertTxtToArray(str) {
    fetch(str)
        .then(response => response.text())
        .then(text => {
            const array = []; // Массив для хранения строк.
            const lines = text.split(/\r?\n/); // Разбиваем текст на строки.

            // Проверяем строки на наличие символов "БИП-"
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('БИП-')) {
                    const line = lines[i].trim(); // Удаляем начальные и конечные пробелы с помощью метода "trim".
                    array.push(line); // Добавляем каждую строку в массив.
                }
            }
            array.forEach(removeLinkPrefix); // Выводим результат.
        })
        .catch(error => console.error(error));
}

// Иммитация настоящих данных, для тестирования:
// convertTxtToArray('БИП-G 29.09.2022.txt');
// convertTxtToArray('БИП-К.2 26.10.2021.txt');
// convertTxtToArray('БИП-Т.П 22.10.2021.txt');

// removeLinkPrefix('IIOTSENSE.RU/P?CC0000026901112204046');
// removeLinkPrefix('IIOTSENSE.RU/P?D00000019910110114629');
// removeLinkPrefix('http://IIOTSENSE.RU/P?D10000034710111105871');
// removeLinkPrefix('IIOTSENSE.RU/P?D10000021410111103607');