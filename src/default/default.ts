/**
 *  Default page code.
 */
import { Slider, SliderTickRenderedEventArgs } from '@syncfusion/ej2-inputs';
import { NumericTextBox, ChangeEventArgs } from '@syncfusion/ej2-inputs';
import { RadioButton } from '@syncfusion/ej2-buttons';
import { closest, Internationalization, isNullOrUndefined as isNOU } from '@syncfusion/ej2-base';
import {
    AccumulationChart, AccumulationLegend, PieSeries, AccumulationTooltip,
    AccumulationDataLabel, IAxisLabelRenderEventArgs
} from '@syncfusion/ej2-charts';
import { Grid, DetailRow } from '@syncfusion/ej2-grids';
import {
    Chart, LineSeries, DateTime, Legend, Tooltip, IAccLoadedEventArgs, AccumulationTheme, IAccPointRenderEventArgs,
    StackingColumnSeries, Crosshair, DataLabel, ColumnSeries, IMouseEventArgs, Series
} from '@syncfusion/ej2-charts';
import { IPages, DataSketch } from '../index';

import { DatePicker } from '@syncfusion/ej2-calendars';

//creates a datepicker with decade view and navigate up to year view.
Chart.Inject(LineSeries, StackingColumnSeries, Crosshair, DataLabel, ColumnSeries, DateTime, Legend, Tooltip);
Grid.Inject(DetailRow);
AccumulationChart.Inject(AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel);

declare let window: IPages;
let pricipalObj2: Slider;
let loantenureObj: Slider;
let interestrateObj1: Slider;
let principal: NumericTextBox;
let interest: NumericTextBox;
let tenure: NumericTextBox;
let pie: AccumulationChart;
let yearValue: RadioButton;
let monthValue: RadioButton;
let yearTenure: boolean = true;
let chart: Chart;
let grid: Grid;
let emi: number;
let princ: number;
let totalPrincipalYear: number = 0;
let totalInterestYear: number = 0;
let tent: number;
let inter: number;
let dataUnits: [Object] = <[Object]>[];
let yearWiseData: [Object] = <[Object]>[];
let dateObj: Date = new Date();
let totalInterest: number = 0;
let totalAmount: number = 0;
let totalPrincipal: number = 0;
let endBalance: number;
let beginBalance: number;
let yearTotal: number = 0;
let monthNames: [string] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
let datepickerObj: DatePicker;
let intl: Internationalization = new Internationalization();
let legendSettings: Object = {
    textStyle: {
        color: '#FFFFFF',
        fontFamily: 'Raleway, sans-serif',
        fontWeight: '600',
        opacity: 0.62,
        size: '16px',
    }
};

function getCurrencyVal(value: number): string {
    return intl.formatNumber(value, { format: 'C0' });
}

