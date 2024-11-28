import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

@Catch()
export default class InternalServerErrorExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Error, host: ArgumentsHost) {
    const { message: errMsg, stack: errStack, name: errName } = exception;
    // let errRes = exception.getResponse();
    // let errCode = exception.getStatus();
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const statusName = exception.name;
    res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    // HttpException Error
    if (exception instanceof HttpException) {
      // set httpException res to res
      res.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const response = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: errMsg,
      stack: errStack,
      name: errName,
      status: statusName,
    };

    console.error(response);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
}
