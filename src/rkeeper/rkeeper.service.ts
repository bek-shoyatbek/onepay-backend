import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { RKeeperParams } from 'src/types/rkeeper-params';

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
  async getOrderDetails(orderId: string) {
    const xmlBodyStr = `<RK7Query>
 <RK7Command CMD="GetOrder">
  <Order guid="{${orderId}}"/>
 </RK7Command>
</RK7Query>`;
    const config = {
      headers: {
        'Content-Type': 'application/xml',
      },
      auth: {
        username: this.configService.get('RKEEPER_LOGIN'),
        password: this.configService.get('RKEEPER_PASSWORD'),
      },
      rejectUnauthorized: false,
      timeout: 50 * 1000,
    };

    console.log('apiURL', this.apiURL);

    const req = this.httpService.post(this.apiURL, xmlBodyStr, config);
    console.log('req', req);
    const res = await firstValueFrom(req);
    console.log('res', res);
    const request = this.httpService
      .post(this.apiURL, xmlBodyStr, config)
      .pipe(map((res) => res.data))
      .pipe(map((data) => data))
      .pipe(
        catchError((err) => {
          console.log('err', err);
          throw new HttpException(err, 400);
        }),
      );

    const data = await request.toPromise();

    console.log('data', data);

    return data;
  }
}
