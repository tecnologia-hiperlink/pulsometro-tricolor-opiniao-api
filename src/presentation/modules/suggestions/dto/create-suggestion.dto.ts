import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSuggestionDto {
  @ApiProperty({ description: 'Nome de quem está sugerindo', example: 'João Silva' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'E-mail de quem está sugerindo', example: 'joao@example.com' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ description: 'Pergunta da enquete', example: 'Você é a favor do impeachment?' })
  @IsNotEmpty({ message: 'Pergunta é obrigatória' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Opção A da enquete', example: 'A favor' })
  @IsNotEmpty({ message: 'Opção A é obrigatória' })
  @IsString()
  optionA: string;

  @ApiProperty({ description: 'Opção B da enquete', example: 'Contra' })
  @IsNotEmpty({ message: 'Opção B é obrigatória' })
  @IsString()
  optionB: string;
}
