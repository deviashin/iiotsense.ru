// Интерфейс устройства камеры:
interface CameraDevice {
  id: string;
  label: string;
}

// Различные состояния сканера:
enum Html5QrcodeScannerState {
  NOT_STARTED = 0, // Указывает, что сканирование не запущено или пользователь использует сканирование на основе файлов.
  SCANNING, // Сканирование камеры выполняется.
  PAUSED, // Сканирование камеры приостановлено, но камера работает.
}

// Форматы кода, поддерживаемые этой библиотекой:
enum Html5QrcodeSupportedFormats {
  QR_CODE = 0,
  AZTEC,
  CODABAR,
  CODE_39,
  CODE_93,
  CODE_128,
  DATA_MATRIX,
  MAXICODE,
  ITF,
  EAN_13,
  EAN_8,
  PDF_417,
  RSS_14,
  RSS_EXPANDED,
  UPC_A,
  UPC_E,
  UPC_EAN_EXTENSION,
}

// Определяет размер для сканера QR-кода:
interface QrDimensions {
  width: number;
  height: number;
}

/**
 * Функция, которая принимает ширину и высоту видеопотока возвращает QrDimensions.
 * Видоискатель относится к видео, показывающему поток с камеры.
 */
type QrDimensionFunction =
  (viewfinderWidth: number, viewfinderHeight: number) => QrDimensions;

// Формат обнаруженного кода:
class QrcodeResultFormat {
  public readonly format: Html5QrcodeSupportedFormats;
  public readonly formatName: string;
}

// Подробный результат сканирования:
interface QrcodeResult {
  text: string; // Декодированный текст.
  format?: QrcodeResultFormat, // Формат, который был успешно просканирован.
}

// Объект результата QrCode:
interface Html5QrcodeResult {
  decodedText: string;
  result: QrcodeResult;
}

// Обратный вызов для успешного сканирования кода:
type QrcodeSuccessCallback = (decodedText: string, result: Html5QrcodeResult) => void;

// Обратный вызов при сбое во время сканирования кода:
type QrcodeErrorCallback = (errorMessage: string, error: Html5QrcodeError) => void;

// Интерфейс для настройки экземпляра класса {@class Html5Qrcode}:
interface Html5QrcodeConfigs {
  // Массив поддерживаемых форматов типа {@type Html5QrcodeSupportedFormats}:
  formatsToSupport: Array<Html5QrcodeSupportedFormats> | undefined;

  /**
   * {@class BarcodeDetector} в настоящее время реализуется браузерами.
   * Он имеет очень ограниченную поддержку браузеров, но по мере его доступности он может включить более быстрое сканирование собственного кода.
   *
   * Установите для этого флага значение true, чтобы разрешить использование {@class BarcodeDetector}, если поддерживается. Это true по умолчанию.
   *
   * Документы:
   * - https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
   * - https://web.dev/shape-detection/#barcodedetector
   */
  useBarCodeDetectorIfSupported?: boolean | undefined;
}

// Конфигурация для создания {@class Html5Qrcode}:
interface Html5QrcodeFullConfig extends Html5QrcodeConfigs {
  verbose: boolean | undefined; // Если true, все журналы будут выводиться на консоль. Ложь по умолчанию.
}

interface Html5QrcodeCameraScanConfig {
  // Необязательно, ожидаемая частота кадров при сканировании QR-кода. пример { fps: 2 } означает сканирование будет выполняться каждые 500 мс: 
  fps: number | undefined;

  /**
    * Опционально, размер края, размер или функция калькулятора для сканирования QR поле, значение или вычисленное значение должно быть меньше, чем ширина и высота всей области.
    *
    * Это сделало бы сканер похожим на это:
    * ----------------------
    * |********************|
    * |******,,,,,,,,,*****| <--- заштрихованная область
    * |*****| |*****| <--- незаштрихованная область будет
    * |*****| |*****| используется для сканирования QR-кода.
    * |******|_______|*****|
    * |********************|
    * |********************|
    * ----------------------
    *
    * Экземпляр {@interface QrDimensions} может быть передан для создания не квадратный рендеринг коробки сканера. Вы также можете передать функцию типа
    * {@type QrDimensionFunction}, которая принимает ширину и высоту видеопоток и возвращаемый QR-бокс размером типа {@interface QrDimensions}.
    *
    * Если это значение не установлено, заштрихованное поле QR отображаться не будет, и сканер будет сканировать всю область видеопотока.
    */
  qrbox?: number | QrDimensions | QrDimensionFunction | undefined;