function renderSliderControls(): void {
    pricipalObj2 = new Slider({
        min: 0,
        value: 300000,
        max: 500000,
        step: 10000,
        type: 'MinRange',
        ticks: { placement: 'After', largeStep: 100000, smallStep: 10000, showSmallTicks: false, format: 'c0' },
        change: () => {
            principal.setProperties({ value: pricipalObj2.value });
            setInitValues();
        },
        changed: () => {
            refreshUI();
        },
        renderedTicks: (args: SliderTickRenderedEventArgs) => {
            let li: NodeListOf<Element> = args.ticksWrapper.getElementsByClassName('e-large');
            for (let i: number = 0; i < li.length; ++i) {
                let ele: HTMLElement = (li[i].querySelectorAll('.e-tick-value')[0] as HTMLElement);
                let num: number = parseInt(ele.innerText.substring(1).replace(/,/g , ''), 10) / 1000;
                ele.innerText = num === 0 ?  ('' + num) : (num + 'K');
            }
        }
    });
    pricipalObj2.appendTo('#pricipal');
    loantenureObj = new Slider({
        min: 0,
        value: 15,
        max: 40,
        step: 1,
        type: 'MinRange',
        ticks: { placement: 'After', largeStep: 10, smallStep: 1, showSmallTicks: false },
        change: () => {
            tenure.setProperties({ value: loantenureObj.value });
            setInitValues();
        },
        changed: () => {
            refreshUI();
        }
    });
    loantenureObj.appendTo('#loantenure');
    interestrateObj1 = new Slider({
        min: 0,
        value: 5.5,
        max: 20,
        step: .25,
        type: 'MinRange',
        ticks: { placement: 'After', largeStep: 5, smallStep: 1, showSmallTicks: false },
        change: () => {
            interest.setProperties({ value: interestrateObj1.value });
            setInitValues();
        },
        changed: () => {
            refreshUI();
        }
    });
    interestrateObj1.appendTo('#interestrate');
}
function renderInputControls(): void {
    renderSliderControls();
    monthValue = new RadioButton({
        label: 'Month', name: 'tenure', value: 'month',
        change: () => {
            yearTenure = false;
            let currVal: number = (tenure.value * 12);
            tenure.setProperties({
                min: 12,
                max: 480,
                step: 12,
                value: currVal
            });
            loantenureObj.setProperties({
                min: 0,
                value: currVal,
                max: 480,
                step: 12,
                ticks: { placement: 'after', largeStep: 120, smallStep: 12, showSmallTicks: false }
            });
        }
    });
    monthValue.appendTo('#radio1');

    yearValue = new RadioButton({
        label: 'Year', name: 'tenure', value: 'year', checked: true,
        change: () => {
            yearTenure = true;
            let currVal: number = (tenure.value / 12);
            loantenureObj.setProperties({
                min: 0,
                value: currVal,
                max: 40,
                step: 1,
                ticks: { largeStep: 10, smallStep: 1, showSmallTicks: false }
            });
            tenure.setProperties({
                min: 1,
                max: 40,
                step: 1,
                value: currVal
            });
        }
    });
    yearValue.appendTo('#radio2');
    principal = new NumericTextBox({
        min: 1000,
        value: 300000,
        max: 5000000,
        step: 10000,
        format: 'c0',
        change: (args: ChangeEventArgs) => {
            if (args.isInteraction) {
                pricipalObj2.setProperties({ value: principal.value });
                refreshUI();
            }
        },
        width: '200px'
    });
    principal.appendTo('#principal_txt');
    interest = new NumericTextBox({
        min: 0,
        value: 5.5,
        format: '#.##\' %\'',
        max: 20,
        step: .25,
        change: (args: ChangeEventArgs) => {
            if (args.isInteraction) {
                interestrateObj1.setProperties({ value: interest.value });
                refreshUI();
            }
        },
        width: '165px'
    });
    interest.appendTo('#interest_txt');
    tenure = new NumericTextBox({
        min: 1,
        value: 15,
        max: 40,
        step: 1,
        format: '#.##',
        change: (args: ChangeEventArgs) => {
            if (args.isInteraction) {
                if (tenure.value) {
                    loantenureObj.setProperties({ value: tenure.value });
                }
                refreshUI();
            }
        },
        width: '150px'
    });
    tenure.appendTo('#loan_txt');
}

