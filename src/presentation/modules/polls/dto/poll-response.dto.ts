export class VoteHistoryDto {
  id: number;
  option: 'A' | 'B';
  emailPrefix: string;
  createdAt: Date;
}

export class PollStatsDto {
  countA: number;
  countB: number;
  total: number;
  percentageA: number;
  percentageB: number;
}

export class PollListItemDto {
  id: number;
  question: string;
  optionALabel: string;
  optionBLabel: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  createdAt: Date;
}

export class PollDetailDto {
  id: number;
  question: string;
  optionALabel: string;
  optionBLabel: string;
  stats: PollStatsDto;
  createdAt: Date;
}

export class PollHistoryResponseDto {
  poll: PollDetailDto;
  history: VoteHistoryDto[];
  page: number;
  pageSize: number;
  total: number;
}
