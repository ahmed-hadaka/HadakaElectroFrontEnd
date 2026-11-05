import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environmentDev} from '../../../../environments/environment.dev';

export interface SalesReportDataDTO {
  identifier: string;
  itemCounts: number;
  grossSales: number;
  netSales: number;
}

export interface ReportChartPayload {
  totalGrossSales: number;
  totalNetSales: number;
  avgGrossSales: number;
  totalItems: number;
  chartData: SalesReportDataDTO[];
}

@Injectable({ providedIn: 'root' })
export class SalesReportService {
  private reportSettingApiBaseUrl = environmentDev.backendInternalBaseUrl+'/reports';

  constructor(private http: HttpClient) {}

  private getParams(startDate: Date, endDate: Date): HttpParams {

    const toLocalIsoString = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return new HttpParams()
      .set('startDate', toLocalIsoString(startDate))
      .set('endDate', toLocalIsoString(endDate));
  }

  getSalesByDate(start: Date, end: Date): Observable<ReportChartPayload> {
    return this.http.get<ReportChartPayload>(`${this.reportSettingApiBaseUrl}/sales-by-date`, { params: this.getParams(start, end) });
  }

  getSalesByCategory(start: Date, end: Date): Observable<ReportChartPayload> {
    return this.http.get<ReportChartPayload>(`${this.reportSettingApiBaseUrl}/sales-by-category`, { params: this.getParams(start, end) });
  }

  getSalesByProduct(start: Date, end: Date): Observable<ReportChartPayload> {
    return this.http.get<ReportChartPayload>(`${this.reportSettingApiBaseUrl}/sales-by-product`, { params: this.getParams(start, end) });
  }
}
