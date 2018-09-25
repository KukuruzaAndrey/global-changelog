#!/usr/bin/env node

import program from 'commander'
import generateChangelog from '..'

program
    .version('0.2.1')
    .description('Generate changelog of changelogs for some time period')
    .option('-c, --commit', 'With commit tag')
    .action(() => {
        generateChangelog(program.commit)
    });
program.parse(process.argv);