  // Опционально, желаемое соотношение сторон для видеопотока. Идеальные пропорции 4:3 или 16:9. Передача очень неправильного соотношения сторон может привести к видеопотоку не появляется.
  aspectRatio?: number | undefined;


  // Необязательно, если перевернутый QR-код {@code true} не будет сканироваться. Используйте только это если вы уверены, что камера не может дать зеркальную подачу, если вы смотрите ограничения производительности.
  disableFlip?: boolean | undefined;

  /**
    * Необязательно, @beta(этот конфиг еще плохо поддерживается).
    *
    * Важно: при передаче это переопределяет другие параметры, такие как 'cameraIdOrConfig' или такие конфигурации, как 'aspectRatio'.
    * 'videoConstraints' должен иметь тип {@code MediaTrackConstraints} как определено в https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    * и используется для указания различных элементов управления видео или камерой, таких как: соотношение сторон, режим облицовки, частота кадров и т. д.
    */
  videoConstraints?: MediaTrackConstraints | undefined;
}

// Интерфейс для управления различными аспектами {@class Html5QrcodeScanner}:
interface Html5QrcodeScannerConfig
  extends Html5QrcodeCameraScanConfig, Html5QrcodeConfigs {

  /**
    * Если {@code true}, библиотека запомнит, есть ли у камеры разрешения были предоставлены ранее и какая камера использовалась в последний раз. 
    * Если разрешения уже предоставлено для «камеры», сканирование QR-кода будет автоматически Старт для ранее использовавшейся камеры.
    *
    * Примечание: значение по умолчанию — {@code true}.
    */
  rememberLastUsedCamera?: boolean | undefined;

  /**
    * Задает желаемые типы сканирования, которые должны поддерживаться сканером.
    *
    * - Не заданное значение будет следовать порядку по умолчанию, поддерживаемому библиотека.
    * - Первое значение будет использоваться как значение по умолчанию. Пример:
    * - [SCAN_TYPE_CAMERA, SCAN_TYPE_FILE]: камера будет типом по умолчанию, пользователь может переключиться на сканирование на основе файлов.
    * - [SCAN_TYPE_FILE, SCAN_TYPE_CAMERA]: сканирование на основе файлов будет использоваться по умолчанию, пользователь может переключиться на сканирование с помощью камеры.
    * - Установка только значения отключит возможность переключения на другое. Пример:
    * - [SCAN_TYPE_CAMERA] - Поддерживается только сканирование с камеры.
    * - [SCAN_TYPE_FILE] - Поддерживается только сканирование на основе файлов.
    * - Установка неверных значений или нескольких значений приведет к ошибке.
    */
  supportedScanTypes?: Array<Html5QrcodeScanType> | [];

  /**
  * Если {@code true}, визуализированный пользовательский интерфейс будет иметь кнопку для включения или выключения вспышки в зависимости от устройства + поддержки браузера.
  *
  * Примечание: значение по умолчанию — {@code false}.
  */
  showTorchButtonIfSupported?: boolean | undefined;
};

class Html5Qrcode {
  // Возвращает обещание со списком всех камер, поддерживаемых устройством:
  static getCameras(): Promise<Array<CameraDevice>>;

  /**
   * Инициализировать сканер QR-кода.
   *
   * @param elementId — идентификатор HTML-элемента.
   * @param verbose — необязательный объект конфигурации
   */
  constructor(elementId: string, config: Html5QrcodeFullConfig | undefined);

