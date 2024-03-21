import version from './../../package.json';

export const dsw = {
    // TODO: add type for addons
    addons: [],
    mobile: false, // TODO: add to init = screen.availWidth <= 600;
    desktop: true,
    const: {
        themes: [
            {text: 'Default', file: ''},
            {text: 'Contrast', file: 'contrast.css'}
            // {text: 'Metro', file: 'themes/metro.css'},
            // {text: 'Black', file: 'themes/black.css'}
        ],
        bgColorClasses: ['', 'cl1', 'cl2', 'cl3', 'cl4', 'cl5', 'cl6', 'cl7', 'cl8', 'cl9'],
        fontColors: ['fc1', 'fc2', 'fc3', 'fc4', 'fc5'],
        icons: ['', 'back-1.svg', 'folder-1.svg', 'widget-1.svg', 'dashboard-1.svg', 'widget-2.svg', 'widget-3.svg', 'widget-4.svg'],

        timeout: 60000,
        ver: version,
        emptyWidgetClass: 'MDX2JSON.EmptyPortlet'.toLowerCase()
    }
};
