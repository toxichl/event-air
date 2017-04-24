#!/usr/bin/env node
var rollup = require("rollup")
var babel = require("rollup-plugin-babel")
var eslint = require('rollup-plugin-eslint')
var resolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')
var replace = require('rollup-plugin-replace')
var uglify = require('rollup-plugin-uglify')
var argv = require('yargs')
    .option('p', {
        alias: 'prob',
        default: true,
        boolean: true,
        describe: 'is production enviroment',
        type: 'boolean'
    })
    .argv;
var isProb = argv.p;

var build = function (opts) {
    rollup.rollup({
        entry: 'src/' + opts.entry,
        plugins: (opts.plugins || []).concat([
            resolve({
                // 帮助 node 模块迁移到ES2015
                jsnext: true,
                // main 和 browser 帮助插件决定哪个文件应该被bunble文件使用
                main: true,
                browser: true,
            }),
            commonjs(),
            babel({
                exclude: 'node_modules/**'
            }),
            eslint({
                exclude: 'src/styles/**'
            }),
            replace({
                exclude: 'node_modules/**',
                ENV: JSON.stringify(process.env.NODE_ENV || 'development').replace(/\s/g, ''),
            }),
        ])
    })
        .then(function (bundle) {
            var dest = 'lib/' + (opts.output || opts.entry)
            bundle.write({
                format: "umd",
                moduleName: opts.moduleName || 'D',
                dest: dest,
                // sourceMap: 'inline'
            });
        })
        .catch(function (err) {
            console.log(err)
        })
}

build({
    entry: 'event.js',
    output: 'event-air.js'
})

// build({
//     entry: 'index.js',
//     output: 'test.js'
// })

if (isProb) {
    console.log('Is Production Enviroment')
    build({
        entry: 'event.js',
        output: 'event-air.min.js',
        plugins: [uglify()]
    })
}



