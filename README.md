

  # Astro Event Planner

  A comprehensive web application for finding auspicious dates and times based on Vedic astrology principles.

  **Website:** astroeventplanner.com

  ## Features

  - Find perfect muhurta (auspicious timing) for various life events
  - Daily Panchang with detailed astronomical data
  - Choghadiya timings
  - Personalized muhurta calculations based on your birth details
  - Countdown timers for upcoming events
  - Comprehensive knowledge base about Vedic astrology
  - Share and export features (PDF, Calendar, Social Media)

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Run `npm run build` to create a production build.

## Google AdSense and Analytics Setup

This project includes placeholder configurations for Google AdSense and Google Analytics. These services are disabled by default and only activate in production when proper IDs are configured.

### Initial Setup (After Deployment)

1. **Google AdSense Setup:**
   - Sign up for Google AdSense at https://www.google.com/adsense/
   - Complete the approval process for your deployed website
   - Once approved, obtain your Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)

2. **Google Analytics Setup:**
   - Create a Google Analytics account at https://analytics.google.com/
   - Set up a new property for your website
   - Obtain your Measurement ID (format: `G-XXXXXXXXXX`)

### Configuration

1. **Environment Variables:**
   Update the `.env` file with your actual IDs:
   ```
   VITE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Production Deployment:**
   - The scripts automatically activate only in production builds (`npm run build`)
   - Scripts will not load during development (`npm run dev`) to avoid tracking test data
   - Both services require valid IDs to function - empty values keep them disabled

### Security Features

- Scripts only load when both conditions are met:
  - Application is running in production mode
  - Valid IDs are provided in environment variables
- No tracking or ad serving occurs during development
- Environment variables are safely handled through Vite's built-in system

### Testing

After configuring the IDs and deploying to production:
1. Verify AdSense ads appear on your site (may take 24-48 hours after approval)
2. Check Google Analytics dashboard for visitor data
3. Use browser developer tools to confirm scripts are loading correctly  