import { InjectBot } from '@grammyjs/nestjs';
import { Injectable } from '@nestjs/common';
import { Bot, Context, InlineKeyboard, SessionFlavor } from 'grammy';

interface SessionData {
  registrationStep: number;
  role?: 'admin' | 'waiter';
  userData?: {
    contactNumber?: string;
    restaurantId?: string;
    id?: string;
    cardNumber?: string;
  };
  awaitingWaiterSearch?: boolean;
}

type MyContext = Context & SessionFlavor<SessionData>;

@Injectable()
export class BotService {
  private users: Record<
    number,
    {
      role: 'admin' | 'waiter';
      contactNumber: string;
      restaurantId: string;
      id: string;
      cardNumber?: string;
      balance: number;
      lastTransferDate?: Date;
    }
  > = {};

  constructor(@InjectBot() private readonly bot: Bot<MyContext>) {
    this.bot.command('start', this.onStart.bind(this));
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
  }

  private async onStart(ctx: MyContext) {
    ctx.session.registrationStep = 1;
    await ctx.reply('Welcome! Are you an admin or a waiter?', {
      reply_markup: new InlineKeyboard()
        .text('Admin', 'role_admin')
        .text('Waiter', 'role_waiter'),
    });
  }

  private async handleMessage(ctx: MyContext) {
    const msg = ctx.message?.text;
    if (!msg) return;

    if (ctx.session.awaitingWaiterSearch) {
      await this.searchWaiter(ctx, msg);
      return;
    }

    if (!ctx.session.registrationStep) {
      await this.showMainMenu(ctx);
      return;
    }

    switch (ctx.session.registrationStep) {
      case 2:
        await this.handleContactNumber(ctx, msg);
        break;
      case 3:
        await this.handleRestaurantId(ctx, msg);
        break;
      case 4:
        await this.handleId(ctx, msg);
        break;
      case 5:
        if (ctx.session.role === 'waiter') {
          await this.handleCardNumber(ctx, msg);
        } else {
          await this.finishRegistration(ctx);
        }
        break;
      default:
        await this.finishRegistration(ctx);
    }
  }

  private async handleCallbackQuery(ctx: MyContext) {
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData) return;

