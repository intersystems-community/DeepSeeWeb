import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilService {

    constructor() {
    }

    // merge(o1: any, o2: any) {
    //     return ({
    //         ...JSON.parse(JSON.stringify(o1)),
    //         ...JSON.parse(JSON.stringify(o2))
    //     });
    // }

    removeExt(fileName: string) {
        const a = fileName.split('.');
        if (a.length === 1) {
            return fileName;
        }
        a.pop();
        return a.join('.');
    }

    replaceFilename(oldName: string, newName: string) {
        const a = oldName.split('/');
        a[a.length - 1] = newName;
        return a.join('/');
    }

    isEmbedded() {
        const params = window.location.hash.replace('?', '').replace('#/', '').split('&');
        for (let i = 0; i < params.length; i++) {
            if (params[i].indexOf('widget=') !== -1) {
                return true;
            }
        }
        return params.indexOf('embed=1') !== -1;
    }

    /**
     * Merger all object properties to another
     * @param {object} obj1 Object to merge properties in
     * @param {object} obj2 Object to read properties from
     * @returns {object} obj1 contains all properties from obj2
     */
    mergeRecursive(obj1: any, obj2: any) {
        // If object is array, construct new array and make clone
        if (obj2.constructor === Array) {
            obj1 = [];
            for (let i = 0; i < obj2.length; i++) {
                if (typeof obj2[i] === 'object') {
                    obj1[i] = this.mergeRecursive({}, obj2[i]);
                } else {
                    obj1[i] = obj2[i];
                }
            }
            return obj1;
        }

        for (const p in obj2) {
            if (!obj2.hasOwnProperty(p)) {
                continue;
            }
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor === Object) {
                    obj1[p] = this.mergeRecursive(obj1[p] || {}, obj2[p]);
                }
                if (obj2[p].constructor === Object) {
                    obj1[p] = this.mergeRecursive(obj1[p] || [], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }
}
