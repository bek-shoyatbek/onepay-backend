export class RequestDto {
  serviceId: number;
  timestamp: number;
  params: {
    account: number;
    [key: string]: any;
  };
}
