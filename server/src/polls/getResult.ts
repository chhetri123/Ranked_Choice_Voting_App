import { Nomination, Rankings, Results } from 'shared';

export default (
  rankings: Rankings,
  nominations: Nomination,
  votesPerVoter: number,
): Results => {
  const scores: { [nominationID: string]: number } = {};

  Object.values(rankings).forEach((userRankings) => {
    userRankings.forEach((nominationID, n) => {
      const voteValue = Math.pow(
        (votesPerVoter - 0.5 * n) / votesPerVoter,
        n + 1,
      );

      scores[nominationID] = (scores[nominationID] ?? 0) + voteValue;
    });
  });

  const result = Object.entries(scores).map(([nominationID, score]) => ({
    nominationID,
    nominationText: nominations[nominationID].text,
    score,
  }));

  result.sort((res1, res2) => res2.score - res1.score);
  return result;
};
