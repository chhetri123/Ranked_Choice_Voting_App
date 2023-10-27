type ParticipationID = string;
type NominationID = string;

export type Participants = {
  [participantID: ParticipationID]: string;
};

export type Rankings = {
  [userID: string]: NominationID[];
};

export type Poll = {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  rankings: Rankings;
  //   results: Results;
  hasStarted: boolean;
};

export type Nomination = {
  userID: string;
  text: string;
};

export type Nominations = {
  [nominationID: NominationID]: Nomination;
};
