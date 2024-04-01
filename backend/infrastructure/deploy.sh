#!/usr/bin/env bash

set -ex

sam build -t compute.yaml
sam deploy --profile pcd-homework-2 -t db.yaml --stack-name pcd-homework-2-db
sam deploy --profile pcd-homework-2 -t cache.yaml --stack-name pcd-homework-2-cache
sam deploy --profile pcd-homework-2 -t compute.yaml --stack-name pcd-homework-2-compute
