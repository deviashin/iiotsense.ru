// Функция для проверки, посещал ли пользователь ранее этот ресурс. 
function checkVisited() {
    if (!localStorage.getItem('visited-page')) {
        localStorage.setItem('visited-page', true); // Если нет, записываем это в localstorage.
    }
}
checkVisited();

// Секретный ключ для шифрования данных в Local Storage. Обычно его длина составляет от 32 до 128 символов. 
// Рекомендуется использовать случайные символы, такие как буквы (верхнего и нижнего регистра), цифры и специальные символы.
const secretKey = 'dfhgsfdhsfdghs';
// const value = 'Какой-то рандомный текст для тестов!';

// const encryptedValue = encryptValue(value, secretKey);
// console.log('Encrypted value:', encryptedValue);

// const decryptedValue = decryptValue(encryptedValue, secretKey);
// console.log('Decrypted value:', decryptedValue);


function encryptValue(value, secretKey) {
    const cipherText = CryptoJS.AES.encrypt(value, secretKey);
    return cipherText.toString();
}

function decryptValue(value, secretKey) {
    CryptoJS.AES.decrypt(value, secretKey).bytes.toString(CryptoJS.enc.Utf8);
    return decipheredText;
}

function save_input_to_local_storage(input_element) {
    const save = input_element.getAttribute("data-save"); // Получаем значение атрибута 'data-save' у input элемента.
    const formElement = input_element.closest("form"); // Получаем родительскую форму элемента.

    // Если значение атрибута равно 'null' или 'false', значит сохранение не требуется:
    if (save === null || save === "false") {
        const key = input_element.id || input_element.name; // Получаем ключ из id или name элемента.

        // Проверяем, есть ли сохраненное значение по ключу, и если есть - удаляем его из localStorage:
        const storedValue = localStorage.getItem(key); // ПРОВЕРКА ПО key здесь НЕВЕРНА, ВЕДЬ ТАМ МОЖЕТ БЫТЬ РОД.ФОРМА или другой префикс!!!!
        if (storedValue !== null) {
            localStorage.removeItem(key);
        }
    }
    // Если значение атрибута равно 'true', значит нужно сохранить значение элемента в localStorage:
    else {
        // Получаем значение элемента в зависимости от типа (для чекбоксов и радиокнопок - checked, для остальных - value):
        const value =
            input_element.type === "checkbox" || input_element.type === "radio"
                ? input_element.checked
                : input_element.value;

        // Устанавливаем префикс ключа в зависимости от наличия родительской формы и типа элемента:
        let keyPrefix = '';

        // Если есть родительская форма, то префикс - ее id с символом "_":
        if (formElement) {
            keyPrefix = (formElement.id) + '_';
        }

        // Но независимо от наличия родительской формы, добавляем префикс в зависимости от типа элемента:
        if (input_element.type === "checkbox") {
            keyPrefix = keyPrefix + "bool_";
        }
        else if (input_element.type === "radio") {
            keyPrefix = keyPrefix + "radio_";
        }
        else if (!Number.isNaN(Number(input_element.value))) {
            keyPrefix = keyPrefix + "num_";
        }
        else {
            keyPrefix = keyPrefix + "text_";
        }

        // Создаем ключ из префикса и id или name элемента:
        const key = keyPrefix + (input_element.id || input_element.name);


        // сохраняем значение элемента в localStorage, преобразуя его в строку JSON
        // localStorage.setItem(key, JSON.stringify(encryptValue(value, secretKey)));            
        localStorage.setItem(key, JSON.stringify(value));
        // console.log('Туда в крипту: ', value);
    }
}

