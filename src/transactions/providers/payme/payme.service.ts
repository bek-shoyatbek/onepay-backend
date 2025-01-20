import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { CheckPerformTransactionDto } from './dto/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { GetStatementDto } from './dto/get-statement.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionState } from './constants/transaction-state';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { PaymeError } from './constants/payme-error';
import { DateTime } from 'luxon';
import { CancelingReasons } from './constants/canceling-reasons';
import { closeOrder } from '../../../utils/terminals';

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) { }

  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;
    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformTransaction(
          reqBody as CheckPerformTransactionDto,
        );

      case TransactionMethods.CreateTransaction:
        return await this.createTransaction(reqBody as CreateTransactionDto);

      case TransactionMethods.CheckTransaction:
        return await this.checkTransaction(
          reqBody as unknown as CheckTransactionDto,
        );

      case TransactionMethods.PerformTransaction:
        return await this.performTransaction(reqBody as PerformTransactionDto);

      case TransactionMethods.CancelTransaction:
        return await this.cancelTransaction(reqBody as CancelTransactionDto);

      case TransactionMethods.GetStatement:
        return await this.getStatement(reqBody as GetStatementDto);
      default:
        return 'Invalid transaction method';
    }
  }

  /**
   * If payment is possible, the CheckPerformTransaction method returns the result allow.
   * If payment is impossible, the method returns an error.
   *
   * @param {CheckPerformTransactionDto} checkPerformTransactionDto
   */
  async checkPerformTransaction(
    checkPerformTransactionDto: CheckPerformTransactionDto,
  ) {
    const transactionId =
      checkPerformTransactionDto.params.account?.transactionId;

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.ProductNotFound,
      };
    }

    if (transaction.amount !== checkPerformTransactionDto.params.amount) {
      return {
        error: PaymeError.InvalidAmount,
      };
    }
    return {
      result: {
        allow: true,
      },
    };
  }
  /**
   * The CreateTransaction method returns a list of payment recipients.
   * When the payment originator is the recipient, the field receivers can be omitted or set to NULL.
   * If a transaction has already been created,
   * the merchant application performs basic verification of the transaction
   * and returns the verification result to Payme Business.
   *
   * @param {CreateTransactionDto} createTransactionDto
   */
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const transactionId = createTransactionDto.params.account?.transactionId;
    const amount = createTransactionDto.params.amount;
    const transId = createTransactionDto.params.id;

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (transaction) {
      if (transaction.status === 'PENDING') {
        if (transId !== transaction.transId) {
          return {
            error: PaymeError.Pending,
            id: transId,
          };
        }

        if (this.checkTransactionExpiration(transaction.createdAt)) {
          await this.prismaService.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: 'CANCELED',
              cancelTime: new Date(),
              state: TransactionState.PendingCanceled,
              reason: CancelingReasons.CanceledDueToTimeout,
            },
          });

          return {
            error: {
              ...PaymeError.CantDoOperation,
              state: TransactionState.PendingCanceled,
              reason: CancelingReasons.CanceledDueToTimeout,
            },
            id: transId,
          };
        }

        return {
          result: {
            transaction: transaction.id,
            state: TransactionState.Pending,
            create_time: new Date(transaction.createdAt).getTime(),
          },
        };
      } else if (transaction.status !== 'INIT') {
        return {
          error: PaymeError.CantDoOperation,
          id: transId,
        };
      }
    }

    const checkTransaction: CheckPerformTransactionDto = {
      method: TransactionMethods.CheckPerformTransaction,
      params: {
        amount: amount,
        account: {
          transactionId,
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(checkTransaction);

    if (checkResult.error) {
      return {
        error: checkResult.error,
        id: transId,
      };
    }

    const updatedTransaction = await this.prismaService.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        tip: transaction.tip,
        provider: 'payme',
        transId: transId,
        amount: amount,
        createdAt: new Date(),
        status: 'PENDING',
        state: TransactionState.Pending,
      },
    });

    return {
      result: {
        transaction: updatedTransaction.id,
        state: updatedTransaction.state,
        create_time: new Date(updatedTransaction.createdAt).getTime(),
      },
    };
  }

  /**
   * The PerformTransaction method credits
   * funds to the merchant’s account and sets the order to “paid” status.
   *
   * @param {PerformTransactionDto} performTransactionDto
   */
  async performTransaction(performTransactionDto: PerformTransactionDto) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId: performTransactionDto.params.id,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.TransactionNotFound,
        id: performTransactionDto.params.id,
      };
    }

    if (transaction.status !== 'PENDING') {
      if (transaction.status !== 'PAID') {
        return {
          error: PaymeError.CantDoOperation,
          id: performTransactionDto.params.id,
        };
      }

      return {
        result: {
          state: transaction.state,
          transaction: transaction.id,
          perform_time: new Date(transaction.performTime).getTime(),
        },
      };
    }

    const expirationTime = this.checkTransactionExpiration(
      transaction.createdAt,
    );

    if (expirationTime) {
      await this.prismaService.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'CANCELED',
          cancelTime: new Date(),
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
        },
      });
      return {
        error: {
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
          ...PaymeError.CantDoOperation,
        },
        id: performTransactionDto.params.id,
      };
    }

    if (!transaction.isTipOnly) {
      const closeOrderResult = await closeOrder(
        transaction.terminal,
        transaction,
      );

      console.log('closeOrderResult: ', closeOrderResult);
    }

    const performTime = new Date();

    const updatedPayment = await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'PAID',
        state: TransactionState.Paid,
        performTime,
      },
    });

    return {
      result: {
        transaction: updatedPayment.id,
        perform_time: performTime.getTime(),
        state: TransactionState.Paid,
      },
    };
  }

  /**
   * The CancelTransaction method cancels both a created and a completed transaction.
   *
   * @param {CancelTransactionDto} cancelTransactionDto
   */
  async cancelTransaction(cancelTransactionDto: CancelTransactionDto) {
    const transId = cancelTransactionDto.params.id;

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId,
      },
    });

    if (!transaction) {
      return {
        id: transId,
        error: PaymeError.TransactionNotFound,
      };
    }

    if (transaction.status === 'PENDING') {
      const cancelTransaction = await this.prismaService.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'CANCELED',
          state: TransactionState.PendingCanceled,
          cancelTime: new Date(),
          reason: cancelTransactionDto.params.reason,
        },
      });

      return {
        result: {
          cancel_time: cancelTransaction.cancelTime.getTime(),
          transaction: cancelTransaction.id,
          state: TransactionState.PendingCanceled,
        },
      };
    }

    if (transaction.state !== TransactionState.Paid) {
      return {
        result: {
          state: transaction.state,
          transaction: transaction.id,
          cancel_time: transaction.cancelTime.getTime(),
        },
      };
    }

    const updatedTransaction = await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'CANCELED',
        state: TransactionState.PaidCanceled,
        cancelTime: new Date(),
        reason: cancelTransactionDto.params.reason,
      },
    });

    return {
      result: {
        cancel_time: updatedTransaction.cancelTime.getTime(),
        transaction: updatedTransaction.id,
        state: TransactionState.PaidCanceled,
      },
    };
  }

  /**
   * @param {CheckTransactionDto} checkTransactionDto
   */
  async checkTransaction(checkTransactionDto: CheckTransactionDto) {
    const transId = checkTransactionDto.params.id;

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.TransactionNotFound,
        id: checkTransactionDto.params.id,
      };
    }

    return {
      result: {
        create_time: transaction.createdAt.getTime(),
        perform_time: new Date(transaction.performTime).getTime() || 0,
        cancel_time: new Date(transaction.cancelTime).getTime() || 0,
        transaction: transaction.id,
        state: transaction.state,
        reason: transaction.reason || null,
      },
    };
  }

  /**
   * To return a list of transactions for a specified period,
   * the GetStatement method is used
   * @param {GetStatementDto} getStatementDto
   */
  async getStatement(getStatementDto: GetStatementDto) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(getStatementDto.params.from),
          lte: new Date(getStatementDto.params.to),
        },
        provider: 'payme', // ! TransactionSchema only from Payme
      },
    });

    return {
      result: {
        transactions: transactions.map((transaction) => {
          return {
            id: transaction.transId,
            time: new Date(transaction.createdAt).getTime(),
            amount: transaction.amount,
            account: {
              transactionId: transaction.id,
            },
            create_time: new Date(transaction.createdAt).getTime(),
            perform_time: new Date(transaction.performTime).getTime(),
            cancel_time: new Date(transaction.cancelTime).getTime(),
            transaction: transaction.id,
            state: transaction.state,
            reason: transaction.reason || null,
          };
        }),
      },
    };
  }

  private checkTransactionExpiration(createdAt: Date) {
    const transactionCreatedAt = new Date(createdAt);
    const timeoutDuration = 720;
    const timeoutThreshold = DateTime.now()
      .minus({
        minutes: timeoutDuration,
      })
      .toJSDate();

    return transactionCreatedAt < timeoutThreshold;
  }
}
