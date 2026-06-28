.PHONY: help mobile-ios-xcode mobile-ios-device mobile-ios-build

MOBILE_DIR := apps/mobile
IOS_WORKSPACE := $(MOBILE_DIR)/ios/AdventurersLog.xcworkspace
IOS_SCHEME := AdventurersLog
IOS_DEVICE ?= Ross’s iPhone
IOS_CONFIGURATION ?= Debug
IOS_DERIVED_DATA ?= $(MOBILE_DIR)/ios/build

help:
	@echo "Available targets:"
	@echo "  make mobile-ios-device  Build, install, and launch the mobile app on $(IOS_DEVICE)"
	@echo "  make mobile-ios-xcode   Open the iOS workspace in Xcode"
	@echo "  make mobile-ios-build   Build the iOS app for $(IOS_DEVICE) with xcodebuild"
	@echo ""
	@echo "Override device if needed: make mobile-ios-device IOS_DEVICE=\"My iPhone\""

mobile-ios-xcode:
	open "$(IOS_WORKSPACE)"
	@echo "In Xcode, select the $(IOS_SCHEME) scheme and the '$(IOS_DEVICE)' run destination, then press Run."

mobile-ios-device:
	pnpm --dir "$(MOBILE_DIR)" exec expo run:ios --device "$(IOS_DEVICE)"

mobile-ios-build:
	xcodebuild \
		-workspace "$(IOS_WORKSPACE)" \
		-scheme "$(IOS_SCHEME)" \
		-configuration "$(IOS_CONFIGURATION)" \
		-destination "platform=iOS,name=$(IOS_DEVICE)" \
		-derivedDataPath "$(IOS_DERIVED_DATA)" \
		-allowProvisioningUpdates \
		build
