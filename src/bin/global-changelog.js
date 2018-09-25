#!/usr/bin/env node

import program from 'commander'
import { generate, init } from '..'

program
  .version('0.3.0')
  .description('Generate changelog of changelogs for some time period')
  .option('-t, --tag', 'with tagging to git')
  .option('-i, --init', 'create initiate tag')
  .action(() => {
    program.init
      ? init()
      : generate(program.tag)
  })
program.parse(process.argv)
