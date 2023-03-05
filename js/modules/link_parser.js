// 
function parseBarcodeOne(str) {
    // Создание и добавление элементов списка с параметрами изделия:
    document.querySelector('#collapseFirst').innerHTML = '';
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

    // :
    let jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-all.json';
    str = str.slice(str.split('?')[0].length + 1);
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
    // console.log('Получен документ: ' + jsonLink);

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
        // console.log(JSON.parse(bipTK));
        // http://IIOTSENSE.RU/P?CC0000026901112204046
        // CC - 0, 1
        // 00000269 - 2, 3, 4, 5, 6, 7, 8, 9
        // 01 - 10, 11
        // 11220 - 12, 13, 14, 15, 16
        // 4046 - 17, 18, 19, 20


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
        // console.log(JSON.parse(bipTV));


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
        // console.log(JSON.parse(bipU));
        // http://IIOTSENSE.RU/P?D00000019910110114629
        // D0 - 0, 1
        // 00000199 - 2, 3, 4, 5, 6, 7, 8, 9
        // 1 - 10
        // 01 - 11, 12
        // 1011 - 13, 14, 15, 16
        // 4629 - 17, 18, 19, 20


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
        // console.log(JSON.parse(bipG));
        // http://IIOTSENSE.RU/P?D10000034710111105871
        // D1 - 0, 1
        // 00000347 - 2, 3, 4, 5, 6, 7, 8, 9
        // 1 - 10
        // 01 - 11, 12
        // 1110 - 13, 14, 15, 16
        // 5871 - 17, 18, 19, 20

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

                // // <input type="checkbox" id="1" class="box">checkbox1</input><br>
            // // <input type="checkbox" id="2" class="box">checkbox2</input><br>
            // // <input type="checkbox" id="3" class="box">checkbox3</input><br>
            // // <input type="checkbox" id="4" class="box">checkbox4</input><br>
            // // <input type="checkbox" id="5" class="box">checkbox5</input><br>
            // // <input type="checkbox" id="6" class="box">checkbox6</input><br>
            // // Локальное хранилище для сохранения настроек приложения:
            // let boxes = document.getElementsByClassName('box').length;
            // function save() {
            //     for (let i = 1; i <= boxes; i++) {
            //         var checkbox = document.getElementById(String(i));
            //         localStorage.setItem("checkbox" + String(i), checkbox.checked);
            //     }
            // }
            // for (let i = 1; i <= boxes; i++) {
            //     if (localStorage.length > 0) {
            //         var checked = JSON.parse(localStorage.getItem("checkbox" + String(i)));
            //         document.getElementById(String(i)).checked = checked;
            //     }
            // }
            // window.addEventListener('change', save);

    // function parseBarcodeTwo(str) {
    //     const strDash = decodedText.split('-');
    //     const strDot = strDash[1].split('.');

    //     if (strDash[0] == 'device-line') {
    //         if (strDot[0] == 'G') {
    //             jsonLink = 'https://raw.githubusercontent.com/deviashin/iiotsense.ru/main/db/bip-g.json';
    //         }
    //         else { }
    //     }
    //     parseBarcodeOne('IIOTSENSE.RU/P?D10000034710111105871');
    //     get_json_data(jsonLink)
    //         .then(data => {
    //             document.getElementById('Наименование').innerText = `${data.Наименование}`;
    //             document.getElementById('device-line').innerText = `${data.Серия}`;
    //             document.getElementById('МД').innerText = `${data.Модель.МД[strDot[0] + strDot[1]].Имя}`;
    //             document.getElementById('АМ').innerText = `${data.Модель.АМ}`;
    //             document.getElementById('И1').innerText = `${data.Модель.МД.G1.И1[strDot[3][0]]}`;
    //             document.getElementById('И2').innerText = `${data.Модель.МД.G1.И2[strDot[3][1]]}`;
    //             document.getElementById('И3').innerText = `${data.Модель.И3[strDot[3][2]]}`;
    //             document.getElementById('И4').innerText = `${data.Модель.И4[strDot[3][3]]}`;
    //             document.getElementById('СИ').innerText = `${data.Модель.СИ['0']}`;
    //         });
    // }

    // interfaceRender();
    // parseBarcodeOne('IIOTSENSE.RU/P?CC0000026901112204046');
    // parseBarcodeOne('IIOTSENSE.RU/P?D00000019910110114629');
    // parseBarcodeOne('IIOTSENSE.RU/P?D10000034710111105871');