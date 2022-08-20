#!/bin/bash
clean=${1:-0};
echo 'jde-iot-proto.sh';
pushd `pwd` > /dev/null;
pushd `pwd` > /dev/null;
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )";
if ! source $scriptDir/env.sh; then exit 1; fi;
cd $scriptDir/..;
baseDir=`pwd`;

popd > /dev/null;
$frameworkDir/jde-framework-proto.sh
cd node_modules/jde-cpp;

declare -A iotFiles;
if [ ! -f IotFromServer.d.ts ] || [ $clean == 1 ]; then iotFiles[IotfromServer]=iot_from_server_root; fi;
if [ ! -f IotFromClient.d.ts ] || [ $clean == 1 ]; then iotFiles[IotFromClient]=iot_from_client_root; fi;

create $jdeBash/IotWebsocket/source/types/proto iotFiles;

# declare -A blockly;
# if test ! -f blockly.d.ts; then blockly[blockly]=blockly_root; fi;
# create $blocklyProtoDir blockly;

popd > /dev/null;