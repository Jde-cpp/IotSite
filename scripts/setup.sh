#!/bin/bash
clean=${1:-0};
shouldFetch=${2:-1};
buildPrivate=${3:-0};
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $scriptDir/../../..;
JDE_BASH=`pwd`;
if ! source Framework/scripts/common-error.sh; then exit 1; fi;
source Framework/scripts/common.sh;
cd web;
fetchDir master WebFramework $shouldFetch;
fetchDir master MaterialSite $shouldFetch;
if (( $buildPrivate == 1 )); then fetchDir WebBlockly $shouldFetch; fi;
cd $scriptDir/..;
baseWebDir=$JDE_DIR/web;
cmd="../WebFramework/scripts/create-workspace.sh my-workspace $baseWebDir/MaterialSite $baseWebDir/WebFramework $JDE_DIR/Public/web/access $baseWebDir/IotSite";
if (( $buildPrivate == 1 )); then cmd="$cmd WebBlockly"; fi;
echo $cmd
$cmd; if [ $? -ne 0 ]; then echo `pwd`; echo $cmd; exit 1; fi;
echo `pwd`;
cd my-workspace;
ng build --output-hashing=none --source-map=true;

cd src;
sitePath=`realpath $scriptDir/../site`;
rm main.ts;
addHard main.ts $sitePath;
addHard styles.scss $sitePath;
addHard index.html $sitePath;
addHard favicon.ico $sitePath;
cd app;
echo `pwd`: addHard app_routing_module.ts $sitePath/app;
addHard app_routing_module.ts $sitePath/app;
addHard app.component.html $sitePath/app;
addHard app.component.scss $sitePath/app;
addHard app.component.ts $sitePath/app;
addHard app.module.ts $sitePath/app;
rm -f app.config.ts;
addHard app.config.ts $sitePath/app;
moveToDir services;
addHard environment.service.ts $sitePath/app/services;
cd ../..;
moveToDir environments;
addHard environment.ts $sitePath/environments;