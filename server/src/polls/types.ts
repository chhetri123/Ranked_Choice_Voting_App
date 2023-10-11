export type CreatePollFields = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollFields = {
  pollID: string;
  name: string;
};

export type ReJoinPollFields = {
  pollID: string;
  userID: string;
  name: string;
};
