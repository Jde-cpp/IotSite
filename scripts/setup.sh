#!/bin/bash
clean=${1:-0};
shouldFetch=${2:-1};
buildPrivate=${3:-0};
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $scriptDir/../../..;
JDE_BASH=`pwd`;
source Framework/common.sh;
cd web;
fetchDir WebFramework $shouldFetch;
fetchDir MaterialSite $shouldFetch;
if (( $buildPrivate == 1 )); then fetchDir WebBlockly $shouldFetch; fi;
cd $scriptDir/..;

cmd="../WebFramework/create-workspace.sh my-workspace MaterialSite WebFramework IotSite";
if (( $buildPrivate == 1 )); then cmd="$cmd WebBlockly"; fi;
echo $cmd
$cmd; if [ $? -ne 0 ]; then echo `pwd`; echo $cmd; exit 1; fi;
echo `pwd`;
cd my-workspace;
#moveToDir src;
#moveToDir assets; moveToDir img;
#cd ..;
#cd ../..;
echo add not safari `pwd`
echo "not ios_saf 15.2-15.3" >> .browserslistrc;
echo "not safari 15.2-15.3" >> .browserslistrc;  #todo remove at some point.
echo add not safari done
ng build --output-hashing=none --source-map=true;