export interface TransactionData {
  transaction_id: number;
  table_id: number;
  spot_id: number;
  client_id: number;
  sum: string;
  payed_sum: string;
  payed_cash: string;
  payed_card: string;
  payed_cert: string;
  payed_bonus: string;
  payed_third_party: string;
  payed_card_type: number;
  round_sum: string;
  tips_cash: string;
  tips_card: string;
  pay_type: number;
  reason: number;
  tip_sum: string;
  bonus: number;
  discount: number;
  print_fiscal: null;
  total_profit: number;
  total_profit_netto: number;
  date_close: string;
  products: Array<{
    product_id: number;
    modification_id: number;
    type: number;
    workshop_id: number;
    num: number;
    product_sum: string;
    payed_sum: string;
    cert_sum: string;
    bonus_sum: string;
    bonus_accrual: null;
    round_sum: string;
    discount: number;
    fiscal_company_id: number;
    print_fiscal: number;
    tax_id: number;
    tax_value: number;
    tax_type: number;
    tax_fiscal: number;
    tax_sum: string;
    product_cost: number;
    product_profit: number;
    product_cost_netto: number;
    product_profit_netto: number;
    printed_num: number;
  }>;
  auto_accept: boolean;
  application_id: null;
}

export interface TransactionsResponse {
  response: {
    count: number;
    page: {
      per_page: number;
      page: number;
      count: number;
    };
    data: Array<TransactionData>;
  };
}
