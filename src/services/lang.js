/**
 * Localization service. Also contains localization filter
 */
(function() {
    'use strict';

    function LangSvc( $window, LANGSTR) {
        //var settings = Storage.getAppSettings();
        var _this = this;
        this.getLanguages = getLanguages;
        this.get = get;
        //TODO: set angular $locale here

        //if (!settings.language) {
            switch ($window.navigator.language.toLowerCase()) {
                case "en":
                    this.current = "ru";
                    break;
                case "ru":
                    this.current = "ru";
                    break;
                case "de":
                    this.current = "de";
                    break;
                default:
                    this.current = "en";
                    break;
            }
        //} else this.current = settings.language || "en";

        /**
         * Translates string with current language
         * @param text string to translate
         * @returns {string} translated string
         */
        function get(text) {
            if (!LANGSTR[_this.current]) return text;
            if (!LANGSTR[_this.current][text]) return text;
            return LANGSTR[_this.current][text];
        }

        /**
         * Returns supported languages
         * @returns {Array} Supported languages
         */
        function getLanguages() {
            var langs = [];
            for (var l in LANGSTR) langs.push(l);
            return langs;
        }
    }

    /**
     * Angular filter function for language support
     * @param Lang
     * @returns {Function}
     * @constructor
     */
    function LangFlt(Lang) {
        return function(text) {
            return Lang.get(text);
        };
    }

    angular.module('app')
        .service('Lang', ['$window', 'LANGSTR', LangSvc])
        .filter('lang', ['Lang', LangFlt])

    /**
     * All language string constants
     */
        .constant('LANGSTR', {
            en: {
                export: 'Export',
                pngImage: 'Image (*.png)',
                svgImage: 'Image (*.svg)',
                jpgImage: 'Image (*.jpg)',
                pdfDoc: 'Document (*.pdf)',
                xlsDoc: 'Document (*.xls)',
                about: "About",
                cancel: "Cancel",
                save: "Save",
                load: "Load",
                share: "Share",
                //theme: "Theme",
                //view: "View",
                curSettings: "Current settings",
                newView: "New",
                language: "Language",
                dashboard: "Dashboard",
                folder: "Folder",
                signin: "Sign in",
                signout: "Sign out",
                login: "Login",
                password: "Password",
                namespace: "Namespace",
                loading: "Loading...",
                search: "Search",
                accept: "Accept",
                close: "Close",
                dismiss: "Dismiss",
                home: "Home",
                zoom: "Zoom",
                resetWidgets: "Reset widgets",
                resetTiles: "Reset tiles",
                addToFavorites: "Add to favorites",
                removeFromFav: "Remove from favorites",
                refresh: "Refresh",
                showFolders: "Show folders",
                showTop: "Show top items",
                viewAs: "View as",
                count: "Count",
                filters: "Filters",
                setDefault: "Reset to default",
                dashColumns: "Column count",
                widgetHeight: "Widget height(px)",
                noData: "No data to display",
                byRows: "Display by rows",
                by2columns: "Display by two columns",
                by3columns: "Display by three columns",
                print: "Print...",
                fav: "Favorites",
                options: "Settings",
                gotoDeepSee: "Goto DeepSee",
                showLegend: "On/off legend",
                showPivot: "Show as pivot table",
                back: "Back",
                exclude: "Exclude",
                all: "All",
                interval: "Interval",
                not: "Not",
                from: "From",
                to: "To",
                metroStyle: "Metro UI",
                bgColor: "Background color",
                fntColor: "Font color",
                icon: "Icon",
                done: "Done",
                widget: "Widget",
                showImages: "Show images",
                dataSource: "Data source",
                hideTitle: "Hide title",
                showZero: "Set axis minimum to zero",
                showValues: "Show values",
                err: "Error",
                errWidgetRequest: "Unable to load widget data",
                errLoginRequired: "Please enter login",
                errPassRequired: "Please enter password",
                errUnauth: "Incorrect username or password",
                errNotFound: "Requested url not fount on server",
                errTimeout: "Request timeout",
                errWidgetNotSupported: "Widget is not supported",
                errNoWidgets: "No widgets received from server",
                errNoDashboards: "No dashboards in this namespace",
                shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            ru: {
                export: 'Экспорт',
                pngImage: 'Картинка (*.png)',
                svgImage: 'Картинка (*.svg)',
                jpgImage: 'Картинка (*.jpg)',
                pdfDoc: 'Документ (*.pdf)',
                xlsDoc: 'Документ (*.xls)',
                about: "О программе",
                cancel: "Отмена",
                save: "Сохранить",
                load: "Загрузить",
                share: "Поделиться",
                //theme: "Тема",
                //view: "Представление",
                curSettings: "Текущие настройки",
                newView: "Добавить",
                language: "Язык",
                dashboard: "Индикаторная панель",
                folder: "Папка",
                signin: "Вход",
                signout: "Выход",
                login: "Логин",
                password: "Пароль",
                namespace: "Область",
                loading: "Загрузка...",
                search: "Поиск",
                accept: "Принять",
                close: "Закрыть",
                dismiss: "Сбросить",
                home: "Домой",
                zoom: "Увеличение",
                refresh: "Обновить",
                resetWidgets: "Сбросить виджеты",
                resetTiles: "Сбросить тайлы",
                addToFavorites: "Добавить в избраное",
                removeFromFav: "Удалить из избраного",
                showFolders: "Отображать папки",
                showTop: "Показать только верхние",
                viewAs: "Отобразить как",
                count: "Кол-во",
                filters: "Фильтры",
                setDefault: "Установить по умолчанию",
                dashColumns: "Колонки",
                widgetHeight: "Высота виджетов(px)",
                noData: "Нет данных",
                byRows: "Отобразить построчно",
                by2columns: "Отобразить двумя колонками",
                by3columns: "Отобразить тремя колонками",
                print: "Печать...",
                fav: "Избраное",
                options: "Настройки",
                gotoDeepSee: "Перейти в DeepSee",
                showLegend: "Вкл/выкл легенду",
                showPivot: "Показать как таблицу",
                back: "Назад",
                exclude: "Исключить",
                all: "Все",
                not: "Не",
                interval: "Интервал",
                from: "От",
                to: "До",
                metroStyle: "Стиль Metro",
                bgColor: "Цвет фона",
                fntColor: "Цвет шрифта",
                icon: "Значок",
                done: "Готово",
                widget: "Виджет",
                showImages: "Отображать картинки",
                dataSource: "Источник данных",
                hideTitle: "Скрывать заголовок",
                showZero: "Отображать 0 на оси",
                showValues: "Отображать значения",
                err: "Ошибка",
                errWidgetRequest: "Невозможо получить данные виджета",
                errLoginRequired: "Пожалуйста введите логин",
                errPassRequired: "Пожалуйста введите пароль",
                errUnauth: "Неверный логин или пароль",
                errNotFound: "Заданый адрес не найден на сервере",
                errTimeout: "Превышен интервал ожидания запроса",
                errWidgetNotSupported: "Виджет не поддерживается",
                errNoWidgets: "Сервер вернул пустой список виджетов",
                errNoDashboards: "В данной обласни нет дашбордов",
                shortMonths: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
            }
        });

})();