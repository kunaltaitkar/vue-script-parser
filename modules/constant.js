

const pattern = {
    dataRegex: /data\s*\(\s*\)\s*\{\s*return\s*{([^]*)}/g,
    mountedRegex: /mounted\s*\(\s*\)\s*{([^]*)}/g,
    methodsRegex: /methods\s*:\s*{([^]*)}/g
}

Object.freeze(pattern)

export { pattern }


