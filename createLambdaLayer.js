const fs = require('fs')
const archiver = require('archiver')
const FS = require('fs-extra')
const path = require('path')
const { rimraf } = require('rimraf')

const fileUtils = require('@jsreport/jsreport-core/lib/main/extensions/fileUtils')

async function pckg() {
    if (fs.existsSync('layer.zip')) {
        fs.unlinkSync('layer.zip')
    }    

    const foldersToExcludeFromLambda = [      
        'node_modules/@jsreport/jsreport-studio',
        'node_modules/@jsreport/jsreport-authentication',
        'node_modules/@jsreport/jsreport-authorization',
        'node_modules/@jsreport/jsreport-cli',
        'node_modules/@jsreport/jsreport-express',
        'node_modules/@jsreport/jsreport-freeze',
        'node_modules/@jsreport/jsreport-import-export',
        'node_modules/@jsreport/jsreport-public-templates',
        'node_modules/@jsreport/jsreport-sample-template',
        'node_modules/@jsreport/jsreport-tags',
        'node_modules/@jsreport/jsreport-studio-theme-dark',
        'node_modules/@jsreport/jsreport-version-control'        
    ]

    // we exclude big dep aws-sdk only when not explicitely referenced in deps
    if (!JSON.parse(fs.readFileSync('package.json')).dependencies['aws-sdk']) {
        foldersToExcludeFromLambda.push('node_modules/aws-sdk')
    }

    for (const folder of foldersToExcludeFromLambda) {
        await FS.remove(path.basename(folder))
        await FS.move(folder, path.basename(folder))
    }

    await cleanup()   
    
    const output = fs.createWriteStream('layer.zip')
    const archive = archiver('zip')
    archive.pipe(output)
   
    // collect extensions paths, so we don't have to crawl in runtime
    // this helps just some 500ms for cold start
    const extensionPaths = fileUtils.walkSync('node_modules', 'jsreport.config.js')
    const relativeExtensionPaths = extensionPaths.map(p => path.relative(__dirname, p))
    // archiver.append is buggy and doesnt work, need to add through directory
    await FS.writeFile('node_modules/locations.json', JSON.stringify({
        locations: relativeExtensionPaths    
    }))

    archive.directory('node_modules/', 'nodejs/node_modules');  
    
    await archive.finalize()
    
    for (const folder of foldersToExcludeFromLambda) {
        await FS.move(path.basename(folder), folder)
    }
    
    console.log('layer.zip is ready')
}

async function cleanup() {
    const patterns = [
    `node_modules/ses`,    
    `node_modules/jsreport-exceljs/dist`,    
    `node_modules/winser-with-api`,
    `node_modules/@jsreport/**/main.js.map`,
    `node_modules/pdfjs-dist/build`,
    `node_modules/@jsreport/pdfjs/test`,
    `node_modules/@jsreport/pdfjs/playground`,    
    // wont be needed after we use just single pdfjs-dist
    'node_modules/@jsreport/pdfjs/node_modules/pdfjs-dist/legacy',
    `node_modules/**/Jenkinsfile`,
    `node_modules/**/Makefile`,
    `node_modules/**/Gulpfile.js`,
    `node_modules/**/Gruntfile.js`,
    `node_modules/**/gulpfile.js`,
    `node_modules/**/.DS_Store`,
    `node_modules/**/.tern-project`,
    `node_modules/**/.gitattributes`,
    `node_modules/**/.editorconfig`,
    `node_modules/**/.eslintrc`,
    `node_modules/**/.eslintrc.js`,
    `node_modules/**/.eslintrc.json`,
    `node_modules/**/.eslintrc.yml`,
    `node_modules/**/.eslintignore`,
    `node_modules/**/.stylelintrc`,
    `node_modules/**/stylelint.config.js`,
    `node_modules/**/.stylelintrc.json`,
    `node_modules/**/.stylelintrc.yaml`,
    `node_modules/**/.stylelintrc.yml`,
    `node_modules/**/.stylelintrc.js`,
    `node_modules/**/.htmllintrc`,
    `node_modules/**/.lint`,
    `node_modules/**/.npmrc`,
    `node_modules/**/.npmignore`,
    `node_modules/**/.jshintrc`,
    `node_modules/**/.flowconfig`,
    `node_modules/**/.documentup.json`,
    `node_modules/**/.yarn-metadata.json`,
    `node_modules/**/.travis.yml`,
    `node_modules/**/appveyor.yml`,
    `node_modules/**/.gitlab-ci.yml`,
    `node_modules/**/circle.yml`,
    `node_modules/**/.coveralls.yml`,
    `node_modules/**/CHANGES`,
    `node_modules/**/changelog`,
    `node_modules/**/LICENSE.txt`,
    `node_modules/**/LICENSE`,
    `node_modules/**/LICENSE-MIT`,
    `node_modules/**/LICENSE-MIT.txt`,
    `node_modules/**/LICENSE.BSD`,
    `node_modules/**/license`,
    `node_modules/**/LICENCE.txt`,
    `node_modules/**/LICENCE`,
    `node_modules/**/LICENCE-MIT`,
    `node_modules/**/LICENCE-MIT.txt`,
    `node_modules/**/LICENCE.BSD`,
    `node_modules/**/licence`,
    `node_modules/**/AUTHORS`,
    `node_modules/**/VERSION`,
    `node_modules/**/CONTRIBUTORS`,
    `node_modules/**/.yarn-integrity`,
    `node_modules/**/.yarnclean`,
    `node_modules/**/_config.yml`,
    `node_modules/**/.babelrc`,
    `node_modules/**/.yo-rc.json`,
    `node_modules/**/jest.config.js`,
    `node_modules/**/karma.conf.js`,
    `node_modules/**/wallaby.js`,
    `node_modules/**/wallaby.conf.js`,
    `node_modules/**/.prettierrc`,
    `node_modules/**/.prettierrc.yml`,
    `node_modules/**/.prettierrc.toml`,
    `node_modules/**/.prettierrc.js`,
    `node_modules/**/.prettierrc.json`,
    `node_modules/**/prettier.config.js`,
    `node_modules/**/.appveyor.yml`,
    `node_modules/**/tsconfig.json`,
    `node_modules/**/tslint.json`]

    const { default: limit } = await import('p-limit')
    const pLimit = limit(5)
    return Promise.all(patterns.map((p) => pLimit(() => rimraf(p, { glob: true }))))
}

pckg().catch(console.error)