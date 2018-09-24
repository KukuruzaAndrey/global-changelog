import simpleGit from 'simple-git';

const git = simpleGit(__dirname);
git.log((err, log) => console.log(log));