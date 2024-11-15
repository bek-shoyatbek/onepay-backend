import {
    Catch,
    ArgumentsHost,
    ExceptionFilter,
    HttpStatus,
    HttpException
} from "@nestjs/common";


@Catch()
export default class InternalServerErrorExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {

        let { message: errMsg, stack: errStack, name: errName } = exception;
        // let errRes = exception.getResponse();
        // let errCode = exception.getStatus();
        let ctx = host.switchToHttp();
        let req = ctx.getRequest();
        let res = ctx.getResponse();
        const statusName = "系统内部错误";
        res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        // HttpException Error
        if (exception instanceof HttpException) {
            // set httpException res to res
            res.status(exception.getStatus()).json(exception.getResponse());
            return;
        }
        // other error to rewirte InternalServerErrorException response

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: req.url,
            message: errMsg,
            stack: errStack,
            name: errName,
            status: statusName
        });
    }
}
