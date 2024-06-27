import pkg from './../../package.json';

interface IDSWConfig {
  addons: string[];
  mobile: boolean;
  desktop: boolean;
  const: any;
}

export const dsw: IDSWConfig = {
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
        fontColors: ['fc0', 'fc1', 'fc2', 'fc3', 'fc4', 'fc5'],
        icons: ['', 'ico-widget-back', 'ico-widget-folder', 'ico-widget-1', 'ico-widget-dashboard', 'ico-widget-2', 'ico-widget-3', 'ico-widget-4'],
        timeout: 60000,
        ver: pkg.version,
        emptyWidgetClass: 'MDX2JSON.EmptyPortlet'.toLowerCase()
    }
};
