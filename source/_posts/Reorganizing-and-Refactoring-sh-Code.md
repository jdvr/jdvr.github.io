---
title: Reorganizing and Refactoring on sh
date: 2017-08-20 15:59:21
cover: /images/2017/08/vista-de-cuenca.jpg
cover_caption: Vista desde un mirado de cuenca, Cuenca
id: 208
categories:
  - Programming
  - Refactoring
  - Legacy
  - Shell
tags:
---

During the last week I have been writing a script to manage the instances of a Redis Clusted. The ideas was to copy the features of ["create-cluster" scripts](https://github.com/antirez/redis/tree/unstable/utils/create-cluster), to create a production scripts that help us on our daily redis management.

This week I had to write, refactor and organize code in a very different ways. I would like to share some _easy steps_ to make bash scripts easier to read, debug and maintain. I have copied the "create-cluster" script to this [repository](https://github.com/jdvr/create-cluster) and I going to use it as example. The target script includes this features:

```
Usage: create-cluster [start|create|stop|watch|tail|clean]
start       -- Launch Redis Cluster instances.
create      -- Create a cluster using redis-trib create.
stop        -- Stop Redis Cluster instances.
watch       -- Show CLUSTER NODES output (first 30 lines) of first node.
tail <id>   -- Run tail -f of instance at base port + ID.
clean       -- Remove all instances data, logs, configs.
clean-logs  -- Remove just instances logs.
```

The script is just one [file](), at the start it loads a default configuration and check if a `config.sh` file exists, after that there are a lot of `if` statements  checking which command is requested as parameter and at the end if the parameter doesn't match any command it prints the help.

I am not going to paste every time the full file during the post to make this more readable, so I am going to just include the changes and a link to the commit.

## Refactor without tests?

I think that refactor without test is always a bad idea, you aren't able to verify if the code has exact the same behavior. How do I solve this? When developing anything over a language with a very good REPL you can use the REPL as a verified. You need to put a little manual effort but doing it slow and step by step will ensure you that the code has still the same behavior after a refactor. After every little focused change I run the "test" on the REPL and commit.

## Step 1: Extract commands to functions

I am going to explain the step by step of the `start` command and then repeat the same with the others.

The first thing is to extract the relative path to `redis-server` and remove the relative reference to make easier to move the code:

```sh
redis-server() {
  ../../src/redis-server $@
}

if [ "$1" == "start" ]
then
    while [ $((PORT < ENDPORT)) != "0" ]; do
        PORT=$((PORT+1))
        echo "Starting $PORT"
        redis-server --port $PORT --cluster-enabled yes --cluster-config-file nodes-${PORT}.conf --cluster-node-timeout $TIMEOUT --appendonly yes --appendfilename appendonly-${PORT}.aof --dbfilename dump-${PORT}.rdb --logfile ${PORT}.log --daemonize yes
    done
    exit 0
fi
```
[commit](https://github.com/jdvr/create-cluster/commit/c2ecbd3c1995f1fba70f5c0fcfb053e4180df6c4)

I am going to extract the code inside the `if` statement to a function:  `start_command`:

```sh
start_command() {
  while [ $((PORT < ENDPORT)) != "0" ]; do
      PORT=$((PORT+1))
      echo "Starting $PORT"
      redis-server --port $PORT --cluster-enabled yes --cluster-config-file nodes-${PORT}.conf --cluster-node-timeout $TIMEOUT --appendonly yes --appendfilename appendonly-${PORT}.aof --dbfilename dump-${PORT}.rdb --logfile ${PORT}.log --daemonize yes
  done
  exit 0
}

if [ "$1" == "start" ]
then
    start_command
fi
```
[commit](https://github.com/jdvr/create-cluster/commit/384cebee187850d928b25717fd74cf676c944e62)

I follow this two steps with the rest of the commands, check the change [here](https://github.com/jdvr/create-cluster/commit/7fcbb59a1350d6bbda88747a318df8dd3a93d5df), so I end with a function for each command a some function to remove relative paths.

# Step 2: Extract functions to different files

The next step is to move functions to different files, I am going to create one file for redis general functions:

```sh
redis-functions.sh

redis-server() {
  ../../src/redis-server $@
}

redis-trib() {
  ../../src/redis-trib.rb $@
}

redis-cli() {
  ../../src/redis-cli $@
}
```

Now, I just add `source "redis-functions.sh"` to main file and everything work.

[commit](https://github.com/jdvr/create-cluster/commit/394081d573d328ed79f694e8b721d4eaa8d08fa3)

In the same way I create a file for each command under the directory commands with the name _name.command.sh_ and import it at the start of the main file:

```sh
source other files

for f in $(ls commands); do source "commands/$f"; done
```

The new files can be found on this [commit](https://github.com/jdvr/create-cluster/commit/eb7fb837031ef7ff8cb9a2126837c52e2aee29f7).

# Step 3: Replacing conditional with data structure

After the las two step with have a script that is an interface between the commands and the user, remember how this tool is used: `create-cluster [start|stop|create...]`. This behavior is archive with a lot of `if`:

```sh
#import files
...
# check config
if [ "$1" == "start" ]
then
    start_command
fi

if [ "$1" == "create" ]
then
    create_command
fi

if [ "$1" == "stop" ]
then
  stop_command
fi
....
#more if's
```

The easier way to remove this structure is to introduce a map that related the command name with its executor (function):

```sh
declare -A commands

commands[start]=start_command
commands[create]=create_command
commands[stop]=stop_command
commands[watch]=watch_command
commands[tail]=tail_command
commands[call]=call_command
commands[clean]=clean_command
commands[clean-logs]=clean_logs_command
```

To execute a command, I just need to look up the first argument on the _map_:

```sh
${commands[$1]}
```

If this fails the next statement are a bunch of `echo` to print help, otherwise every command ends with a `exit 0`,  so after execute it the execution ends successfully.

The changed for this step can be found on this [commit](https://github.com/jdvr/create-cluster/commit/22fab6187380f5a0bb6f74c6bf79fae1506f6a79)

# Conclusions

This post just introduce some tips that for me improve and make a bit easier the work of the developer, a big script with hundred or even thousand lines are very difficult to change without introduce a bug. The steps I have followed are just basic knowledge and culture in other languages, we have a strong _clean-coder_ culture and we put a lot of efforts on other languages and platforms, so why shell/bash should be different?.
