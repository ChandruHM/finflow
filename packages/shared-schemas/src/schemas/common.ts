import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().int().min(0),
  limit: z.number().int().min(1).max(100),
  total: z.number().int(),
  pages: z.number().int(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: PaginationSchema.optional(),
  });

export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
};
