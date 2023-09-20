/**
 *  Index page handler
 */
import * as hasher from 'hasher';
import crossroads from 'crossroads';
import { Ajax } from '@syncfusion/ej2-base';
import '../styles/styles.scss';
import '../styles/index.scss';

let pages: Object[] = [
    { root: 'home', page: 'homePage' },
    { root: 'about', page: 'aboutPage' },
];

export interface IPages extends Window {
    // All route pages declared here.
    home: () => void;
    about: () => void;
}

declare let window: IPages;

routeDefault(); // Initiate default routing function

function routeDefault(): void {
    crossroads.addRoute('', () => {
        window.location.href = '#/home'; // At initial page load href value updated as `home` for route.
    });
}

crossroads.addRoute('/{val}', () => {
    let pageObj: { [key: string]: Object } = getPageObj(window.location.hash.replace('#/', ''));
    let ajaxHTML: Ajax = new Ajax('./' + pageObj.page + '.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        if (document.getElementById('content-area')) {
            (document.getElementById('content-area') as HTMLElement).innerHTML = value.toString();
        }
        if (window.location.hash.replace('#/', '') === 'home') {
            window.home();
        } else {
            window.about();
        }
    })
    .catch((error: any) => {
        // Handle any potential Promise rejections
        console.error('An error occurred:', error);
      });
});

function getPageObj(page: string): { [key: string]: Object } {
    let pageObj: { [key: string]: Object } = {};
    pages.forEach((item: any) => {
        if (item.root === page) {
            pageObj = item;
        }
    });
    return pageObj;
}

// Window location hash handlers
hasher.initialized.add((hashValue: string) => {
    crossroads.parse(hashValue); // Page initial loading state this function calls '' route handler.
});

hasher.changed.add((hashValue: string) => {
    crossroads.parse(hashValue); // When location hash changed this function calls `home` route handler.
});
hasher.init(); // Initiate the hasher function

export interface IPages extends Window {
    default: () => void;
    destroy: () => void;
    about: () => void;
    getDataState: () => DataSketch;
}
export interface DataSketch {
    dataUnits: [object];
    yearWiseData: [object];
}