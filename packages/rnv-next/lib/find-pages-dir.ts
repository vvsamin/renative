import fs from 'fs'
import path from 'path'

let pagesDir: string = null;

const existsSync = (f: string): boolean => {
  try {
    fs.accessSync(f, fs.constants.F_OK)
    return true
  } catch (_) {
    return false
  }
}

export function setPagesDir(dir: string): void {
  pagesDir = dir;
  console.log('set dir', pagesDir);
}

export function findPagesDir(dir: string): string {
  if (pagesDir) {
    console.log('return', pagesDir)
    return pagesDir;
  }
  // prioritize ./pages over ./src/pages
  let curDir = path.join(dir, 'pages')
  if (existsSync(curDir)) {
    console.log('return', curDir)
    return curDir
  }

  curDir = path.join(dir, 'src/pages')
  if (existsSync(curDir)) {
    console.log('return', curDir)
    return curDir
  }
  // Check one level up the tree to see if the pages directory might be there
  if (existsSync(path.join(dir, '..', 'pages'))) {
    throw new Error(
      '> No `pages` directory found. Did you mean to run `next` in the parent (`../`) directory?'
    )
  }

  throw new Error(
    "> Couldn't find a `pages` directory. Please create one under the project root"
  )
}