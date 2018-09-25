#!/usr/bin/env node
import simpleGit from 'simple-git/promise'
import showdown from 'showdown'
import fs from 'fs'

const keyWord = 'changelog'
const startChar = '+'
const git = simpleGit('./')

export const generate = (isCreateCommit) => {
  let numberChangelogTag
  git.log()
    .then(commitList => commitList.latest)
    .then(latestCommit => {
      git.tags({
        '--sort': '-creatordate'
      }, '-l', `"${keyWord}*"`)
        .then(tagList => {
          const latestChangelogTag = tagList.all.filter(tag => tag.startsWith(keyWord))[0]
          numberChangelogTag = Number(latestChangelogTag.match(/\d+/))
          return latestChangelogTag
        })
        .then(latestChangelogTag => git.diff([latestChangelogTag, latestCommit.hash]))
        .then(diff => buildData(diff))
        .then(changes => {
          if (isCreateCommit) {
            htmlRender(changes)
              .then(html => fs.appendFile('global-changelog.html', html, 'utf8', err => {
                if (err) throw err
                console.log('Changelog generate successfully')
              }))
              .then(() => git.addAnnotatedTag(`changelog-${numberChangelogTag + 1}`, 'generate global changelog'))
              .catch(er => console.log(er))
          } else {
            rawRender(changes)
              .then(text => console.log(text))
          }
        })
        .catch(er => console.log(er))
    })
    .catch(er => console.log(er))
}

export const init = () => {
  git.addAnnotatedTag(`changelog-0`, 'initiate global changelog').catch(err => console.log(err))
  console.log('initiate tag create')
}

const buildData = (rawDiff) => {
  const filterChangelogFromDiff = diff => {
    const filesDiff = diff.split('diff --git')
    return filesDiff
      .filter(fileDiff => fileDiff.split('\n')[0].includes(keyWord.toUpperCase()))
      .map(fileDiff => fileDiff
        .split('\n')
        .filter(line => line.includes(keyWord.toUpperCase()) || line.startsWith(startChar)))
  }
  const fileChange = fileDiff => {
    const packageName = fileDiff[0].match(/packages\/(.+?)\//)[1]
    const changes = fileDiff.slice(3).map(line => line.substring(1)).join('\n')
    return {
      packageName,
      changes
    }
  }
  return new Promise((resolve, reject) => {
    const filteredDiff = filterChangelogFromDiff(rawDiff)
    resolve(filteredDiff.map(fileDiff => fileChange(fileDiff)))
  })
}

const htmlRender = data => {
  return new Promise((resolve, reject) => {
    const mdConverter = new showdown.Converter()
    const output = data.map(obj => {
      return [`<h2>Package ${obj.packageName}</h2>`,
        mdConverter.makeHtml(obj.changes)].join('\n')
    }).join('<br>')
    resolve(output)
  })
}

const rawRender = data => {
  return new Promise((resolve, reject) => {
    const output = data.map(obj => {
      return [`Package ${obj.packageName}`,
        obj.changes].join('\n')
    }).join('\n\n')
    resolve(output)
  })
}
