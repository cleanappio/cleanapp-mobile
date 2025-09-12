import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * App Version Service
 * Provides consistent access to app version information across platforms
 */
class AppVersionService {
  constructor() {
    this._version = null;
    this._buildNumber = null;
    this._versionCode = null;
    this._bundleId = null;
  }

  /**
   * Get the app version (e.g., "3.2.8")
   * @returns {Promise<string>}
   */
  async getVersion() {
    if (this._version) return this._version;

    try {
      this._version = await DeviceInfo.getVersion();
      return this._version;
    } catch (error) {
      console.error('Error getting app version:', error);
      return 'Unknown';
    }
  }

  /**
   * Get the build number (iOS) or version code (Android)
   * @returns {Promise<string|number>}
   */
  async getBuildNumber() {
    if (this._buildNumber) return this._buildNumber;

    try {
      if (Platform.OS === 'ios') {
        this._buildNumber = await DeviceInfo.getBuildNumber();
      } else {
        this._buildNumber = await DeviceInfo.getVersion();
      }
      return this._buildNumber;
    } catch (error) {
      console.error('Error getting build number:', error);
      return 'Unknown';
    }
  }

  /**
   * Get the version code (Android specific)
   * @returns {Promise<number>}
   */
  async getVersionCode() {
    if (this._versionCode) return this._versionCode;

    try {
      if (Platform.OS === 'android') {
        this._versionCode = DeviceInfo.getVersion();
      } else {
        // For iOS, we'll use the build number as version code
        this._versionCode = DeviceInfo.getBuildNumber();
      }
      return this._versionCode;
    } catch (error) {
      console.error('Error getting version code:', error);
      return 0;
    }
  }

  /**
   * Get the bundle identifier
   * @returns {Promise<string>}
   */
  async getBundleId() {
    if (this._bundleId) return this._bundleId;

    try {
      this._bundleId = DeviceInfo.getBundleId();
      return this._bundleId;
    } catch (error) {
      console.error('Error getting bundle ID:', error);
      return 'Unknown';
    }
  }

  /**
   * Get the full version string (e.g., "3.2.8 (21)")
   * @returns {Promise<string>}
   */
  async getFullVersionString() {
    try {
      const version = await this.getVersion();
      const buildNumber = await this.getBuildNumber();
      return `${version} (${buildNumber})`;
    } catch (error) {
      console.error('Error getting full version string:', error);
      return 'Unknown';
    }
  }

  /**
   * Get the app name
   * @returns {Promise<string>}
   */
  async getAppName() {
    try {
      return await DeviceInfo.getApplicationName();
    } catch (error) {
      console.error('Error getting app name:', error);
      return 'CleanApp';
    }
  }

  /**
   * Get all version information as an object
   * @returns {Promise<Object>}
   */
  async getAllVersionInfo() {
    try {
      const [version, buildNumber, versionCode, bundleId, appName] =
        await Promise.all([
          this.getVersion(),
          this.getBuildNumber(),
          this.getVersionCode(),
          this.getBundleId(),
          this.getAppName(),
        ]);

      return {
        version,
        buildNumber,
        versionCode,
        bundleId,
        appName,
        platform: Platform.OS,
        fullVersionString: `${version} (${buildNumber})`,
      };
    } catch (error) {
      console.error('Error getting all version info:', error);
      return {
        version: 'Unknown',
        buildNumber: 'Unknown',
        versionCode: 0,
        bundleId: 'Unknown',
        appName: 'CleanApp',
        platform: Platform.OS,
        fullVersionString: 'Unknown',
      };
    }
  }

  /**
   * Check if the current version is newer than the provided version
   * @param {string} compareVersion - Version to compare against (e.g., "3.2.7")
   * @returns {Promise<boolean>}
   */
  async isNewerThan(compareVersion) {
    try {
      const currentVersion = await this.getVersion();
      return this.compareVersions(currentVersion, compareVersion) > 0;
    } catch (error) {
      console.error('Error comparing versions:', error);
      return false;
    }
  }

  /**
   * Compare two version strings
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  }
}

// Export a singleton instance
export default new AppVersionService();
