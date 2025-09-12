#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Function to prompt user for choice
prompt_choice() {
    local prompt="$1"
    local choice1="$2"
    local choice2="$3"
    local default="$4"
    
    while true; do
        print_color $BLUE "$prompt"
        print_color $YELLOW "1) $choice1"
        print_color $YELLOW "2) $choice2"
        if [ -n "$default" ]; then
            print_color $YELLOW "3) $default"
        fi
        echo -n "Enter your choice [1-3]: "
        read -r choice
        
        case $choice in
            1)
                return 1
                ;;
            2)
                return 2
                ;;
            3)
                if [ -n "$default" ]; then
                    return 3
                else
                    print_color $RED "Invalid choice. Please enter 1 or 2."
                    continue
                fi
                ;;
            "")
                if [ -n "$default" ]; then
                    return 3
                else
                    print_color $RED "Invalid choice. Please enter 1 or 2."
                    continue
                fi
                ;;
            *)
                print_color $RED "Invalid choice. Please enter 1, 2, or 3."
                continue
                ;;
        esac
    done
}

# Function to build debug version
build_debug() {
    local start_time=$(date +%s)
    print_color $BLUE "🔨 Building DEBUG version..."
    
    echo "Bundling Android app (debug)"
    yarn android:bundle
    
    cd android
    
    echo "Cleaning Android app"
    ./gradlew clean
    
    echo "Assembling Android app (debug)"
    ./gradlew assembleDebug
    
    cd ../
    
    local end_time=$(date +%s)
    local build_time=$((end_time - start_time))
    
    print_color $GREEN "✅ Android DEBUG app built successfully!"
    print_color $YELLOW "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    print_color $BLUE "⏱️  Build time: ${build_time} seconds"
    
    # Check if APK exists and show size
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        local apk_size=$(du -h "android/app/build/outputs/apk/debug/app-debug.apk" | cut -f1)
        print_color $YELLOW "📦 APK size: $apk_size"
    fi
}

# Function to build release version
build_release() {
    local start_time=$(date +%s)
    print_color $BLUE "🔨 Building RELEASE version..."
    
    echo "Bundling Android app (release)"
    yarn android:bundle
    
    cd android
    
    echo "Cleaning Android app"
    ./gradlew clean
    
    echo "Assembling Android app (release)"
    ./gradlew assembleRelease
    
    cd ../
    
    local end_time=$(date +%s)
    local build_time=$((end_time - start_time))
    
    print_color $GREEN "✅ Android RELEASE app built successfully!"
    print_color $YELLOW "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    print_color $BLUE "⏱️  Build time: ${build_time} seconds"
    
    # Check if APK exists and show size
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        local apk_size=$(du -h "android/app/build/outputs/apk/release/app-release.apk" | cut -f1)
        print_color $YELLOW "📦 APK size: $apk_size"
    fi
}

# Function to build both versions
build_both() {
    local start_time=$(date +%s)
    print_color $BLUE "🔨 Building BOTH debug and release versions..."
    
    echo "Bundling Android app"
    yarn android:bundle
    
    cd android
    
    echo "Cleaning Android app"
    ./gradlew clean
    
    echo "Assembling Android app (debug)"
    ./gradlew assembleDebug
    
    echo "Assembling Android app (release)"
    ./gradlew assembleRelease
    
    cd ../
    
    local end_time=$(date +%s)
    local build_time=$((end_time - start_time))
    
    print_color $GREEN "✅ Both Android versions built successfully!"
    print_color $YELLOW "📱 Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
    print_color $YELLOW "📱 Release APK: android/app/build/outputs/apk/release/app-release.apk"
    print_color $BLUE "⏱️  Total build time: ${build_time} seconds"
    
    # Check if APKs exist and show sizes
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        local debug_size=$(du -h "android/app/build/outputs/apk/debug/app-debug.apk" | cut -f1)
        print_color $YELLOW "📦 Debug APK size: $debug_size"
    fi
    
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        local release_size=$(du -h "android/app/build/outputs/apk/release/app-release.apk" | cut -f1)
        print_color $YELLOW "📦 Release APK size: $release_size"
    fi
}

# Function to show usage
show_usage() {
    print_color $BLUE "Usage: $0 [OPTION]"
    echo ""
    print_color $YELLOW "Options:"
    echo "  debug     Build debug version only"
    echo "  release   Build release version only"
    echo "  both      Build both debug and release versions"
    echo "  --help    Show this help message"
    echo ""
    print_color $YELLOW "If no option is provided, the script will run interactively."
    echo ""
}

# Function to get app version
get_app_version() {
    if [ -f "version.json" ]; then
        local version=$(grep -o '"version": "[^"]*"' version.json | cut -d'"' -f4)
        echo "$version"
    elif [ -f "package.json" ]; then
        local version=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
        echo "$version"
    else
        echo "Unknown"
    fi
}

# Main script
print_color $GREEN "🚀 CleanApp Android Build Script"
print_color $BLUE "=================================="

# Display version information
app_version=$(get_app_version)
print_color $YELLOW "📱 App Version: $app_version"
print_color $BLUE "🕐 Build started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    print_color $RED "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    print_color $RED "❌ Error: yarn is not installed or not in PATH"
    exit 1
fi

# Check if gradlew is executable
if [ ! -x "android/gradlew" ]; then
    print_color $YELLOW "⚠️  Making gradlew executable..."
    chmod +x android/gradlew
fi

# Handle command line arguments
if [ $# -eq 0 ]; then
    # Interactive mode
    prompt_choice "What type of build would you like to create?" "Debug" "Release" "Both (Debug + Release)"
    choice=$?
else
    # Command line mode
    case "$1" in
        debug)
            choice=1
            print_color $BLUE "🔨 Building DEBUG version (command line mode)..."
            ;;
        release)
            choice=2
            print_color $BLUE "🔨 Building RELEASE version (command line mode)..."
            ;;
        both)
            choice=3
            print_color $BLUE "🔨 Building BOTH versions (command line mode)..."
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_color $RED "❌ Error: Unknown option '$1'"
            echo ""
            show_usage
            exit 1
            ;;
    esac
fi

# Execute the chosen build
case $choice in
    1)
        build_debug
        ;;
    2)
        build_release
        ;;
    3)
        build_both
        ;;
esac

print_color $GREEN "🎉 Build process completed!"
print_color $BLUE "🕐 Build finished at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
print_color $BLUE "💡 Tip: You can also run this script with arguments:"
print_color $YELLOW "   ./build-release.sh debug    - Build debug only"
print_color $YELLOW "   ./build-release.sh release  - Build release only"
print_color $YELLOW "   ./build-release.sh both     - Build both versions"
print_color $YELLOW "   ./build-release.sh --help   - Show help message"
echo ""
print_color $GREEN "🚀 Happy coding!"