import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "./types";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {
   private user: User;
   constructor(private readonly configService: ConfigService,
      private readonly jwtService: JwtService
   ) {
      this.user = {} as User;
      this.user.email = configService.get<string>("ADMIN_EMAIL");
      this.user.password = configService.get<string>("ADMIN_PASSWORD");
   }

   async login(user: User) {
      const { email, password } = user;
      if (email !== this.user.email || password !== this.user.password) {
         throw new UnauthorizedException("Invalid credentials");
      }

      const payload = { sub: email, email };
      return {
         accessToken: await this.jwtService.signAsync(payload)
      };

   }

}
