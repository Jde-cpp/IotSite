#!/bin/bash
thisDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )";
baseDir=$thisDir;
webDir=$(dirname $(readlink -e $baseDir/..));
#materialDir=$(dirname $(readlink -e $baseDir/../MaterialSite/control))/control;
#blocklyDir=$(dirname $(readlink -e $baseDir/../WebBlockly/control))/control;
#blocklyProtoDir=$(dirname $(readlink -e $baseDir/../../Public/jde/blockly/types/proto))/proto;
jdeBash=$(dirname $(readlink -e $webDir));
frameworkDir=$webDir/WebFramework;
source $jdeBash/Framework/scripts/common.sh;
source $frameworkDir/scripts/common-proto.sh;