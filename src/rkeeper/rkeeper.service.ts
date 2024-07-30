import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { RKeeperParams } from 'src/types/rkeeper-params';
import * as https from 'https';
import { parseString } from 'xml2js';
import { promisify } from 'util';

@Injectable()
export class RkeeperService {
  private apiURL: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiURL = this.configService.get('API_RKEEPER');
  }

  /**
   * This function generates a URL for r_keeper terminal to generate qrcode to the client side of our payment page
   * @param params {RkeeperParams}
   * @returns {Promise<string>}
   */
  async generateURL(params: RKeeperParams) {
    const UI_URL = this.configService.get('UI_URL');
    return `${UI_URL}/pay?orderId=${params.guid}&total=${params.amount}&spotId=${params.name}`;
  }

  /**
   *
   * @param orderId string
   * @returns {Promise<boolean>}
   */
  async completeOrder(orderId: string, amount: number): Promise<boolean> {
    const xmlBodyStr = `<RK7Query>
	<RK7CMD CMD="PayOrder">
		<Order guid="{${orderId}}"/>
		<Cashier code="5"/>
		<Station code="1"/>
		<Payment id="1" amount="${amount}"/>
	</RK7CMD>
</RK7Query>`;

    const config = {
      headers: {
        'Content-Type': 'application/xml',
      },
      auth: {
        username: this.configService.get('RKEEPER_LOGIN'),
        password: this.configService.get('RKEEPER_PASSWORD'),
      },
    };

    const { data } = await this.httpService.axiosRef.get(this.apiURL, config);

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

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    const config = {
      headers: {
        'Content-Type': 'application/xml',
      },
      auth: {
        username: this.configService.get('RKEEPER_LOGIN'),
        password: this.configService.get('RKEEPER_PASSWORD'),
      },
      httpsAgent,
      timeout: 50 * 1000,
    };

    const req = this.httpService.post(this.apiURL, xmlBodyStr, config);
    const res = await firstValueFrom(req);
    const data = res?.data;

    if (!data) {
      throw new HttpException('Error while getting order details', 500);
    }

    const { waiterId, stationId } = await this.getWaiterAndStationId(data);
    console.log('waiterId', waiterId);
    console.log('stationId', stationId);
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