function renderVisalComponents(): void {
    pie = new AccumulationChart({
        series: [
            {
                dataSource: [
                    { 'x': 'Principal Amount', y: princ },
                    { 'x': 'Interest Amount', y: ((emi * tent) - princ) }
                ],
                radius: '80%', xName: 'x',
                animation: { enable: true },
                yName: 'y',
                startAngle: 290,
                endAngle: 290, innerRadius: '60%',
                explode: true, explodeOffset: '10%', explodeIndex: 3,
            }
        ],
        pointRender: (args: IAccPointRenderEventArgs) => {
          if (args.point.index) {
            args.border.width = 7;
            args.fill = 'url(#interest_svg)';
          } else {
            args.border.width = 7;
            args.border.color = '#162036';
            args.fill = 'url(#principal_svg)';
          }
        },
        enableSmartLabels: true,
        legendSettings: {
            visible: false,
        },
        height: '365px',
        width: '100%',
        tooltip: { enable: false },
        load: (args: IAccLoadedEventArgs) => {
            let selectedTheme: string = location.hash.split('/')[1];
            selectedTheme = selectedTheme ? selectedTheme : 'Material';
            args.accumulation.theme = <AccumulationTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1));
        },
        border: '#27304c',
        background: '#27304c'
    });
    pie.appendTo('#payment_pieChart');
    updateChart();
    chart.appendTo('#paymentGraph');
    grid = new Grid({
        dataSource: [],
        columns: [
            { field: 'year', headerText: 'Year', minWidth: '80px', textAlign: 'Center', template: '#columntemplate' },
            {
                field: 'yearTotal', format: 'C0',
                hideAtMedia: '(min-width: 480px)', headerText: 'Payment', minWidth: '120px', textAlign: 'Center'
            },
            { field: 'yearPrincipal', format: 'C0', headerText: 'Principal Paid', minWidth: '120px', textAlign: 'Center' },
            { field: 'yearInterest', format: 'C0', headerText: 'Interest Paid', minWidth: '120px', textAlign: 'Center' },
            { field: 'endingBalance', format: 'C0', headerText: 'Balance', minWidth: '80px', textAlign: 'Center' }
        ],
        width: '100%',
        childGrid: {

        },
    });
    grid.appendTo('#scheduleGrid');
    (grid.element as HTMLElement).addEventListener('click', (args: MouseEvent) => {
        let target: Element = args.target as Element;
        if (target.classList.contains('e-row-toggle') || target.parentElement.querySelector('.e-row-toggle')) {
            target = target.parentElement.querySelector('.e-row-toggle') ? target.parentElement.querySelector('.e-row-toggle') : target;
            if (target.classList.contains('e-icon-gdownarrow')) {
                target.classList.remove('e-icon-gdownarrow');
                target.classList.add('e-icon-grightarrow');
                grid.detailRowModule.collapse(parseInt((closest(target, 'tr') as HTMLElement).getAttribute('aria-rowindex'), 10));
            } else {
                target.classList.remove('e-icon-grightarrow');
                target.classList.add('e-icon-gdownarrow');
                grid.detailRowModule.expand(parseInt((closest(target, 'tr') as HTMLElement).getAttribute('aria-rowindex'), 10));
            }
        }
    });
}
/* tslint:disable */
function childCreated(args: any): void {
    this.getHeaderContent().style.display = 'none';
    this.element.style.display = 'none';
}
function childDataBound(args: any): void {
    this.element.style.display = '';
}
/* tslint:enable */

