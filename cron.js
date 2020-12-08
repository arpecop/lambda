const request = require('request');

const async = require('async');
const cron = require('node-cron');

let id;
// Create a never-ending interval. This should guarantee that the node process
// never exits, since it's never cleared.1111
const cronst = async () => {
  console.log('calling get');

  const arr = ['dir?section=life', 'dir?section=dnes', 'darik', 'pr0gramm'];
  async.each(
    arr,
    (i, callback) => {
      request.get(`https://lambdata.herokuapp.com/la/${i}`, () => {
        callback();
      });
    },
    () =>
      new Promise(resolve => {
        resolve('ok');
      })
  );
};

cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
  cronst();
});
