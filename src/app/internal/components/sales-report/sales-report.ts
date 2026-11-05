import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SalesReportService, ReportChartPayload } from '../../services/SalesReportService/SalesReportService';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.html',
  imports: [
    CurrencyPipe,
    CommonModule,
    GoogleChartsModule
  ],
  styleUrls: ['./sales-report.css']
})
export class SalesReportComponent implements OnInit {
  activeTab: 'DATE' | 'CATEGORY' | 'PRODUCT' = 'DATE';
  activeDateRange: string = '7days';

  startDate: Date = new Date();
  endDate: Date = new Date();

  summary: ReportChartPayload = {
    totalGrossSales: 0, totalNetSales: 0, avgGrossSales: 0, totalItems: 0, chartData: []
  };

  chartType = ChartType.ColumnChart;
  chartData: any[] = [];
  chartColumns: string[] = [];
  chartOptions: any = {};

  constructor(
    private reportService: SalesReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setDateRange('7days');
  }

  setDateRange(range: string) {
    this.activeDateRange = range;
    this.endDate = new Date();
    this.startDate = new Date();

    if (range === '7days') this.startDate.setDate(this.endDate.getDate() - 7);
    if (range === '28days') this.startDate.setDate(this.endDate.getDate() - 28);
    if (range === '6months') this.startDate.setMonth(this.endDate.getMonth() - 6);
    if (range === '1year') this.startDate.setFullYear(this.endDate.getFullYear() - 1);

    this.startDate.setHours(0, 0, 0, 0);
    this.loadReport();
  }

  switchTab(tab: 'DATE' | 'CATEGORY' | 'PRODUCT') {
    this.activeTab = tab;
    // Clear old chart/table data immediately so previous tab's data never flashes
    this.chartData = [];
    this.chartColumns = [];
    this.summary = { totalGrossSales: 0, totalNetSales: 0, avgGrossSales: 0, totalItems: 0, chartData: [] };
    this.loadReport();
  }

  loadReport() {
    if (this.activeTab === 'DATE') {
      this.reportService.getSalesByDate(this.startDate, this.endDate).subscribe(data => {
        this.setupBarChart(data);
        this.cdr.detectChanges();
      });
    } else if (this.activeTab === 'CATEGORY') {
      this.reportService.getSalesByCategory(this.startDate, this.endDate).subscribe(data => {
        this.setupPieChart(data);
        this.cdr.detectChanges();
      });
    } else if (this.activeTab === 'PRODUCT') {
      this.reportService.getSalesByProduct(this.startDate, this.endDate).subscribe(data => {
        this.setupTable(data);
        this.cdr.detectChanges();
      });
    }
  }

  private setupBarChart(data: ReportChartPayload) {
    this.summary = data;
    this.chartType = ChartType.ColumnChart;
    this.chartColumns = ['Date', 'Gross Sales', 'Net Sales', 'Orders'];
    this.chartData = data.chartData.map(row => [row.identifier, row.grossSales, row.netSales, row.itemCounts]);
    this.chartOptions = {
      vAxes: { 0: { format: 'currency' }, 1: { format: '#' } },
      series: { 0: { targetAxisIndex: 0 }, 1: { targetAxisIndex: 0 }, 2: { targetAxisIndex: 1 } },
      height: 400
    };
  }

  private setupPieChart(data: ReportChartPayload) {
    this.summary = data;
    this.chartType = ChartType.PieChart;
    this.chartColumns = ['Category', 'Gross Sales'];
    this.chartData = data.chartData.map(row => [row.identifier, row.grossSales]);
    this.chartOptions = { height: 400, pieHole: 0.4 };
  }

  private setupTable(data: ReportChartPayload) {
    this.summary = data;
  }
}
