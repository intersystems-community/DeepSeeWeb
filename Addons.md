#DSW Addons

##1. Intro
DeepSeeWeb supports user addons, that can be created as TypeScript files and compiled to JS.
This files are to be placed in `/addons` folder on a website in root of DSW. The file name should be equal to portlet name that used for custom widget.

##2. Creating addon
To create addon, follow next steps:
1. Clone DSW repo https://github.com/intersystems-community/DeepSeeWeb
2. Setup dev environment to work with project, run `npm install` 
3. There is addon example in `/src/addons/simple-addon.component.ts`
4. Make copy of this file as starting point for addon creation, eg. `/src/addons/my-addon.component.ts`.
All files placed in `/src/addons` folder are treated as addons and are to be compiled in separate JS files.
5. Modify file `/src/addons/my-addon.component.ts` to implement features you need
6. Run command `npm run build:addons` to build project and compile all addons placed in `/src/addons` folder
7. After build, check folder `dist`. There are files named `addon-0`, `addon-1`, etc. This is compiled addons, due to angular compilator files have such names, so you need identify which one is you addon.
This can be simply made by opening file and checking class name inside:
```javascript
function(t,e,o){"use strict";o.r(e),o.d(e,"MyAddonComponent"
```
8. After finding file with your addon, rename a file to name of custom portlet, that would be used for this widget type. 
Copy renamed file into `/addons` folder of your DSW root on a website

 
