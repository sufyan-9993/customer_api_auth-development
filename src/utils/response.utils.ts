import { Injectable } from '@nestjs/common';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface ApiErrResponse {
  statusCode: number;
  message: string;
}

@Injectable()
export class ResponseService {
  success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      statusCode: 200,
      message,
      data,
    };
  }
  error(statusCode: number, message = 'Failed'): ApiErrResponse {
    return {
      statusCode,
      message,
    };
  }

  paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Listed Successfully!',
  ): ApiResponse<T[]> {
    return {
      statusCode: 200,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