function updateChart(): void {
    chart = new Chart({
        primaryXAxis: {
            title: 'Years',
            valueType: 'DateTime',
            labelFormat: 'y',
            intervalType: 'Years',
            majorGridLines: { width: 0 },
            minorGridLines: { width: 0 },
            majorTickLines: { width: 0 },
            minorTickLines: { width: 0 },
            lineStyle: { width: 1, dashArray: '2', color: 'rgba(255,255,255,0.2)' },
            labelStyle: {
                color: '#989CA9',
                fontFamily: 'Roboto',
                fontWeight: '400',
                size: '12px',
            },
            titleStyle: {
                color: '#FFFFFF',
                fontFamily: 'Raleway, sans-serif',
                fontWeight: '600',
                opacity: 0.62,
                size: '16px',
            }
        },
        primaryYAxis: {
            title: 'Balance',
            labelFormat: 'c0',
            rangePadding: 'None',
            lineStyle: { width: 0 },
            majorTickLines: { width: 0 },
            majorGridLines: { width: 1, dashArray: '2', color: 'rgba(255,255,255,0.2)' },
            minorGridLines: { width: 0 },
            minorTickLines: { width: 0 },
            labelStyle: {
                color: '#989CA9',
                fontFamily: 'Roboto',
                fontWeight: '400',
                size: '16px',
            },
            titleStyle: {
                color: '#FFFFFF',
                fontFamily: 'Raleway, sans-serif',
                fontWeight: '600',
                opacity: 0.62,
                size: '16px',
            }
        },
        axes: [{
            majorGridLines: { width: 0 },
            minorGridLines: { width: 0 },
            majorTickLines: { width: 0 },
            minorTickLines: { width: 0 },
            rowIndex: 0, opposedPosition: true,
            lineStyle: { width: 0 },
            name: 'yAxis',
            title: 'Payment',
            labelFormat: 'c0',
            labelStyle: {
                color: '#989CA9',
                fontFamily: 'Roboto',
                fontWeight: '400',
                size: '16px',
            },
            titleStyle: {
                color: '#FFFFFF',
                fontFamily: 'Raleway, sans-serif',
                fontWeight: '600',
                opacity: 0.62,
                size: '16px',
            }
        }],
        chartMouseUp: (args: IMouseEventArgs) => {
            onChartMouseUp(args);
        },
        tooltip: {
            enable: true, shared: true,
            format: '${series.name} : ${point.y}',
            header: '<b>${point.x}<b>',
            fill: '#FFFFFF',
            opacity: 1,
            textStyle: {
                color: '#555555',
                fontFamily: 'Roboto',
                size: '12px',
                fontWeight: '400',
            },
        },
        chartArea: {
            border: {
                width: 0
            }
        },
        height: '500px',
        palettes: ['#FB6589', '#3AC8DC', '#FFFFFF'],
        legendSettings: legendSettings, useGroupingSeparator: true,
        border: '#27304c', background: '#27304c',
        axisLabelRender: axisLabelRender
    });
}
function onChartMouseUp(args: IMouseEventArgs): void {
    if (args.target.indexOf('_chart_legend_') > -1 && (args.target.indexOf('shape') > -1 || args.target.indexOf('text') > -1)) {
        let id: string[] = [args.target];
        id = (args.target.indexOf('shape') > -1) ? id[0].split('chart_legend_shape_') : id[0].split('chart_legend_text_');
        let index: number = parseInt(id[1], 10);
        let series: Series = chart.visibleSeries[index];
        let yName: string = series.yAxisName;
        let ySName: string;
        let visibility: boolean = false;
        if (series.visible) {
            for (let i: number = 0, len: number = chart.series.length; i < len; i++) {
                ySName = chart.series[i].yAxisName;
                if (len === 1 || (chart.series[i].visible &&
                    (<Series>chart.series[i]).index !== series.index && yName === ySName)) {
                    visibility = true;
                }
            }
            series.yAxis.visible = visibility;
        } else {
            series.yAxis.visible = true;
        }
    }
}
function axisLabelRender(args: IAxisLabelRenderEventArgs): void {
    if (window.innerWidth < 576) {
        if (args.axis.name === 'primaryYAxis' || args.axis.name === 'yAxis') {
            let value: number = Number(args.value) / 1000;
            args.text = value === 0 ? String(value) : (String(value) + 'K');
        }
    }
}
function refreshUI1(): void {
    setInitValues();
    let interestPercent: number = parseFloat((Math.round((emi * tent) - princ) / Math.round((emi * tent)) * 100).toFixed(2));
    pie.setProperties({
        series: [
            {
                dataSource: [
                    {
                        'x': 'Principal Amount',
                        y: princ,
                        text: parseFloat(((princ) / Math.round((emi * tent)) * 100).toFixed(2)) + '%'
                    },
                    {
                        'x': 'Interest Amount',
                        y: (tent ? Math.round((emi * tent) - princ) : 0),
                        text: interestPercent ? interestPercent + '%' : ' '
                    }
                ],
                radius: '80%', xName: 'x',
                animation: { enable: true },
                yName: 'y',
                startAngle: 290,
                endAngle: 290, innerRadius: '60%',
                explode: true, explodeOffset: '10%', explodeIndex: 3
            }
        ],
    });
    pie.refresh();

}
function refreshUI(): void {
    refreshUI1();
    calRangeValues();
    renderControls();
    chart.refresh();
    grid.refresh();
}