  /**
    * Начните сканирование QR-кодов или штрих-кодов для данной камеры.
    *
    * @param cameraIdOrConfig Идентификатор камеры, это может быть
    * идентификатор камеры получен из метода {@code Html5Qrcode#getCameras()} или
    * объект с ограничением режима облицовки.
    * @param configuration Дополнительные настройки для настройки сканера кода.
    * @param qrCodeSuccessCallback Обратный вызов, вызываемый, когда экземпляр QR
    * обнаружен код или любой другой поддерживаемый штрих-код.
    * @param qrCodeErrorCallback Обратный вызов вызывается в случаях, когда нет экземпляра
    * Обнаружен QR-код или любой другой поддерживаемый штрих-код.
    */
  start(
    cameraIdOrConfig: Html5QrcodeIdentifier,
    configuration: Html5QrcodeCameraScanConfig | undefined,
    qrCodeSuccessCallback: QrcodeSuccessCallback | undefined,
    qrCodeErrorCallback: QrcodeErrorCallback | undefined,
  ): Promise<null>;

  /**
    * Приостанавливает текущее сканирование.
    *
    * @param shouldPauseVideo (необязательно, по умолчанию = false) Если {@code true}
    * видео будет приостановлено.
    *
    * Ошибка @throws, если метод вызывается, когда сканер не находится в состоянии сканирования.
    */
  pause(shouldPauseVideo?: boolean);

  /**
    * Возобновляет приостановленное сканирование.
    *
    * Если видео ранее было приостановлено с помощью параметра {@code shouldPauseVideo}
    * на {@code true} в {@link Html5Qrcode#pause(shouldPauseVideo)}, вызывая
    * этот метод возобновит воспроизведение видео.
    *
    * Примечание: с этим вызывающим абонентом начнут получать результаты в виде успеха и ошибки
    * обратные вызовы.
    *
    * Ошибка @throws, если метод вызывается, когда сканер не находится в состоянии паузы.
    */
  resume();

  /**
    * Останавливает потоковое видео и сканирование QR-кода.
    */
  stop(): Promise<void>;

  /**
        * Получает состояние сканирования камеры.
        *
        * @returns состояние типа {@enum ScannerState}.
        */
  getState(): Html5QrcodeScannerState;

  /**
    * Сканирует файл изображения для QR-кода.
    *
    * Эта функция несовместима со сканированием с помощью камеры.
    * вызовите stop(), если сканирование с камеры продолжалось.
    *
    * @param imageFile — локальный файл с содержимым изображения.
    * @param showImage если true, изображение будет отображаться на данном элементе.
    *
    * @returns Promise с расшифрованной строкой QR-кода в случае успеха.
    */
  scanFile(
    imageFile: File,
      /* default=true */ showImage: boolean | undefined): Promise<string>;

  /**
    * Очищает существующий холст.
    *
    * Примечание: в случае текущего сканирования с помощью веб-камеры необходимо явно
    * закрывается перед вызовом этого метода, иначе будет выброшено исключение.
    */
  clear(): void;


  /**
    * Возвращает возможности бегущей видеодорожки.
    *
    * Подробнее: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints.
    *
    * Важный:
    * 1. Должен вызываться только в том случае, если выполняется сканирование на базе камеры.
    *
    * @returns возможности работающей видеодорожки.
    * Ошибка @throws, если сканирование не запущено.
    */
  getRunningTrackCapabilities(): MediaTrackCapabilities;

  /**
    * Возвращает объект, содержащий текущие значения каждого ограничения свойство бегущей видеодорожки.
    *
    * Подробнее: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
    *
    * Важный:
    * 1. Должен вызываться только в том случае, если выполняется сканирование на базе камеры.
    *
    * @returns поддерживаемые настройки бегущей видеодорожки.
    * Ошибка @throws, если сканирование не запущено.
    */
  getRunningTrackSettings(): MediaTrackSettings;

  /**
    * Примените ограничения видео на запуск видеодорожки с камеры.
    *
    * Примечание. Следует вызывать, только если {@code Html5QrcodeScanner#getState()}
    * возвращает {@code Html5QrcodeScannerState#SCANNING} или
    * {@code Html5QrcodeScannerState#PAUSED}.
    *
    * @param {MediaTrackConstraints} указывает различные видео или камеры
    * элементы управления, как определено в
    * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    * @returns обещание, которое выполняется, если применяются переданные ограничения,
    * в противном случае не работает.
    * Ошибка @throws, если сканирование не запущено.
    */
  applyVideoConstraints(videoConstaints: MediaTrackConstraints): Promise<void>;
}

