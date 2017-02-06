# Custom themes

## Information
DeepSeeWeb supports user defined themes. Each theme represented by *.scss file that should be placed in "/css/sass/themes" folder.
Simplest theme can be found in [black.scss](css/themes/sass/black.scss):
```SCSS
@import "../base/variables";

// Override variables
$inverted: 1;
$themeColor: black;
$iconColor: white;
$fontColor: white;
$widgetHeaderFont: black;

@import "../base/theme";

// Custom styles here
// ...
```
## Integrating themes
At present DSW theme list is predefined in source code in [app.js](src/app.js):
```javascript
 themes: [
            {text: 'Default', file: ''},
            {text: 'Contrast', file: 'themes/contrast.css'},
            {text: 'Metro', file: 'themes/metro.min.css'},
            {text: 'Black', file: 'themes/black.css'}
        ]
```
To add custom theme name, please insert desired line there. In future DSW will support dynamic theme list loading from folder.

## Supported variables
Simple theme tuning can be done via changing scss variables. All available variable can be found in [variables.scss](css/sass/base/variables.scss)
```SCSS
// Change main theme color and font
$themeColor: black;
$fontColor: white;
```

## Tiles 
You can define tile background and font color by changing styles `.cl1-.cl9` and `.fc1-.fc5`
To change tile background color, use `.cl` class:
```css
/* Change first color style of tile */ 
.cl1 {
    background-color: red;    
}
```
To change predefined font color, use `.fc` class:
```css
/* Change first font color style of tile */ 
.fc1 {
    color: white;
    fill: white;
}
```
*Note: don't forget to specify `fill` on tile class, because it used by svg icons to display icon with same color as text color.*

## Highcharts
Also user able to change predefined highcarts colors. This can be achieved by manipulating `.hc1-.hc10` classes.
To change predefined highcarts series one color, use `.hc` class:
```css
/* Change first series color */ 
.hc1 {
    background-color: yellow;    
}
```

## Compile theme
Simply run `sass-themes` or `default` gulp task to receive compiled css from scss.
For development purposes `sass:watch` task is exists. Run it if you want real-time theme compiling on any change.