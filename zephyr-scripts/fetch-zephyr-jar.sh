#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POM_DIR="$ROOT_DIR/zephyr-scripts/tools/zephyr"
JAR_DEST="$ROOT_DIR/lib/uk.gov.hmcts-zephyr-automation-independent.jar"

mkdir -p "$ROOT_DIR/lib"
mvn -f "$POM_DIR/pom.xml" package -DskipTests
cp "$POM_DIR/target/uk.gov.hmcts-zephyr-automation-independent.jar" "$JAR_DEST"
echo "Zephyr automation jar written to $JAR_DEST"