function setInitValues(): void {
    emi = calculateEMI();
    princ = principal.value;
    tent = yearTenure ? (tenure.value * 12) : tenure.value;
    dataUnits = <[Object]>[];
    yearWiseData = <[Object]>[];
    dateObj = new Date(datepickerObj.value.getTime());
    totalInterest = 0;
    totalAmount = 0;
    totalPrincipal = 0;
    totalPrincipalYear = 0;
    totalInterestYear = 0;
    document.getElementById('loan_emi').innerHTML = getCurrencyVal(tent ? Math.round(emi) : 0);
    document.getElementById('loan_interest').innerHTML = getCurrencyVal(tent ? Math.round((emi * tent) - princ) : 0);
    document.getElementById('loan_total_payment').innerHTML = getCurrencyVal(tent ? Math.round((emi * tent)) : 0);
    document.getElementById('loan_principal').innerHTML = getCurrencyVal(princ);
}

function calRangeValues(): void {
    for (let i: number = 0; i < tent; i++) {
        inter = getInterest ? (princ * getInterest()) : princ;
        totalInterest += inter;
        totalAmount += emi;
        totalPrincipal += parseFloat((emi - inter).toFixed(2));
        endBalance = princ - (emi - inter);
        yearTotal += emi;
        totalPrincipalYear += parseFloat((emi - inter).toFixed(2));
        totalInterestYear += inter;
        dataUnits.push({
            month: monthNames[dateObj.getMonth()],
            index: (i + 1),
            totalInterest: Math.round(totalInterest),
            totalAmount: totalAmount,
            emi: Math.round(emi),
            year: dateObj.getFullYear(),
            beginningBalance: Math.round(princ),
            interest: Math.round(inter),
            pricipalPaid: Math.round((emi - inter)),
            endingBalance: Math.round(endBalance)
        });
        if (i === 0 || dateObj.getMonth() === 0) {
            beginBalance = princ;
        }
        if (dateObj.getMonth() === 11 || (i === tent - 1)) {
            yearWiseData.push({
                beginningBalance: Math.round(beginBalance),
                totalInterest: Math.round(totalInterest),
                totalPrincipal: Math.round(totalPrincipal),
                totalAmount: Math.round(totalAmount),
                yearTotal: Math.round(yearTotal),
                endingBalance: Math.round(endBalance),
                yearN: new Date(dateObj.getFullYear(), 0, 1),
                year: dateObj.getFullYear(),
                yearPrincipal: totalPrincipalYear,
                yearInterest: totalInterestYear
            });
            yearTotal = 0;
            totalPrincipalYear = 0;
            totalInterestYear = 0;
        }
        princ = endBalance;
        if (i < tent - 1) {
            dateObj.setMonth(dateObj.getMonth() + 1);
        }
    }
}

