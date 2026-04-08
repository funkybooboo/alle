#!/usr/bin/env bash
# Sets up Playwright browser dependencies on Arch Linux.
#
# Playwright targets Ubuntu and version-locks its binary deps. On Arch we need
# to bridge the gap with symlinks and stub libraries for the unavailable libs.
#
# What this script does:
#   1. Installs flite (TTS voices) and libjxl via pacman
#   2. Installs icu74 from AUR (Playwright's webkit needs ICU 74 symbols)
#   3. Creates soname symlinks for libxml2 and libjxl (Arch ships newer versions)
#   4. Compiles and installs stub .so files for missing flite voice libraries
#      (Arch's flite package ships fewer voices than Ubuntu's libflite1)
#   5. Runs playwright install to download browser binaries

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Installing system packages"
sudo pacman -S --needed --noconfirm flite libjxl

echo "==> Installing icu74 from AUR"
# Remove any stale symlinks that would conflict with the real package
sudo rm -f /usr/lib/libicudata.so.74 /usr/lib/libicui18n.so.74 /usr/lib/libicuuc.so.74
if pacman -Q icu74 &>/dev/null; then
    echo "    icu74 already installed, skipping"
else
    if command -v yay &>/dev/null; then
        yay -S --needed icu74
    elif command -v paru &>/dev/null; then
        paru -S --needed icu74
    else
        echo "ERROR: No AUR helper found (yay or paru). Install icu74 manually then re-run."
        exit 1
    fi
fi

echo "==> Creating soname symlinks for versioned libraries"
# libxml2: Arch ships .so.16, Playwright's webkit expects .so.2
if [ ! -e /usr/lib/libxml2.so.2 ]; then
    sudo ln -s /usr/lib/libxml2.so.16 /usr/lib/libxml2.so.2
    echo "    created libxml2.so.2 -> libxml2.so.16"
else
    echo "    libxml2.so.2 already exists, skipping"
fi

# libjxl: Arch ships .so.0.11, Playwright's webkit expects .so.0.8
if [ ! -e /usr/lib/libjxl.so.0.8 ]; then
    sudo ln -s /usr/lib/libjxl.so.0.11 /usr/lib/libjxl.so.0.8
    echo "    created libjxl.so.0.8 -> libjxl.so.0.11"
else
    echo "    libjxl.so.0.8 already exists, skipping"
fi

echo "==> Compiling flite voice stubs"
# Arch's flite package ships fewer voice libraries than Ubuntu's libflite1.
# Playwright's webkit binary has hard ELF dependencies on these voice .so files.
# Stub implementations return NULL (voice unavailable) so the browser still starts.
STUB_SRC="$(mktemp /tmp/flite_stubs_XXXXXX.c)"
STUB_LIB="$(mktemp /tmp/libflite_stubs_XXXXXX.so)"
trap 'rm -f "$STUB_SRC" "$STUB_LIB"' EXIT

cat > "$STUB_SRC" << 'EOF'
/* Stub flite voice registration functions missing from Arch's flite package.
   Returning NULL marks the voice as unavailable; WebKit handles this gracefully. */
void *register_cmu_us_awb(const char *voxdir)       { return 0; }
void *register_cmu_us_kal(const char *voxdir)       { return 0; }
void *register_cmu_us_rms(const char *voxdir)       { return 0; }
void *register_cmu_us_slt(const char *voxdir)       { return 0; }
void *register_cmu_time_awb(const char *voxdir)     { return 0; }
void *register_cmu_grapheme_lang(const char *voxdir){ return 0; }
void *register_cmu_grapheme_lex(const char *voxdir) { return 0; }
EOF

gcc -shared -fPIC -o "$STUB_LIB" "$STUB_SRC"

STUB_VOICES=(
    libflite_cmu_us_awb.so.1
    libflite_cmu_us_kal.so.1
    libflite_cmu_us_rms.so.1
    libflite_cmu_us_slt.so.1
    libflite_cmu_time_awb.so.1
    libflite_cmu_grapheme_lang.so.1
    libflite_cmu_grapheme_lex.so.1
)

for voice in "${STUB_VOICES[@]}"; do
    sudo cp "$STUB_LIB" "/usr/lib/$voice"
    echo "    installed /usr/lib/$voice"
done

echo "==> Updating ldconfig cache"
sudo ldconfig

echo "==> Installing Playwright browser binaries"
cd "$REPO_ROOT"
bunx playwright install

echo ""
echo "Done. Run 'mise run test-e2e' to verify."
