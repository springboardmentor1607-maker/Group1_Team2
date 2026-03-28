# Zone Feature Explanation

## Overview
The "Zones" feature is an administrative tool designed to group and monitor civic issues based on geographical areas. It helps in identifying "hotspots" and prioritizing interventions.

## How to Use

### For Administrators
1. **Manage Zones**: Go to the **Admin Dashboard** and click on the **Zone Management** tab.
   - **Create**: Add new zones (e.g., "North District", "Downtown").
   - **Monitor**: Each zone shows a status color:
     - 🟢 **Green**: Healthy (0-1 active issues).
     - 🟡 **Yellow**: Needs attention (2-4 active issues).
     - 🔴 **Red**: Critical (5+ active issues).
   - **Edit/Delete**: Update zone names or descriptions.

2. **Visual Analytics**: Use the **Visual Report** button in the Admin Panel to see aggregated data, which can include zone-based distributions.

### For Citizens
1. **Report Issue**: When filing a new report in the **Report Issue** page:
   - Fill in the details (Title, Type, Priority).
   - Select the correct **Administrative Zone** from the dropdown menu.
   - This ensures your report is routed to the correct local responders.

## Why Use Zones?
- **Faster Response**: Issues are categorized by area, making it easier for volunteers to pick up tasks near them.
- **Resource Allocation**: Red zones signal where the most help is needed.
- **Data Insights**: Export CSV reports to analyze which zones have recurring types of issues.

## Current Implementation Status
- [x] Backend CRUD for Zones
- [x] Zone-based status calculation logic
- [x] Dropdown for zone selection in Report Issue page
- [x] Zone management table in Admin Dashboard
- [ ] Map visualization of zones (Could be a future enhancement)
