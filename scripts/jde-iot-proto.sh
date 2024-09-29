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
if [ ! -f Common.d.ts ] || [ $clean == 1 ]; then commonFiles[Common]=common_root; fi;
create $jdeBash/Public/src/app/shared/proto commonFiles;

declare -A iotFiles;
if [ ! -f Iot.Common.d.ts ] || [ $clean == 1 ]; then iotFiles[Iot.Common]=iot_common_root; fi;
if [ ! -f Iot.FromServer.d.ts ] || [ $clean == 1 ]; then iotFiles[Iot.FromServer]=iot_from_server_root; fi;
if [ ! -f Iot.FromClient.d.ts ] || [ $clean == 1 ]; then iotFiles[Iot.FromClient]=iot_from_client_root; fi;
create $jdeBash/Public/src/iot/types/proto iotFiles;

popd > /dev/null;