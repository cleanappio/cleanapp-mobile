import {readReportEmailStatus} from './API/APIManager';

// My Reports may contain many cards. Limit owner-only status reads, and skip
// queued reads when their screen is no longer focused.
export const createReportEmailStatusReader = (fetchStatus, concurrency = 3) => {
  let active = 0;
  const queue = [];
  const drain = () => {
    while (active < concurrency && queue.length) {
      const job = queue.shift();
      if (!job.isActive()) {
        job.resolve(null);
        continue;
      }
      active += 1;
      Promise.resolve()
        .then(() => fetchStatus(job.owner, job.seq))
        .then(job.resolve, () => job.resolve(null))
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  };
  return (owner, seq, isActive = () => true) => {
    if (!owner || !Number.isInteger(Number(seq)) || Number(seq) <= 0) {
      return Promise.resolve(null);
    }
    return new Promise(resolve => {
      queue.push({owner, seq: Number(seq), isActive, resolve});
      drain();
    });
  };
};

export const readReportEmailStatusLimited = createReportEmailStatusReader(
  readReportEmailStatus,
);