function load_input_from_local_storage(input_element) {
    // получаем значение атрибута 'data-save' у input элемента
    const save = input_element.getAttribute("data-save");

    // получаем ключ из id или name элемента
    const key = input_element.id || input_element.name;

    // получаем родительскую форму элемента
    const formElement = input_element.closest("form");

    // устанавливаем префикс ключа в зависимости от наличия родительской формы и типа элемента
    let keyPrefix = "";
    if (formElement) {
        // если есть родительская форма, то префикс - ее id или name с символом "_"
        keyPrefix = (formElement.id || formElement.name) + "_";
    } else {
        // если нет родительской формы, то префикс - 'bool_', 'num_' или 'text_' в зависимости от типа элемента
        if (input_element.type === "checkbox" || input_element.type === "radio") {
            keyPrefix = "bool_";
        } else if (!Number.isNaN(Number(input_element.value))) {
            keyPrefix = "num_";
        } else {
            keyPrefix = "text_";
        }
    }

    // создаем ключ из префикса и id или name элемента
    const prefixedKey = keyPrefix + key;

    // если значение атрибута равно null или 'false', значит сохранение не требуется
    if (save === null || save === "false") {
        // проверяем, есть ли сохраненное значение по ключу с префиксом
        const storedValue = localStorage.getItem(prefixedKey);
        if (storedValue !== null) {
            // удаляем сохраненное значение по ключу с префиксом
            localStorage.removeItem(prefixedKey);
        }
    }
    // если значение атрибута равно 'true', значит нужно загрузить значение элемента из localStorage
    else {
        // проверяем, есть ли сохраненное значение по ключу с префиксом
        const storedValue = localStorage.getItem(prefixedKey);
        if (storedValue !== null) {
            // расшифровываем значение из JSON и сохраняем его в переменную
            let decryptedValue;
            try {
                decryptedValue = JSON.parse(storedValue);
                // decryptedValue = JSON.parse(decryptValue(storedValue, secretKey));
                // console.log('Сюда после крипты: ', decryptedValue);
            } catch (error) {
                decryptedValue = null;
            }

            // устанавливаем значение элемента
            if (decryptedValue !== null) {
                if (input_element.type === "checkbox" || input_element.type === "radio") {
                    // для checkbox и radio элементов значение должно быть true или false
                    input_element.checked = decryptedValue === true;
                } else {
                    // для других элементов значение должно быть строкой или числом
                    input_element.value = decryptedValue;
                }
            }
        }
    }
}

// обработчик события загрузки страницы
window.addEventListener("load", function () {
    // получаем все input элементы на странице
    const inputElements = document.querySelectorAll("input");

    // для каждого input элемента вызываем функцию load_input_from_local_storage
    inputElements.forEach(function (inputElement) {
        load_input_from_local_storage(inputElement);
    });
});

document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
        save_input_to_local_storage(input);
        // console.log('Демон изменения inputs: ', input.id);
        // console.log('',);
    });
});

/*
В целом, этот код может быть улучшен, например:
1/ Разбить функции save_input_to_local_storage и load_input_from_local_storage на более мелкие и читабельные функции с более точными именами.
2/ Реализовать функции без использования глобальных переменных. Вместо этого, можно передавать значения в качестве аргументов и возвращать 
результаты, а также использовать локальные переменные.
3/ Разделить логику функции load_input_from_local_storage на две части: первая часть должна получать значения из localStorage и расшифровывать их с 
использованием SECRET_KEY, а вторая часть должна устанавливать значения в элементы формы. Это позволит легче поддерживать код и делает его более читабельным.
4/ Добавить обработку ошибок, например, если при расшифровке данных из localStorage произошла ошибка, то нужно с
 
 
Код может быть улучшен в нескольких аспектах:
1/ Использовать более эффективный алгоритм скрытия и отображения интерфейса. Вместо добавления класса "hidden" для каждого элемента, можно добавить этот класс 
только для родительского элемента и использовать CSS-селекторы, чтобы скрыть все вложенные элементы.
2/ Использовать асинхронный подход для загрузки данных из локального хранилища, чтобы не блокировать интерфейс пользователя во время загрузки.
3/ Добавить проверку наличия значения в локальном хранилище перед восстановлением значения, чтобы не затирать значения, которые пользователь уже ввел в форму.
4/ Добавить возможность настройки ключа шифрования, чтобы пользователь мог задать свой собственный ключ.
5/ Добавить обработку ошибок, чтобы при возникновении ошибок в работе функций пользователь получал понятное сообщение об ошибке.
6/ Оптимизировать код для уменьшения его размера и повышения производительности. Например, можно использовать более короткие имена переменных, убрать лишние 
проверки и т.д. 
*/