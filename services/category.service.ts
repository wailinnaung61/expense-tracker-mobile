import api from "@/lib/api";
import {
    Category,
    CreateCategoryPayload,
    PaginatedResponse,
    TransactionType,
    UpdateCategoryPayload,
} from "@/types/api.types";

export const categoryService = {
  getCategories: (params?: {
    type?: TransactionType;
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Category>> =>
    api.get("/expensecategory", { params }).then((r) => r.data),

  getCategoryList: (type: TransactionType): Promise<Category[]> =>
    api.get("/expensecategory/list", { params: { type } }).then((r) => r.data),

  getCategoryById: (id: string): Promise<Category> =>
    api.get(`/expensecategory/${id}`).then((r) => r.data),

  createCategory: (data: CreateCategoryPayload): Promise<Category> =>
    api.post("/expensecategory", data).then((r) => r.data),

  updateCategory: (
    id: string,
    data: UpdateCategoryPayload,
  ): Promise<Category> =>
    api.put(`/expensecategory/${id}`, data).then((r) => r.data),

  deleteCategory: (id: string): Promise<void> =>
    api.delete(`/expensecategory/${id}`).then((r) => r.data),
};
