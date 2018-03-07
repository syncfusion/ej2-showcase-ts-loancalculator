/**
 *  Loan Calculator Application.
 */
import { addRoute, parse } from 'crossroads';
import { Ajax } from '@syncfusion/ej2-base';
import * as hasher from 'hasher';

declare let window: IPages;
routeDefault();
addRoute('/about', () => {
    let ajaxHTML: Ajax = new Ajax('src/about/about.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        document.getElementById('content').innerHTML = value.toString();
        if (window.destroy) {
            window.destroy();
        }
    });
});
addRoute('/default', () => {
    let ajaxHTML: Ajax = new Ajax('src/default/default.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        document.getElementById('content').innerHTML = value.toString();
        window.default();
    });
});
hasher.initialized.add((h: string) => {
    parse(h);
});
hasher.changed.add((h: string) => {
    parse(h);
});
hasher.init();
function routeDefault(): void {
    addRoute('', () => {
        window.location.href = '#/default';
    });
}
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