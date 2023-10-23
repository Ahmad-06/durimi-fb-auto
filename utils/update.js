const { execSync } = require('node:child_process');

const fetch = require('node-fetch');

const getLocalCommit = () => {
    const commitHash = Buffer.from(execSync('git rev-parse HEAD', { windowsHide: true }))
        .toString()
        .replace('\n', '');
    const commitTime = new Date(
        Buffer.from(execSync(`git show --no-patch --format=%ci ${commitHash}`, { windowsHide: true }))
            .toString()
            .replace('\n', ''),
    ).getTime();

    return {
        commitHash,
        commitTime,
    };
};

const getRemoteCommit = async () => {
    const resp = await fetch('https://vultr-api.srvr.run/commit');
    const data = await resp.json();

    const commitHash = data.sha;
    const commitTime = new Date(data.commit.author.date).getTime();

    return {
        commitHash,
        commitTime,
    };
};

module.exports = async () => {
    const localCommit = getLocalCommit();
    const remoteCommit = await getRemoteCommit();

    if (localCommit.commitHash !== remoteCommit.commitHash && localCommit.commitTime < remoteCommit.commitTime)
        return true;

    return false;
};
