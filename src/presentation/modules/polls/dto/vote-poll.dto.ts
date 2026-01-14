import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VotePollDto {
  @ApiProperty({ description: 'Nome do votante', example: 'João Silva' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'E-mail do votante', example: 'joao@example.com' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ description: 'Opção selecionada', enum: ['A', 'B'], example: 'A' })
  @IsNotEmpty({ message: 'Opção é obrigatória' })
  @IsEnum(['A', 'B'], { message: 'Opção deve ser A ou B' })
  option: 'A' | 'B';
}