class Html5QrcodeScanner {
  /**
    * Создает экземпляр этого класса.
    *
    * @param elementId Идентификатор элемента HTML.
    * @param config Дополнительные настройки для настройки сканера кода.
    * @param verbose — если true, все журналы будут выводиться на консоль.
    */
  constructor(
    elementId: string,
    config: Html5QrcodeScannerConfig | undefined,
    verbose: boolean | undefined);

  /**
    * Отображает пользовательский интерфейс.
    *
    * @param qrCodeSuccessCallback Обратный вызов, вызываемый, когда экземпляр QR
    * обнаружен код или любой другой поддерживаемый штрих-код.
    * @param qrCodeErrorCallback необязательный обратный вызов, вызываемый в случаях, когда нет
    * найден экземпляр QR-кода или любого другого поддерживаемого штрих-кода.
    */
  render(
    qrCodeSuccessCallback: QrcodeSuccessCallback,
    qrCodeErrorCallback: QrcodeErrorCallback | undefined);

  /**
    * Приостанавливает текущее сканирование.
    *
    * Примечания:
    * - Должен вызываться, только если сканирование камеры продолжается.
    *
    * @param shouldPauseVideo (необязательно, по умолчанию = false) Если {@code true}
    * видео будет приостановлено.
    *
    * Ошибка @throws, если метод вызывается, когда сканер не находится в состоянии сканирования.
    */
  pause(shouldPauseVideo?: boolean);

  /**
    * Возобновляет приостановленное сканирование.
    *
    * Если видео ранее было приостановлено с помощью параметра {@code shouldPauseVideo}
    * на {@code true} в {@link Html5QrcodeScanner#pause(shouldPauseVideo)},
    * вызов этого метода возобновит воспроизведение видео.
    *
    * Примечания:
    * - Должен вызываться, только если сканирование камеры продолжается.
    * - С этим вызывающим абонентом начнется получение результатов в виде успеха и ошибки
    * обратные вызовы.
    *
    * Ошибка @throws, если метод вызывается, когда сканер не находится в состоянии паузы.
    */
  resume();

  /**
    * Получает состояние сканирования камеры.
    *
    * @ возвращает состояние типа {@enum Html5QrcodeScannerState}.
    */
  getState(): Html5QrcodeScannerState;

  /** Удаляет пользовательский интерфейс сканера QR-кода. */
  clear(): Promise<void>;

  /**
    * Возвращает возможности бегущей видеодорожки.
    *
    * Подробнее: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints.
    *
    * Примечание. Следует вызывать, только если {@code Html5QrcodeScanner#getState()}
    * возвращает {@code Html5QrcodeScannerState#SCANNING} или
    * {@code Html5QrcodeScannerState#PAUSED}.
    *
    * @returns возможности работающей видеодорожки.
    * Ошибка @throws, если сканирование не запущено.
    */
  getRunningTrackCapabilities(): MediaTrackCapabilities;

  /**
    * Возвращает объект, содержащий текущие значения каждого ограничения
    * свойство бегущей видеодорожки.
    *
    * Подробнее: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
    *
    * Примечание. Следует вызывать, только если {@code Html5QrcodeScanner#getState()}
    * возвращает {@code Html5QrcodeScannerState#SCANNING} или
    * {@code Html5QrcodeScannerState#PAUSED}.
    *
    * @returns поддерживаемые настройки бегущей видеодорожки.
    * Ошибка @throws, если сканирование не запущено.
    */
  getRunningTrackSettings(): MediaTrackSettings;

  /**
    * Примените ограничения видео на запуск видеодорожки с камеры.
    *
    * Примечание. Следует вызывать, только если {@code Html5QrcodeScanner#getState()}
    * возвращает {@code Html5QrcodeScannerState#SCANNING} или
    * {@code Html5QrcodeScannerState#PAUSED}.
    *
    * @param {MediaTrackConstraints} указывает различные видео или камеры
    * элементы управления, как определено в
    * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    * @returns обещание, которое выполняется, если применяются переданные ограничения,
    * в противном случае не работает.
    * Ошибка @throws, если сканирование не запущено.
    */
  applyVideoConstraints(videoConstaints: MediaTrackConstraints): Promise<void>;
}