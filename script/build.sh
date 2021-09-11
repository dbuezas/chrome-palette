#!/bin/bash

build() {
    echo 'building react'

    # rm -rf dist/*
    cp dist/reload.html dist/popup.html

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false
    export DISABLE_ESLINT_PLUGIN=true

    craco build

    mkdir -p dist
    cp -r build/* dist
    
    rm dist/popup.html

    mv dist/index.html dist/popup.html
}

build