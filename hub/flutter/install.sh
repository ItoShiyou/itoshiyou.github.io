#!/bin/bash
# Usage: install.sh <flutter app dir> <app id>
# Copies the promo kit into lib/promo/, adds dependencies and a unit test.
set -euo pipefail
APP="$1"; ID="$2"; KIT="$(cd "$(dirname "$0")" && pwd)"
PKG=$(grep -m1 '^name:' "$APP/pubspec.yaml" | awk '{print $2}')
mkdir -p "$APP/lib/promo" "$APP/test"
cp "$KIT/promo.dart" "$KIT/promo_widgets.dart" "$APP/lib/promo/"
sed -e "s/__PKG__/$PKG/g" -e "s/__ID__/$ID/g" "$KIT/promo_test.dart.tmpl" > "$APP/test/promo_test.dart"
cd "$APP"
grep -qE '^\s+shared_preferences:' pubspec.yaml || flutter pub add shared_preferences >/dev/null
grep -qE '^\s+url_launcher:' pubspec.yaml || flutter pub add url_launcher >/dev/null
echo "installed promo kit into $PKG ($ID)"
