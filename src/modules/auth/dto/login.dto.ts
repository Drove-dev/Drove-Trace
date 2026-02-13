import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}