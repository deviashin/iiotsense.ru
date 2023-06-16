function getHashFromQRCode(qrCodeString) {
    const debug = true; // if (debug) { console.log(); }.
    let result = 0; // Переменная для хранения результата выполнения функции.

    // 1. Забираем исходную строку полученную из QR-кода.
    // Например, "IIOTSENSE.RU/P?D10000021410111103607".
    if (debug) {
        console.log('qrCodeString: ', qrCodeString);
    }

    // 2. Отсекаем ссылку на сайт "IIOTSENSE.RU/P?":
    const originalString = qrCodeString.substring("IIOTSENSE.RU/P?".length);
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
        if (debug) {
            result = 1;
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