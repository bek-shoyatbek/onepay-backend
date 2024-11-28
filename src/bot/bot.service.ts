import { InjectBot } from '@grammyjs/nestjs';
import { Injectable } from '@nestjs/common';
import { Bot, Context, Keyboard, SessionFlavor } from 'grammy';
import { PrismaService } from 'src/prisma.service';

interface SessionData {
  registrationStep: number;
  role?: 'admin' | 'waiter';
  userData?: {
    phone?: string;
    restaurantId?: string;
    id?: string;
  };
  awaitingWaiterSearch?: boolean;
}

type MyContext = Context &
  SessionFlavor<SessionData> & {
    message?: {
      text?: string;
      contact?: {
        phone_number: string;
        first_name: string;
        last_name?: string;
        user_id?: number;
      };
    };
  };

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Bot<MyContext>,
    private prisma: PrismaService,
  ) {
    this.bot.command('start', this.onStart.bind(this));
    this.bot.on('message', this.handleMessage.bind(this));
  }

  private async onStart(ctx: MyContext) {
    ctx.session.registrationStep = 1;
    await ctx.reply('Welcome! Are you an admin or a waiter?', {
      reply_markup: new Keyboard()
        .text('Admin')
        .text('Waiter')
        .resized()
        .oneTime(),
    });
  }

  private async handleMessage(ctx: MyContext) {
    const msg = ctx.message?.text;
    const contact = ctx.message?.contact;

    if (ctx.session.awaitingWaiterSearch) {
      await this.searchWaiter(ctx, msg);
      return;
    }

    if (!ctx.session.registrationStep) {
      await this.handleMainMenu(ctx, msg);
      return;
    }

    switch (ctx.session.registrationStep) {
      case 1:
        await this.handleRoleSelection(ctx, msg);
        break;
      case 2:
        if (contact) {
          await this.handleContact(ctx, contact);
        } else {
          await ctx.reply(
            'Please share your contact using the button provided.',
          );
        }
        break;
      case 3:
        await this.handleRestaurantId(ctx, msg);
        break;
      case 4:
        await this.handleId(ctx, msg);
        break;
      default:
        await this.finishRegistration(ctx);
    }
  }

  private async handleRoleSelection(ctx: MyContext, msg: string) {
    if (msg === 'Admin' || msg === 'Waiter') {
      ctx.session.role = msg.toLowerCase() as 'admin' | 'waiter';
      ctx.session.registrationStep = 2;
      await ctx.reply('Please share your contact information.', {
        reply_markup: {
          keyboard: [[{ text: 'Share Contact', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    } else {
      await ctx.reply('Please select either Admin or Waiter.', {
        reply_markup: new Keyboard()
          .text('Admin')
          .text('Waiter')
          .resized()
          .oneTime(),
      });
    }
  }

  private async handleContact(ctx: MyContext, contact: any) {
    ctx.session.userData = {
      ...ctx.session.userData,
      phone: contact.phone_number,
    };
    ctx.session.registrationStep = 3;
    await ctx.reply('Thank you. Now, please provide your restaurant ID.');
  }

  private async handleRestaurantId(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, restaurantId: msg };
    ctx.session.registrationStep = 4;
    await ctx.reply(`Please provide your ${ctx.session.role} ID.`);
  }

  private async handleId(ctx: MyContext, msg: string) {
    ctx.session.userData = { ...ctx.session.userData, id: msg };
    await this.finishRegistration(ctx);
  }

  private async finishRegistration(ctx: MyContext) {
    const { role, userData } = ctx.session;
    if (role && userData) {
      const telegramId = ctx.from.id.toString();
      if (role === 'waiter') {
        await this.prisma.waiter.create({
          data: {
            restaurantId: userData.restaurantId,
            waiterId: userData.id,
            phone: userData.phone,
            telegramId,
          },
        });
      } else {
        await this.prisma.admin.create({
          data: {
            restaurantId: userData.restaurantId,
            adminId: userData.id,
            phone: userData.phone,
            telegramId,
          },
        });
      }
      delete ctx.session.registrationStep;
      delete ctx.session.userData;
      await ctx.reply('Registration complete. You can now use the bot.');
      await this.showMainMenu(ctx);
    }
  }

  private async showMainMenu(ctx: MyContext) {
    const telegramId = ctx.from.id.toString();
    const waiter = await this.prisma.waiter.findFirst({
      where: { telegramId },
    });
    const admin = await this.prisma.admin.findFirst({ where: { telegramId } });

    if (!waiter && !admin) {
      await ctx.reply('Please register first by using the /start command.');
      return;
    }

    const keyboard = new Keyboard().text('Check Balance');

    if (waiter) {
      keyboard.text('Request Transfer');
    } else if (admin) {
      keyboard
        .text('Send Message')
        .row()
        .text('View Waiters')
        .text('Search Waiter');
    }

    await ctx.reply('What would you like to do?', {
      reply_markup: keyboard.resized(),
    });
  }

  private async handleMainMenu(ctx: MyContext, msg: string) {
    switch (msg) {
      case 'Check Balance':
        await this.checkBalance(ctx);
        break;
      case 'Request Transfer':
        await this.requestTransfer(ctx);
        break;
      case 'Send Message':
        await this.promptSendMessage(ctx);
        break;
      case 'View Waiters':
        await this.viewWaiters(ctx);
        break;
      case 'Search Waiter':
        await this.promptSearchWaiter(ctx);
        break;
      default:
        await ctx.reply(
          'Unknown command. Please use the provided keyboard buttons.',
        );
        await this.showMainMenu(ctx);
    }
  }

  private async checkBalance(ctx: MyContext) {
    const telegramId = ctx.from.id.toString();
    const waiter = await this.prisma.waiter.findFirst({
      where: { telegramId },
    });

    if (!waiter) {
      await ctx.reply('This action is only available for waiters.');
      return;
    }

    const tips = await this.prisma.tipTransaction.findMany({
      where: { waiterId: waiter.waiterId, restaurantId: waiter.restaurantId },
    });

    const balance = tips.reduce((sum, tip) => sum + tip.amount, 0);

    await ctx.reply(`Your current balance is: $${balance.toFixed(2)}`);
    await this.showMainMenu(ctx);
  }

  private async requestTransfer(ctx: MyContext) {
    const telegramId = ctx.from.id.toString();
    const waiter = await this.prisma.waiter.findFirst({
      where: { telegramId },
    });

    if (!waiter) {
      await ctx.reply('This action is only available for waiters.');
      return;
    }

    const tips = await this.prisma.tipTransaction.findMany({
      where: { waiterId: waiter.waiterId, restaurantId: waiter.restaurantId },
    });

    const balance = tips.reduce((sum, tip) => sum + tip.amount, 0);

    const admin = await this.prisma.admin.findFirst({
      where: { restaurantId: waiter.restaurantId },
    });

    if (admin) {
      await this.bot.api.sendMessage(
        admin.telegramId,
        `Waiter ${waiter.waiterId} has requested a transfer of $${balance.toFixed(2)}.`,
      );
    }

    await ctx.reply('Your transfer request has been sent to the admin.');
    await this.showMainMenu(ctx);
  }

  private async promptSendMessage(ctx: MyContext) {
    const telegramId = ctx.from.id.toString();
    const admin = await this.prisma.admin.findFirst({ where: { telegramId } });

    if (!admin) {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    await ctx.reply(
      'Please enter the waiter ID and your message separated by a comma.',
    );
  }

  private async viewWaiters(ctx: MyContext) {
    const telegramId = ctx.from.id.toString();
    const admin = await this.prisma.admin.findFirst({ where: { telegramId } });

    if (!admin) {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    const waiters = await this.prisma.waiter.findMany({
      where: { restaurantId: admin.restaurantId },
    });

    if (waiters.length === 0) {
      await ctx.reply('No waiters found for your restaurant.');
    } else {
      const waiterList = waiters
        .map(
          (waiter) =>
            `ID: ${waiter.waiterId}, Phone: ${waiter.phone || 'Not provided'}`,
        )
        .join('\n');
      await ctx.reply(`Waiters in your restaurant:\n\n${waiterList}`);
    }

    await this.showMainMenu(ctx);
  }

  private async promptSearchWaiter(ctx: MyContext) {
    ctx.session.awaitingWaiterSearch = true;
    await ctx.reply('Please enter the waiter ID you want to search for.');
  }

  private async searchWaiter(ctx: MyContext, waiterId: string) {
    const telegramId = ctx.from.id.toString();
    const admin = await this.prisma.admin.findFirst({ where: { telegramId } });

    if (!admin) {
      await ctx.reply('This action is only available for admins.');
      return;
    }

    const waiter = await this.prisma.waiter.findFirst({
      where: { waiterId, restaurantId: admin.restaurantId },
    });

    if (waiter) {
      const tips = await this.prisma.tipTransaction.findMany({
        where: { waiterId: waiter.waiterId, restaurantId: waiter.restaurantId },
      });

      const balance = tips.reduce((sum, tip) => sum + tip.amount, 0);

      await ctx.reply(
        `Waiter found:\nID: ${waiter.waiterId}\nPhone: ${waiter.phone || 'Not provided'}\nBalance: $${balance.toFixed(2)}`,
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
    const waiter = await this.prisma.waiter.findFirst({
      where: { waiterId, restaurantId },
    });

    if (waiter) {
      await this.prisma.tipTransaction.create({
        data: {
          amount,
          restaurantId,
          waiterId,
        },
      });

      if (waiter.telegramId) {
        await this.bot.api.sendMessage(
          waiter.telegramId,
          `You have received a tip of $${amount.toFixed(2)}.`,
        );
        await this.showMainMenu({
          from: { id: parseInt(waiter.telegramId) },
        } as MyContext);
      }
    }
  }
}
