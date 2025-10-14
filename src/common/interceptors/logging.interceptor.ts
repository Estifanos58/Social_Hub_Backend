import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HttpRequest");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { ip?: string }>();
    const { method } = request;
    const url = (request as any).originalUrl ?? (request as any).url;
    const userAgent = (request as any).headers?.["user-agent"] ?? "unknown";
    const ip = (request as any).ip ?? (request as any).socket?.remoteAddress ?? "unknown";
    const startedAt = Date.now();

    this.logger.log(`${method} ${url} - UA: ${userAgent} - IP: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(`${method} ${url} completed in ${duration}ms`);
      }),
    );
  }
}
