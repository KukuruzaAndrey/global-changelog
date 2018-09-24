import simpleGit from 'simple-git/promise';

const keyWord = 'CHANGELOG.md';
const startChar = '+';
const git = simpleGit(__dirname);
git.log()
    .then(log => log.all.map(comm => comm.hash))
    .then((hash) => git.diff([hash[15], hash[0]]))
    .then(diff => console.log(filterChangelogFromDiff(diff)));

const filterChangelogFromDiff = diff => {
    const filesDiff = diff.split('diff --git');
    const filtered = filesDiff
        .filter(fileDiff => fileDiff.split('\n')[0].includes(keyWord))
        .map(fileDiff => fileDiff
            .split('\n')
            .filter(line => line.includes(keyWord) || line.startsWith(startChar)));
    return filtered;
};

const buildData = (diff) => {

    const [head, ...tail] = diff;

};

const genChange = fileDiff => {
    const packageName = fileDiff[0].match(/packages\/(.+?)\//)[0];
    const changes = fileDiff.slice(3).map(line => line.substring(1));
    return {
        packageName,
        changes
    }
};
//return line.includes(keyWord) || line.startsWith(startChar);