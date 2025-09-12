import {getReportsByLatLon} from './API/APIManager';
import {getMapLocation, getWalletAddress} from './DataManager';
import {getLocation} from '../functions/geolocation';

class PollingService {
  constructor() {
    this.interval = null;
    this.isPolling = false;
    this.dispatch = null;
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch;
  }

  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;

    // Initial call
    this.fetchData();

    // Set up interval (30 seconds)
    this.interval = setInterval(() => {
      this.fetchData();
    }, 30000);
  }

  stopPolling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isPolling = false;
  }

  async fetchData() {
    try {
      // Get wallet address for API calls
      const walletAddress = await getWalletAddress();

      if (!walletAddress) {
        console.log('No wallet address, skipping poll');
        return;
      }

      let mapLocation = await getMapLocation();

      // // Fallback to current location if map location is not available
      // if (!mapLocation || !mapLocation.latitude || !mapLocation.longitude) {
      //   console.log(
      //     'No map location available, trying to get current location...',
      //   );

      // Dispatch that we're starting to fetch location
      if (this.dispatch) {
        this.dispatch({
          type: 'SET_FETCHING_LOCATION',
          isFetchingLocation: true,
        });
      }

      try {
        const currentLocation = await getLocation();
        if (
          currentLocation &&
          currentLocation.latitude &&
          currentLocation.longitude
        ) {
          mapLocation = currentLocation;
          console.log('Using current location:', currentLocation);
        } else {
          console.log('No location available, skipping poll');
          // Dispatch that location fetching is complete (failed)
          if (this.dispatch) {
            this.dispatch({
              type: 'SET_FETCHING_LOCATION',
              isFetchingLocation: false,
            });
          }
          return;
        }
      } catch (locationError) {
        console.error('Failed to get current location:', locationError);
        // Dispatch that location fetching is complete (failed)
        if (this.dispatch) {
          this.dispatch({
            type: 'SET_FETCHING_LOCATION',
            isFetchingLocation: false,
          });
        }
        return;
      } finally {
        // Always dispatch that location fetching is complete (success)
        if (this.dispatch) {
          this.dispatch({
            type: 'SET_FETCHING_LOCATION',
            isFetchingLocation: false,
          });
        }
      }
      // }

      const {latitude, longitude} = mapLocation;

      if (this.dispatch) {
        this.dispatch({
          type: 'SET_FETCHING_REPORTS',
          isFetchingReports: true,
        });
      }

      // Get reports by location
      const response = await getReportsByLatLon(latitude, longitude);

      console.log('API response:', response);

      // Dispatch to state management if dispatch is available
      if (this.dispatch && response && response.ok) {
        console.log('Response.reports', response.reports);

        // Transform the API response to match your state structure
        const transformedReports = this.transformApiResponse(
          response.reports.reports || [],
        );

        const transformedPayload = {
          reports: transformedReports,
          lastUpdated: new Date().toISOString(),
          totalReports: transformedReports.length,
          walletAddress: walletAddress,
        };

        console.log('Transformed payload:', transformedPayload);

        this.dispatch({
          type: 'UPDATE_REPORTS',
          payload: transformedPayload,
        });
      } else if (response && !response.ok) {
        console.error('API call failed:', response.error);
        if (this.dispatch) {
          this.dispatch({
            type: 'SET_FETCHING_REPORTS',
            isFetchingReports: false,
          });
        }
        return;
      }
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      if (this.dispatch) {
        this.dispatch({
          type: 'SET_FETCHING_REPORTS',
          isFetchingReports: false,
        });
      }
    }
  }

  async mockApiCall(walletAddress) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock data with some randomness to simulate real updates
    const mockReports = [
      {
        id: `report_${Date.now()}_1`,
        title: 'Litter Report',
        description: 'Found plastic bottles and cans',
        time: new Date().toLocaleTimeString(),
        status: 'pending',
        location: 'Central Park',
        severity: Math.random() > 0.5 ? 'high' : 'medium',
      },
      {
        id: `report_${Date.now()}_2`,
        title: 'Garbage Dump',
        description: 'Large pile of construction waste',
        time: new Date().toLocaleTimeString(),
        status: 'in_progress',
        location: 'Downtown Area',
        severity: 'high',
      },
      {
        id: `report_${Date.now()}_3`,
        title: 'Recycling Bin Overflow',
        description: 'Recycling bin is full and items are scattered',
        time: new Date().toLocaleTimeString(),
        status: 'completed',
        location: 'Shopping Mall',
        severity: 'low',
      },
    ];

    // Add some random reports occasionally
    if (Math.random() > 0.7) {
      mockReports.push({
        id: `report_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: 'Random Cleanup Needed',
        description: 'Additional cleanup required in the area',
        time: new Date().toLocaleTimeString(),
        status: 'pending',
        location: 'Various Locations',
        severity: Math.random() > 0.5 ? 'high' : 'medium',
      });
    }

    return {
      reports: mockReports,
      lastUpdated: new Date().toISOString(),
      totalReports: mockReports.length,
      walletAddress: walletAddress,
    };
  }

  // Transform API response to match our app's data structure
  transformApiResponse(apiReports) {
    if (!Array.isArray(apiReports)) {
      console.log('No reports array in API response');
      return [];
    }

    return apiReports.map((reportItem, index) => {
      const report = reportItem.report || {};
      const analysis = reportItem.analysis || [];

      // Get the primary analysis (usually the first one or English version)
      const primaryAnalysis =
        analysis.find(a => a.language === 'en') || analysis[0] || {};

      // Format timestamp
      // const timestamp = report.timestamp
      //   ? new Date(report.timestamp).toLocaleString()
      //   : '-';

      return {
        id: report.seq || `report_${index}`,
        title: primaryAnalysis.title || 'Untitled Report',
        description: primaryAnalysis.description || 'No description available',
        time: report.timestamp,
        status: 'pending', // Default status since API doesn't provide this
        location: `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`,
        severity: this.getSeverityLevel(primaryAnalysis.severity_level),
        // Additional fields from API
        seq: report.seq,
        walletAddress: report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        image: report.image,
        analysis: analysis,
        classification: primaryAnalysis.classification,
        brandName: primaryAnalysis.brand_display_name,
        litterProbability: primaryAnalysis.litter_probability,
        hazardProbability: primaryAnalysis.hazard_probability,
        digitalBugProbability: primaryAnalysis.digital_bug_probability,
        severityLevel: primaryAnalysis.severity_level,
        language: primaryAnalysis.language,
        createdAt: primaryAnalysis.created_at,
      };
    });
  }

  // Convert severity level number to readable string
  getSeverityLevel(level) {
    if (level === null || level === undefined) return '-';
    if (level >= 0.8) return 'Critical';
    if (level >= 0.6) return 'High';
    if (level >= 0.4) return 'Medium';
    if (level >= 0.2) return 'Low';
    return 'Very Low';
  }

  // Method to manually trigger a poll (useful for testing)
  async manualPoll() {
    await this.fetchData();
  }
}

export default new PollingService();
