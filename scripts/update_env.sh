#!/usr/bin/env bash

FILE=./env2

function echo_env() {
  env_var=$1
  echo "${env_var}"="${!env_var}"
}

{
  echo_env CLIENT_ID;
  echo_env CLIENT_SECRET;
  echo_env REFRESH_TOKEN;
  echo_env CMC_API_KEY;
} > ${FILE}