    if (callbackData.startsWith('role_')) {
      await this.handleRoleSelection(ctx, callbackData.split('_')[1]);
    } else {
      switch (callbackData) {
        case 'check_balance':
          await this.checkBalance(ctx);
          break;
        case 'request_transfer':
          await this.requestTransfer(ctx);
          break;
        case 'send_message':
          await this.promptSendMessage(ctx);
          break;
        case 'view_waiters':
          await this.viewWaiters(ctx);
          break;
        case 'search_waiter':
          await this.promptSearchWaiter(ctx);
          break;
      }
    }
  }

  private async handleRoleSelection(ctx: MyContext, role: string) {
    if (role === 'admin' || role === 'waiter') {
      ctx.session.role = role as 'admin' | 'waiter';
      ctx.session.registrationStep = 2;
      await ctx.answerCallbackQuery();
      await ctx.reply('Please provide your contact number.');
    } else {
      await ctx.answerCallbackQuery('Invalid role selection.');
    }
  }

  private async handleContactNumber(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, contactNumber: msg };
    ctx.session.registrationStep = 3;
    await ctx.reply('Please provide your restaurant ID.');
  }

  private async handleRestaurantId(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, restaurantId: msg };
    ctx.session.registrationStep = 4;
    await ctx.reply(`Please provide your ${ctx.session.role} ID.`);
  }

  private async handleId(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, id: msg };
    if (ctx.session.role === 'waiter') {
      ctx.session.registrationStep = 5;
      await ctx.reply('Please provide your card number.');
    } else {
      await this.finishRegistration(ctx);
    }
  }

  private async handleCardNumber(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, cardNumber: msg };
    await this.finishRegistration(ctx);
  }

  private async finishRegistration(ctx: MyContext) {
    const { role, userData } = ctx.session;
    if (role && userData) {
      this.users[ctx.from.id] = {
        role,
        contactNumber: userData.contactNumber,
        restaurantId: userData.restaurantId,
        id: userData.id,
        cardNumber: userData.cardNumber,
        balance: 0,
      };
      delete ctx.session.registrationStep;
      delete ctx.session.userData;
      await ctx.reply('Registration complete. You can now use the bot.');
      await this.showMainMenu(ctx);
    }
  }

  private async showMainMenu(ctx: MyContext) {
    const user = this.users[ctx.from.id];
    if (!user) {
      await ctx.reply('Please register first by using the /start command.');
      return;
    }

    const keyboard = new InlineKeyboard().text(
      'Check Balance',
      'check_balance',
    );

    if (user.role === 'waiter') {
      keyboard.text('Request Transfer', 'request_transfer');
    } else {
      keyboard
        .text('Send Message', 'send_message')
        .row()
        .text('View Waiters', 'view_waiters')
        .text('Search Waiter', 'search_waiter');
    }

    await ctx.reply('What would you like to do?', { reply_markup: keyboard });
  }

  private async checkBalance(ctx: MyContext) {
    const user = this.users[ctx.from.id];
    await ctx.answerCallbackQuery();
    await ctx.reply(`Your current balance is: $${user.balance.toFixed(2)}`);
    await this.showMainMenu(ctx);
  }

  private async requestTransfer(ctx: MyContext) {
    const user = this.users[ctx.from.id];
    await ctx.answerCallbackQuery();

    if (user.role !== 'waiter') {
      await ctx.reply('This action is only available for waiters.');
      return;
    }

    const lastTransferDate = user.lastTransferDate || new Date(0);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (lastTransferDate > oneMonthAgo) {
      await ctx.reply('You can only request a transfer once a month.');
    } else if (!user.cardNumber) {
      await ctx.reply('You need to provide a valid card number first.');
    } else {
      const admin = Object.values(this.users).find(
        (u) => u.role === 'admin' && u.restaurantId === user.restaurantId,
      );
      if (admin) {
        await this.bot.api.sendMessage(
          admin.id,
          `Waiter ${user.id} has requested a transfer of $${user.balance.toFixed(2)}.`,
        );
      }
      await ctx.reply('Your transfer request has been sent to the admin.');
    }

    await this.showMainMenu(ctx);
  }

  private async promptSendMessage(ctx: MyContext) {
    const user = this.users[ctx.from.id];
    await ctx.answerCallbackQuery();

    if (user.role !== 'admin') {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    await ctx.reply(
      'Please enter the waiter ID and your message separated by a comma.',
    );
  }

  private async viewWaiters(ctx: MyContext) {
    const admin = this.users[ctx.from.id];
    await ctx.answerCallbackQuery();

    if (admin.role !== 'admin') {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    const waiters = Object.values(this.users).filter(
      (user) =>
        user.role === 'waiter' && user.restaurantId === admin.restaurantId,
    );

    if (waiters.length === 0) {
      await ctx.reply('No waiters found for your restaurant.');
    } else {
      const waiterList = waiters
        .map(
          (waiter) =>
            `ID: ${waiter.id}, Contact: ${waiter.contactNumber}, Balance: $${waiter.balance.toFixed(2)}`,
        )
        .join('\n');
      await ctx.reply(`Waiters in your restaurant:\n\n${waiterList}`);
    }

    await this.showMainMenu(ctx);
  }

  private async promptSearchWaiter(ctx: MyContext) {
    await ctx.answerCallbackQuery();
    ctx.session.awaitingWaiterSearch = true;
    await ctx.reply('Please enter the waiter ID you want to search for.');
  }

  private async searchWaiter(ctx: MyContext, waiterId: string) {
    const admin = this.users[ctx.from.id];

    if (admin.role !== 'admin') {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    const waiter = Object.values(this.users).find(
      (user) =>
        user.role === 'waiter' &&
        user.restaurantId === admin.restaurantId &&
        user.id === waiterId,
    );

    if (waiter) {
      await ctx.reply(
        `Waiter found:\nID: ${waiter.id}\nContact: ${waiter.contactNumber}\nBalance: $${waiter.balance.toFixed(2)}\nCard Number: ${waiter.cardNumber || 'Not provided'}`,
      );
    } else {
      await ctx.reply('Waiter not found in your restaurant.');
    }

    ctx.session.awaitingWaiterSearch = false;
    await this.showMainMenu(ctx);
  }

  public async notifyWaiter(
    restaurantId: string,
    waiterId: string,
    amount: number,
  ) {
    const waiter = Object.values(this.users).find(
      (u) =>
        u.role === 'waiter' &&
        u.restaurantId === restaurantId &&
        u.id === waiterId,
    );
    if (waiter) {
      waiter.balance += amount;
      await this.bot.api.sendMessage(
        waiter.id,
        `You have received $${amount.toFixed(2)}. Your new balance is $${waiter.balance.toFixed(2)}.`,
      );
      await this.showMainMenu({ from: { id: waiter.id } } as unknown as MyContext);
    }
  }
}
