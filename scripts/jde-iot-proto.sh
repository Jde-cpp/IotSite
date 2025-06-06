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

#declare -A commonFiles;
#if [ ! -f Common.d.ts ] || [ $clean == 1 ]; then commonFiles[Common]=common_root; fi;
#create $jdeBash/Public/libs/app/shared/proto commonFiles;

declare -A opcFiles;
if [ ! -f Common.d.ts ] || [ $clean == 1 ]; then opcFiles[Common]=common_root; fi;
if [ ! -f Opc.Common.d.ts ] || [ $clean == 1 ]; then opcFiles[Opc.Common]=opc_common_root; fi;
if [ ! -f Opc.FromServer.d.ts ] || [ $clean == 1 ]; then opcFiles[Opc.FromServer]=opc_from_server_root; fi;
if [ ! -f Opc.FromClient.d.ts ] || [ $clean == 1 ]; then opcFiles[Opc.FromClient]=opc_from_client_root; fi;
create $jdeBash/Public/libs/opc/src/types/proto opcFiles;

popd > /dev/null;