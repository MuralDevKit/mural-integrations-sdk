#!/bin/bash

pushd mural-client; npm run clean; npm run build; popd
pushd mural-canvas; npm run clean; npm run build; popd
pushd mural-picker; npm run clean; npm run build; popd
