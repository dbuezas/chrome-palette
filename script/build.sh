#!/bin/bash

build() {
    echo 'building react'

    rm -rf dist/*
    rm chrome-palette.zip

    cp public/reload.html dist/popup.html
    cp public/reload.js dist/reload.js

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false
    export DISABLE_ESLINT_PLUGIN=true

    craco build

    mkdir -p dist
    cp -r build/* dist
    
    rm dist/popup.html

    mv dist/index.html dist/popup.html

    zip -r chrome-palette.zip dist/
}

build