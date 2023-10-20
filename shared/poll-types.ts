export type Participants = {
  [participantID: string]: string;
};

export type Poll = {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  //   nominations: Nominations;
  //   rankings: Rankings;
  //   results: Results;
  hasStarted: boolean;
};
