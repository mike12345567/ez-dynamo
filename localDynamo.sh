#!/bin/bash

pushd "$(dirname "$(readlink -f "$0")")" >/dev/null

mkdir -p local
mkdir -p local/db_store
export USE_PERSONAL_DYNAMO=DISABLED;

if [ "$1" = "clear" ]; then
    echo "Clearing local DB..."
    rm ./local/db_store/shared-local-instance.db >/dev/null 2>&1
    echo "Database cleared!"
    exit
fi

if [ "$1" = "stop" ]; then
    echo "Killing process..."
    kill $(ps aux | grep 'DynamoDBLocal.jar' | awk '{print $2}') >/dev/null 2>&1
    echo "Stopped process!"
    exit
fi

if [ "$1" = "gui" ]; then
    echo "Starting GUI - must have dynamodb-admin installed - command: 'sudo npm install -g dynamodb-admin'"
    export DYNAMO_ENDPOINT=http://localhost:8123; dynamodb-admin
    exit
fi

if [ "$1" = "update" ]; then
    echo "Updating local dynamo..."
    pushd local >/dev/null
    rm -rf db_store/
    rm -rf DynamoDBLocal_lib/
    rm -rf third_party_licenses/
    rm -f DynamoDBLocal.jar
    rm -f dynamo.tar.gz
    rm -f LICENSE.txt
    mkdir db_store/
    popd >/dev/null
    set "start"
fi

if [ "$1" = "start" ] || [ "$1" = "start-ci" ] || [ "$1" = "start-memory" ]; then
    pushd local >/dev/null
    if [ ! -f dynamo.tar.gz ]; then

        echo Downloading local dynamo...
        wget https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_latest.tar.gz -O dynamo.tar.gz

        echo Extracting DB files...
        tar -xvzf dynamo.tar.gz
    fi

    echo Checking Java version...
    if type -p java; then
        echo found java executable in PATH
        _java=java
    elif [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]];  then
        echo found java executable in JAVA_HOME
        _java="$JAVA_HOME/bin/java"
    else
        echo "no java"
        exit
    fi

    if [[ "$_java" ]]; then
        version=$("$_java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
        echo version "$version"
        if [[ "$version" > "1.5" ]]; then
            echo version is more than 1.6
        else
            echo version is less than 1.6
        fi
    fi

    echo Trying to kill old instance...
    kill $(ps aux | grep 'DynamoDBLocal.jar' | awk '{print $2}') 2> /dev/null

    if [ "$1" = "start" ]; then
        echo Starting DB....
        java -jar DynamoDBLocal.jar -port 8123 -dbPath db_store -sharedDb &
        sleep 2
        echo DB Started!
    elif [ "$1" = "start-ci" ]; then
        echo Starting DB for CI...
        java -Xmx1G -jar DynamoDBLocal.jar -port 8123 -dbPath db_store -sharedDb
    else
        echo Starting in memory...
        java -jar DynamoDBLocal.jar -port 8123 -inMemory &
    fi
    popd >/dev/null
    exit
fi

echo ""
echo "Please specify one of the following options:"
echo ""
echo "start - Start the local DynamoDB instance, install all required elements"
echo "start-ci - Start the instance but don't disconnect from the process"
echo "start-memory - Start the instance in a high speed but no storage mode"
echo "stop - Stop the local running DynamoDB instance"
echo "clear - empty to local dynamo database of tables and data"
echo "running - Outputs whether DynamoDB is currently running locally"
echo "gui - Boot up the dynamodb-admin client if installed pointed at the local Dynamo instance"
echo ""

popd >/dev/null

