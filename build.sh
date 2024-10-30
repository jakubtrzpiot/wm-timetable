#!/bin/bash

cd android && ./gradlew assembleRelease 
cd .. && cp android/app/build/outputs/apk/release/app-release.apk ./build/planwm$1.apk
printf "<---Build finished!--->\nYou can find the apk in build/planwm$1.apk"