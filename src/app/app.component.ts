import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from "rxjs/operators";
import * as math from 'mathjs';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any; // ApexTooltip;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Graficador de Eule, Euler Mejorado y Runge-Kutta';
  @ViewChild("chartObj") chart: ChartComponent;
  @ViewChild("sliderElement") sliderElement: ElementRef;
  public chartOptions: Partial<ChartOptions>;
  public formGroup: FormGroup;
  public ejemplosDeFuncion: string = "Ejemplos:\nx + y\nx - y\nx * y\nx / y\nx ^ y\nsin(x)\ncos(y)\ntan(x)";
  public slider = {
    id: 1,
    answer: 0,
    step: 1,
    minValue: 1,
    maxValue: 10
  };

  constructor() {
    this.formGroup = new FormGroup({
      funcion: new FormControl('sin(x)*cos(y)', Validators.required),
      yInicial: new FormControl('0', Validators.required),
      xInicial: new FormControl('0', Validators.required),
      xFinal: new FormControl('3', Validators.required),
      intervalos: new FormControl('3', Validators.required)
    });
    this.initalizeCharOptions();
  }

  private initalizeCharOptions(): void {
    this.chartOptions = {
      series: [
        {
          name: "Euler",
          data: []
        },
        {
          name: "Euler mejorado",
          data: []
        },
        {
          name: "Runge-Kutta",
          data: []
        }
      ],
      chart: {
        height: 700,
        type: "line"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 5,
        curve: "straight"
      },
      legend: {
        tooltipHoverFormatter: function(val, opts) {
          return (
            val + " - <strong>" +
            "(x: " + opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].x + 
            ", y: " + opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].y + ")</strong>"
          )
        }
      },
      markers: {
        size: 4,
        hover: {
          sizeOffset: 3
        }
      },
      xaxis: {
        type: 'numeric',
        labels: {
          formatter: function(value, timestamp, opts) {
            return parseFloat(value).toFixed(2)
          }
        }
      },
      grid: {
        borderColor: "#f1f1f1"
      }
    };
  }

  private addNewValues(serieName: string, values: {x: any, y: any}[]): void {
    values.forEach(value => {
      value.x = parseFloat(value.x.toFixed(2));
      value.y = parseFloat(value.y.toFixed(2));
    });
    this.chartOptions.series.forEach(serie => {
      if (serie.name == serieName){
          serie.data = values;
      }
    });
  }

  private euler(funcion: string, xFinal: any, valorInicialDeX: any, valorInicialDeY: any, h: any): void  {
    let valores = [{ x: valorInicialDeX, y: valorInicialDeY }];
    while (valorInicialDeX < xFinal) {
        valorInicialDeY = valorInicialDeY + (h * this.resolverFuncion(valorInicialDeY, valorInicialDeX, funcion));
        valorInicialDeX = valorInicialDeX + h;
        valores.push({x: valorInicialDeX, y: valorInicialDeY});
    }
    this.addNewValues("Euler", valores);
  }

  private eulerMejorado(funcion: string, xFinal: any, valorInicialDeX: any, valorInicialDeY: any, h: any): void  {
    let valores = [{ x: valorInicialDeX, y: valorInicialDeY }];
    let predictor: any;
    while (valorInicialDeX < xFinal) {
        predictor = valorInicialDeY + (h * this.resolverFuncion(valorInicialDeY, valorInicialDeX, funcion));
        valorInicialDeY = valorInicialDeY + (h / 2) * (this.resolverFuncion(valorInicialDeY, valorInicialDeX, funcion) + 
          this.resolverFuncion(predictor, valorInicialDeX + h, funcion));
        valorInicialDeX = valorInicialDeX + h;
        valores.push({x: valorInicialDeX, y: valorInicialDeY});
    }
    this.addNewValues("Euler mejorado", valores);
  }

  private rungeKutta(funcion: string, xFinal: any, valorInicialDeX: any, valorInicialDeY: any, h: any): void {
    let valores = [{ x: valorInicialDeX, y: valorInicialDeY }];
    while (valorInicialDeX < xFinal) {
        let m1 = this.resolverFuncion(valorInicialDeY, valorInicialDeX, funcion);
        let m2 = this.resolverFuncion((valorInicialDeY + (m1 * h / 2)), (valorInicialDeX + (h / 2)), funcion);
        let m3 = this.resolverFuncion((valorInicialDeY + (m2 * h / 2)), (valorInicialDeX + (h / 2)), funcion);
        let m4 = this.resolverFuncion((valorInicialDeY + (m3 * h)), (valorInicialDeX + h),funcion);
        let m = ((m1 + (2 * m2) + (2 * m3) + m4) / 6);
        valorInicialDeY = valorInicialDeY + m * h;
        valorInicialDeX = valorInicialDeX + h;
        valores.push({x: valorInicialDeX, y: valorInicialDeY});
    }
    this.addNewValues("Runge-Kutta", valores);
  }

  private resolverFuncion(y: string, x: string, funcion: string): any {
    let funcionTemp = funcion.replace(/\x/gi, x).replace(/\y/gi, y);
    return math.evaluate(funcionTemp);
  }

  public ngAfterViewInit(): void {
    this.calcular(false);
    this.yInicial.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      this.calcular(true);
    });
    this.xInicial.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      this.calcular(true);
    });
    this.xFinal.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      this.calcular(true);
    });
    this.intervalos.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      this.calcular(true);
    });
  }

  public calcular(update: boolean): void {
    if (this.formGroup.valid) {
      let funcion = this.formGroup.controls["funcion"].value;
      let yInicial = parseFloat(this.formGroup.controls["yInicial"].value);
      let xInicial = parseFloat(this.formGroup.controls["xInicial"].value);
      let xFinal = parseFloat(this.formGroup.controls["xFinal"].value);
      let intervalos = parseFloat(this.formGroup.controls["intervalos"].value);
      if (!Number.isNaN(yInicial) && !Number.isNaN(xInicial) && !Number.isNaN(xFinal) && !Number.isNaN(intervalos) && intervalos > 0) {
        let valorH = (xFinal - xInicial) / intervalos;
        this.euler(funcion, xFinal, xInicial, yInicial, valorH);
        this.eulerMejorado(funcion, xFinal, xInicial, yInicial, valorH);
        this.rungeKutta(funcion, xFinal, xInicial, yInicial, valorH);
        if (update) {
          this.chart.updateOptions(this.chartOptions);
        }
      }
    }
  }
  
  get funcion() { return this.formGroup.get('funcion'); }
  get yInicial() { return this.formGroup.get('yInicial'); }
  get xInicial() { return this.formGroup.get('xInicial'); }
  get xFinal() { return this.formGroup.get('xFinal'); }
  get intervalos() { return this.formGroup.get('intervalos'); }
}
