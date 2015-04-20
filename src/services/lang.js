(function() {
    'use strict';

    function LangSvc($locale, $window, LANGSTR) {
        this.current = "en";
        //TODO: set angular $locale here

        switch ($window.navigator.language.toLowerCase()) {
            case "en": this.current = "ru"; break;
            case "ru": this.current = "ru"; break;
            case "de": this.current = "de"; break;
            default:      this.current = "en"; break;
        }

        this.get = function(text) {
            if (!LANGSTR[this.current]) return text;
            if (!LANGSTR[this.current][text]) return text;
            return LANGSTR[this.current][text];
        };
    }

    function LangFlt(Lang) {
        return function(text) {
            return Lang.get(text);
        };
    }

    angular.module('app')
        .service('Lang', ['$locale', '$window', 'LANGSTR', LangSvc])
        .filter('lang', LangFlt)
        .constant('LANGSTR', {
            en: {
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
                resetWidgets: "Reset widgets",
                addToFavorites: "Add to favorites",
                removeFromFav: "Remove from favorites",
                refresh: "Refresh",
                showFolders: "Show folders",
                viewAs: "View as",
                err: "Error",
                errWidgetRequest: "Unable to load widget data",
                errLoginRequired: "Please enter login",
                errPassRequired: "Please enter password",
                errUnauth: "Incorrect username or password",
                errNotFound: "Requested url not fount on server",
                errTimeout: "Request timeout",
                errWidgetNotSupported: "Widget is not supported",
                errNoWidgets: "No widgets received from server",
                shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            ru: {
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
                refresh: "Обновить",
                resetWidgets: "Сбросить виджеты",
                addToFavorites: "Добавить в избраное",
                removeFromFav: "Удалить из избраного",
                showFolders: "Отображать папки",
                viewAs: "Отобразить как",
                err: "Ошибка",
                errWidgetRequest: "Невозможо получить данные виджета",
                errLoginRequired: "Пожалуйста введите логин",
                errPassRequired: "Пожалуйста введите пароль",
                errUnauth: "Неверный логин или пароль",
                errNotFound: "Заданый адрес не найден на сервере",
                errTimeout: "Превышен интервал ожидания запроса",
                errWidgetNotSupported: "Виджет не поддерживается",
                errNoWidgets: "Сервер вернул пустой список виджетов",
                shortMonths: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
            },
            de: {}
        });

})();