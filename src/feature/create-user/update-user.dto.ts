import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
