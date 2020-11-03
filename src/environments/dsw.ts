import { version } from '../../package.json';

export const dsw = {
    // TODO: add type for addons
    addons: [],
    mobile: false, // TODO: add to init = screen.availWidth <= 600;
    desktop: true,
    const: {
        themes: [
            {text: 'Default', file: ''},
            {text: 'Contrast', file: 'themes/contrast.css'}
            // {text: 'Metro', file: 'themes/metro.css'},
            // {text: 'Black', file: 'themes/black.css'}
        ],
        bgColorClasses: ['', 'cl1', 'cl2', 'cl3', 'cl4', 'cl5', 'cl6', 'cl7', 'cl8', 'cl9'],
        fontColors: ['fc1', 'fc2', 'fc3', 'fc4', 'fc5'],
        icons: ['', '\uf0e4', '\uf114', '\uf080', '\uf1fe', '\uf200', '\uf201',
            '\uf153', '\uf155', '\uf158', '\uf0c5', '\uf03a', '\uf0ce', '\uf0d1',
            '\uf007', '\uf183', '\uf0c0', '\uf0b0', '\uf1c0', '\uf1b2', '\uf1b3',
            '\uf02d', '\uf073', '\uf0ac', '\uf005', '\uf071', '\uf05a',
            '\uf104'],
        timeout: 60000,
        ver: version,
        emptyWidgetClass: 'MDX2JSON.EmptyPortlet'.toLowerCase()
    }
};
