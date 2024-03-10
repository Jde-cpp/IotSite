#!/bin/bash
clean=${1:-0};
echo 'jde-iot-proto.sh';
pushd `pwd` > /dev/null;
pushd `pwd` > /dev/null;
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )";
if ! source $scriptDir/env.sh; then exit 1; fi;
cd $scriptDir/..;

popd > /dev/null;
$frameworkDir/scripts/jde-framework-proto.sh
echo 'jde-framework-proto done';
cd projects/jde-iot/src/lib;
moveToDir proto;

declare -A commonFiles;
if [ ! -f FromServer.d.ts ] || [ $clean == 1 ]; then commonFiles[FromServer]=from_server_root; fi;
create $jdeBash/Public/src/web/proto commonFiles;

declare -A iotFiles;
if [ ! -f IotCommon.d.ts ] || [ $clean == 1 ]; then iotFiles[IotCommon]=iot_common_root; fi;
if [ ! -f IotFromServer.d.ts ] || [ $clean == 1 ]; then iotFiles[IotFromServer]=iot_from_server_root; fi;
if [ ! -f IotFromClient.d.ts ] || [ $clean == 1 ]; then iotFiles[IotFromClient]=iot_from_client_root; fi;
create $jdeBash/IotWebsocket/source/types/proto iotFiles;

popd > /dev/null;