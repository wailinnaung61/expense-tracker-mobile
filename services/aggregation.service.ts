import api from "@/lib/api";
import { AggregationData, CategoryAggregation } from "@/types/api.types";

export const aggregationService = {
  getDaily: (date: string): Promise<AggregationData> =>
    api.get(`/aggregation/daily/${date}`).then((r) => r.data),

  getDailyRange: (
    startDate: string,
    endDate: string,
  ): Promise<AggregationData[]> =>
    api
      .get("/aggregation/daily", { params: { startDate, endDate } })
      .then((r) => r.data),

  getWeekly: (week: string): Promise<AggregationData> =>
    api.get(`/aggregation/weekly/${week}`).then((r) => r.data),

  getWeeklyRange: (
    startWeek: string,
    endWeek: string,
  ): Promise<AggregationData[]> =>
    api
      .get("/aggregation/weekly", { params: { startWeek, endWeek } })
      .then((r) => r.data),

  getMonthly: (month: string): Promise<AggregationData> =>
    api.get(`/aggregation/monthly/${month}`).then((r) => r.data),

  getMonthlyRange: (
    startMonth: string,
    endMonth: string,
  ): Promise<AggregationData[]> =>
    api
      .get("/aggregation/monthly", { params: { startMonth, endMonth } })
      .then((r) => r.data),

  getYearly: (year: string): Promise<AggregationData> =>
    api.get(`/aggregation/yearly/${year}`).then((r) => r.data),

  getYearlyRange: (
    startYear: string,
    endYear: string,
  ): Promise<AggregationData[]> =>
    api
      .get("/aggregation/yearly", { params: { startYear, endYear } })
      .then((r) => r.data),

  getCategoryMonthly: (month: string): Promise<CategoryAggregation[]> =>
    api.get(`/aggregation/category/monthly/${month}`).then((r) => r.data),
};