function renderControls(): void {
    grid.setProperties({
        dataSource: yearWiseData, childGrid: {
            created: childCreated,
            dataBound: childDataBound,
            queryString: 'year',
            columns: [
                { field: 'month', headerText: 'Month', textAlign: 'center', minWidth: '80px' },
                {
                    field: 'emi', format: 'C0',
                    hideAtMedia: '(min-width: 480px)', headerText: 'Payment', minWidth: '80px', textAlign: 'center'
                },
                { field: 'pricipalPaid', format: 'C0', headerText: 'Principal Paid', minWidth: '80px', textAlign: 'center' },
                { field: 'interest', format: 'C0', headerText: 'Interest Paid', minWidth: '80px', textAlign: 'center' },
                { field: 'endingBalance', format: 'C0', headerText: 'Balance', minWidth: '80px', textAlign: 'center' }
            ],
            dataSource: dataUnits
        }
    });
    chart.setProperties({
        //Initializing Chart Series
        enableSideBySidePlacement: false,
        series: [
            // {
            //     type: 'Column',
            //     columnWidth: 0.7,
            //     dataSource: yearWiseData,
            //     xName: 'yearN', width: 2, marker: {
            //         visible: true,
            //         width: 10,
            //         height: 10,
            //     },
            //     yName: 'yearTotal', name: 'Total Amount Paid', yAxisName: 'yAxis',
            // },
            {
                type: 'StackingColumn',
                columnWidth: 0.425,
                dataSource: yearWiseData,
                xName: 'yearN', width: 2, marker: {
                    visible: true,
                    width: 10,
                    height: 10,
                },
                yName: 'yearPrincipal', name: 'Principal Paid', yAxisName: 'yAxis'
            },
            {
                type: 'StackingColumn',
                columnWidth: 0.425,
                dataSource: yearWiseData,
                xName: 'yearN', width: 2, marker: {
                    visible: true,
                    width: 10,
                    height: 10,
                },
                yName: 'yearInterest', name: 'Interest Paid', yAxisName: 'yAxis'
            },
            {
                type: 'Line',
                dataSource: yearWiseData,
                xName: 'yearN', width: 2, marker: {
                    visible: true,
                    width: 10,
                    height: 10,
                    fill: '#60448D',
                },
                yName: 'endingBalance', name: 'Balance',
            },
        ]
    });
}

function getInterest(): number {
    return interest.value ? parseFloat('' + interest.value / 12 / 100) : 0;
}
function calculateEMI(): number {
    let interestValue: number = getInterest();
    let tent: number = yearTenure ? (tenure.value * 12) : tenure.value;
    if (interestValue) {
        return principal.value * interestValue *
            (Math.pow((1 + interestValue), tent)) / ((Math.pow((1 + interestValue), tent)) - 1);

    }
    return principal.value / tent;
}
function dateChanged(): void {
    if (isNOU(datepickerObj.value)) {
        datepickerObj.setProperties({ value: new Date() });
    } else {
        refreshUI();
    }
}
window.default = () => {
    renderInputControls();
    datepickerObj = new DatePicker({
        start: 'Year',
        //sets the depth
        depth: 'Year',
        // sets the placeholder
        placeholder: 'Enter date',
        format: 'MMM yyy',
        value: new Date(),
        change: dateChanged,
        showClearButton: false,
        width: '250px',
        strictMode: true,
        showTodayButton: false
    });
    datepickerObj.appendTo('#monthStarter');


    emi = calculateEMI();
    princ = principal.value;
    tent = yearTenure ? (tenure.value * 12) : tenure.value;
    renderVisalComponents();
    dataUnits = <[Object]>[];
    yearWiseData = <[Object]>[];
    dateObj = new Date();
    totalInterest = 0;
    totalAmount = 0;
    totalPrincipal = 0;
    refreshUI();
    window.destroy = () => {
        destroyComponents();
        window.destroy = null;
    };
};

function destroyComponents(): void {
    pricipalObj2.destroy();
    loantenureObj.destroy();
    interestrateObj1.destroy();
    principal.destroy();
    interest.destroy();
    tenure.destroy();
    pie.destroy();
    chart.destroy();
    grid.destroy();
    yearValue.destroy();
    monthValue.destroy();
    datepickerObj.destroy();
}

window.getDataState = () => {
    let data: DataSketch = <DataSketch>{};
    data.dataUnits = dataUnits;
    data.yearWiseData = yearWiseData;
    return data;
};
