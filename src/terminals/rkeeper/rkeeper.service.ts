import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RKeeperParams } from 'src/types/rkeeper-params';
import * as https from 'https';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { CompleteOrderParams } from './types/complete-order.params';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class RkeeperService {
  private readonly apiURL: string;
  private readonly axiosConfigs: AxiosRequestConfig<any>;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiURL = this.configService.get('API_RKEEPER');

    this.axiosConfigs = {
      headers: {
        'Content-Type': 'application/xml',
      },
      auth: {
        username: this.configService.get('RKEEPER_LOGIN'),
        password: this.configService.get('RKEEPER_PASSWORD'),
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 50 * 1000,
    };
  }

  async generateURL(params: RKeeperParams) {
    const UI_URL = this.configService.get('UI_URL');
    console.log(params);
    const orderDetails = await this.getOrderWaiterIdAndStationId(params.guid);
    if (!orderDetails) {
      throw new HttpException('Error while getting order details', 500);
    }

    return `${UI_URL}/pay?orderId=${params.guid}&total=${params.total}&spotId=${orderDetails.stationId}&userId=${orderDetails.waiterId}`;
  }

  /**
   *
   * @returns {Promise<boolean>}
   * @param completeOrderParams
   */
  async closeOrder(completeOrderParams: CompleteOrderParams): Promise<boolean> {
    console.log('completeOrderParams: ', completeOrderParams);
    const xmlBodyStr = `<RK7Query>
	<RK7CMD CMD="PayOrder">
		<Order guid="{${completeOrderParams.orderId}}"/>
		<Cashier code="7"/>
		<Station code="7"/>
		<Payment id="1" amount="${completeOrderParams.total}"/>
	</RK7CMD>
</RK7Query>`;

    const { data } = await this.httpService.axiosRef.post(
      this.apiURL,
      xmlBodyStr,
      this.axiosConfigs,
    );

    return data;
  }

  /**
   * This function returns order details
   * @param orderId string
   * @returns {Promise<any>}
   */
  async getOrderWaiterIdAndStationId(orderId: string) {
    const xmlBodyStr = `<RK7Query>
 <RK7Command CMD="GetOrder">
  <Order guid="{${orderId}}"/>
 </RK7Command>
</RK7Query>`;

    const req = this.httpService.post(
      this.apiURL,
      xmlBodyStr,
      this.axiosConfigs,
    );
    const res = await firstValueFrom(req);
    const data = res?.data;

    if (!data) {
      throw new HttpException('Error while getting order details', 500);
    }

    const { waiterId, stationId } = await this.getWaiterAndStationId(data);
    return { waiterId, stationId };
  }

  private async getWaiterAndStationId(xml: string) {
    const parseXml = promisify(parseString);

    try {
      const result = await parseXml(xml);

      const order = result.RK7QueryResult.CommandResult[0].Order[0];

      const waiterId = order.Waiter[0].$.id;
      const stationId = order.Station[0].$.id;

      return { waiterId, stationId };
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw error;
    }
  }
}
