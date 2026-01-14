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

  @ApiProperty({ description: 'Texto da sugestão (pergunta + opções)', example: 'Pergunta: Você é a favor? Opção A: Sim, Opção B: Não' })
  @IsNotEmpty({ message: 'Texto da sugestão é obrigatório' })
  @IsString()
  suggestionText: string;
}
